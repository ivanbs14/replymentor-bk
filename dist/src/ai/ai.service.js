"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    defaultProvider = process.env.LLM_PROVIDER ?? 'gemini';
    geminiApiKey = process.env.GEMINI_API_KEY;
    geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    openAiApiKey = process.env.OPENAI_API_KEY;
    openAiBaseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    openAiModel = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
    ollamaApiKey = process.env.OLLAMA_API_KEY;
    ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1';
    ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';
    whisperBaseUrl = process.env.WHISPER_BASE_URL ?? 'http://localhost:8000';
    whisperModel = process.env.WHISPER_MODEL ?? 'Systran/faster-whisper-large-v3';
    whisperApiKey = process.env.WHISPER_API_KEY;
    maxResumeChars = 1800;
    maxJobDescriptionChars = 1200;
    maxCompanySegmentChars = 350;
    maxQuestionChars = 280;
    maxTranscriptChars = 1400;
    maxAiBehaviorChars = 280;
    llmTimeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? '45000') || 45000;
    async transcribeLiveChunk(input) {
        if (input.transcript && input.transcript.trim().length > 0) {
            return input.transcript.trim();
        }
        if (!input.audioBase64) {
            throw new common_1.BadRequestException('Envie transcript ou audioBase64 para transcrição.');
        }
        const mimeType = input.mimeType ?? 'audio/webm';
        const file = new Blob([Buffer.from(input.audioBase64, 'base64')], {
            type: mimeType,
        });
        const formData = new FormData();
        formData.append('file', file, 'chunk.webm');
        formData.append('model', this.whisperModel);
        const response = await fetch(`${this.whisperBaseUrl.replace(/\/$/, '')}/v1/audio/transcriptions`, {
            method: 'POST',
            headers: this.whisperApiKey
                ? { Authorization: `Bearer ${this.whisperApiKey}` }
                : undefined,
            body: formData,
        });
        if (!response.ok) {
            const body = await response.text();
            throw new common_1.BadRequestException(`Falha na transcrição via Whisper/faster-whisper: ${body}`);
        }
        const data = (await response.json());
        if (!data.text || !data.text.trim()) {
            throw new common_1.BadRequestException('Transcrição vazia retornada pelo provedor STT.');
        }
        return data.text.trim();
    }
    async generateSuggestedAnswer(input) {
        const provider = this.resolveProvider(input.provider);
        const model = this.resolveModel(provider, input.model);
        const prompt = this.buildPrompt(input);
        let outputText;
        if (provider === 'gemini') {
            outputText = await this.generateWithGemini(model, prompt);
        }
        else if (provider === 'openai') {
            outputText = await this.generateWithOpenAi(model, prompt);
        }
        else {
            outputText = await this.generateWithOllama(model, prompt);
        }
        const parsed = this.parseSuggestedAnswer(outputText);
        if (!parsed) {
            this.logger.error(`${provider} retornou JSON inválido para o contrato esperado. output=${this.truncate(outputText)}`);
            throw new common_1.BadRequestException(`${provider} retornou resposta em formato inválido para o contrato esperado.`);
        }
        return parsed;
    }
    async generateWithGemini(model, prompt) {
        if (!this.geminiApiKey) {
            this.logger.error('GEMINI_API_KEY não configurada.');
            throw new common_1.BadRequestException('LLM indisponível: GEMINI_API_KEY não configurada no backend.');
        }
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
            `?key=${encodeURIComponent(this.geminiApiKey)}`;
        let response;
        const signal = AbortSignal.timeout(this.llmTimeoutMs);
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal,
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        responseMimeType: 'application/json',
                        maxOutputTokens: 500,
                    },
                }),
            });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                this.logger.error(`Timeout ao chamar Gemini (${this.llmTimeoutMs}ms).`);
                throw new common_1.BadRequestException(`Gemini excedeu tempo limite de ${this.llmTimeoutMs}ms.`);
            }
            this.logger.error('Erro de rede ao chamar Gemini.', error);
            throw new common_1.BadRequestException('Falha ao comunicar com Gemini. Verifique conexão e configuração.');
        }
        if (!response.ok) {
            const errorBody = await response.text();
            const details = this.truncate(errorBody);
            this.logger.error(`Gemini retornou erro HTTP ${response.status}. body=${details}`);
            throw new common_1.BadRequestException(`Falha no Gemini (${response.status}): ${details || 'sem detalhes'}`);
        }
        const data = (await response.json());
        const outputText = this.extractGeminiText(data);
        if (!outputText) {
            this.logger.error('Gemini retornou conteúdo vazio.');
            throw new common_1.BadRequestException('Gemini retornou conteúdo vazio. Tente novamente.');
        }
        return outputText;
    }
    async generateWithOpenAi(model, prompt) {
        if (!this.openAiApiKey) {
            this.logger.error('OPENAI_API_KEY não configurada.');
            throw new common_1.BadRequestException('LLM indisponível: OPENAI_API_KEY não configurada no backend.');
        }
        return this.generateWithOpenAiCompatible({
            providerLabel: 'OpenAI',
            baseUrl: this.openAiBaseUrl,
            model,
            prompt,
            apiKey: this.openAiApiKey,
        });
    }
    async generateWithOllama(model, prompt) {
        return this.generateWithOpenAiCompatible({
            providerLabel: 'Ollama',
            baseUrl: this.ollamaBaseUrl,
            model,
            prompt,
            apiKey: this.ollamaApiKey,
        });
    }
    async generateWithOpenAiCompatible(input) {
        const endpoint = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`;
        let response;
        const signal = AbortSignal.timeout(this.llmTimeoutMs);
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(input.apiKey ? { Authorization: `Bearer ${input.apiKey}` } : {}),
                },
                signal,
                body: JSON.stringify({
                    model: input.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'Você responde apenas em JSON válido com as chaves: detectedQuestion, suggestedAnswer, shortVersion, keyPoints, strategicNote.',
                        },
                        { role: 'user', content: input.prompt },
                    ],
                    temperature: 0.3,
                    response_format: { type: 'json_object' },
                    max_tokens: 550,
                    stream: false,
                }),
            });
        }
        catch (error) {
            if (error instanceof Error && error.name === 'TimeoutError') {
                this.logger.error(`Timeout ao chamar ${input.providerLabel} (${this.llmTimeoutMs}ms).`);
                throw new common_1.BadRequestException(`${input.providerLabel} excedeu tempo limite de ${this.llmTimeoutMs}ms.`);
            }
            this.logger.error(`Erro de rede ao chamar ${input.providerLabel}.`, error);
            throw new common_1.BadRequestException(`Falha ao comunicar com ${input.providerLabel}. Verifique conexão e configuração.`);
        }
        if (!response.ok) {
            const errorBody = await response.text();
            const details = this.truncate(errorBody);
            this.logger.error(`${input.providerLabel} retornou erro HTTP ${response.status}. body=${details}`);
            throw new common_1.BadRequestException(`Falha no ${input.providerLabel} (${response.status}): ${details || 'sem detalhes'}`);
        }
        const data = (await response.json());
        const outputText = data.choices?.[0]?.message?.content?.trim();
        if (!outputText) {
            this.logger.error(`${input.providerLabel} retornou conteúdo vazio.`);
            throw new common_1.BadRequestException(`${input.providerLabel} retornou conteúdo vazio. Tente novamente.`);
        }
        return outputText;
    }
    buildPrompt(input) {
        const compactContext = {
            resumeText: this.compactText(input.context.resumeText, this.maxResumeChars),
            interviewType: this.compactText(input.context.interviewType, 80),
            jobLevel: this.compactText(input.context.jobLevel, 40),
            jobDescription: this.compactText(input.context.jobDescription, this.maxJobDescriptionChars),
            companyName: this.compactText(input.context.companyName, 80),
            companySegment: this.compactText(input.context.companySegment ?? '', this.maxCompanySegmentChars),
            responsePreference: this.compactText(input.context.responsePreference, 80),
            aiBehavior: this.compactText(input.context.aiBehavior ?? '', this.maxAiBehaviorChars),
        };
        const compactQuestion = this.compactText(input.detectedQuestion, this.maxQuestionChars);
        const compactTranscript = this.compactText(input.transcriptWindow, this.maxTranscriptChars);
        const behaviorInstruction = compactContext.aiBehavior
            ? [
                `Como você deve agir: ${compactContext.aiBehavior}`,
                'Aja como se fosse o candidato entrevistado e escreva em primeira pessoa.',
                'Não responda como avaliador, recrutador ou observador externo.',
            ]
            : [];
        return [
            'Você é um copiloto de entrevistas.',
            'Responda em português brasileiro.',
            'Não invente experiências além do contexto.',
            'Retorne JSON válido com chaves exatas:',
            'detectedQuestion, suggestedAnswer, shortVersion, keyPoints, strategicNote.',
            'Regras de formato (obrigatórias):',
            '- Não use markdown, não use crases, não use comentários.',
            '- keyPoints deve ter no máximo 3 itens curtos.',
            '- suggestedAnswer deve ter no máximo 600 caracteres.',
            '- shortVersion deve ter no máximo 180 caracteres.',
            '- strategicNote deve ter no máximo 220 caracteres.',
            '',
            `Tipo de entrevista: ${compactContext.interviewType}`,
            `Nível da vaga: ${compactContext.jobLevel}`,
            `Empresa: ${compactContext.companyName}`,
            `Contexto da empresa: ${compactContext.companySegment || 'N/A'}`,
            `Preferência de resposta: ${compactContext.responsePreference}`,
            ...behaviorInstruction,
            `Resumo do candidato: ${compactContext.resumeText}`,
            `Descrição da vaga (resumo): ${compactContext.jobDescription}`,
            `Pergunta identificada: ${compactQuestion}`,
            `Trecho recente da conversa: ${compactTranscript}`,
        ].join('\n');
    }
    resolveProvider(provider) {
        const resolved = provider ?? this.defaultProvider;
        if (resolved === 'gemini' ||
            resolved === 'openai' ||
            resolved === 'ollama') {
            return resolved;
        }
        throw new common_1.BadRequestException(`Provider LLM inválido: ${String(resolved)}`);
    }
    resolveModel(provider, requestedModel) {
        const configuredModel = provider === 'gemini'
            ? this.geminiModel
            : provider === 'openai'
                ? this.openAiModel
                : this.ollamaModel;
        const allowedModels = this.getAllowedModels(provider, configuredModel);
        if (!requestedModel || requestedModel.trim().length === 0) {
            return configuredModel;
        }
        const normalized = requestedModel.trim();
        if (!allowedModels.has(normalized)) {
            throw new common_1.BadRequestException(`Modelo não permitido para ${provider}: ${normalized}`);
        }
        return normalized;
    }
    getAllowedModels(provider, configuredModel) {
        const raw = provider === 'gemini'
            ? process.env.GEMINI_ALLOWED_MODELS
            : provider === 'openai'
                ? process.env.OPENAI_ALLOWED_MODELS
                : process.env.OLLAMA_ALLOWED_MODELS;
        const models = raw
            ? raw
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : [];
        if (models.length === 0) {
            return new Set([configuredModel]);
        }
        return new Set(models);
    }
    extractGeminiText(data) {
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts;
        if (!parts || parts.length === 0) {
            return null;
        }
        const text = parts
            .map((part) => part.text ?? '')
            .join('')
            .trim();
        return text.length > 0 ? text : null;
    }
    parseSuggestedAnswer(rawOutput) {
        const output = rawOutput
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/, '')
            .trim();
        const candidates = [output];
        const extracted = this.extractFirstJsonObject(output);
        if (extracted && extracted !== output) {
            candidates.push(extracted);
        }
        for (const candidate of candidates) {
            try {
                const parsed = JSON.parse(candidate);
                if (!parsed.detectedQuestion ||
                    !parsed.suggestedAnswer ||
                    !parsed.shortVersion ||
                    !parsed.strategicNote ||
                    !Array.isArray(parsed.keyPoints)) {
                    continue;
                }
                const keyPoints = parsed.keyPoints
                    .map((point) => String(point).trim())
                    .filter(Boolean)
                    .slice(0, 3);
                if (keyPoints.length === 0) {
                    continue;
                }
                return {
                    detectedQuestion: parsed.detectedQuestion.trim(),
                    suggestedAnswer: parsed.suggestedAnswer.trim(),
                    shortVersion: parsed.shortVersion.trim(),
                    keyPoints,
                    strategicNote: parsed.strategicNote.trim(),
                };
            }
            catch {
                continue;
            }
        }
        return null;
    }
    extractFirstJsonObject(text) {
        let start = -1;
        let depth = 0;
        let inString = false;
        let escaped = false;
        for (let i = 0; i < text.length; i += 1) {
            const ch = text[i];
            if (start === -1) {
                if (ch === '{') {
                    start = i;
                    depth = 1;
                }
                continue;
            }
            if (inString) {
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = false;
                }
                continue;
            }
            if (ch === '"') {
                inString = true;
                continue;
            }
            if (ch === '{') {
                depth += 1;
                continue;
            }
            if (ch === '}') {
                depth -= 1;
                if (depth === 0) {
                    return text.slice(start, i + 1).trim();
                }
            }
        }
        return null;
    }
    truncate(value, max = 400) {
        const text = value.trim();
        if (text.length <= max)
            return text;
        return `${text.slice(0, max)}...`;
    }
    compactText(value, max) {
        const normalized = value.replace(/\s+/g, ' ').trim();
        if (normalized.length <= max)
            return normalized;
        return `${normalized.slice(0, max)}...`;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map