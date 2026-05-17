import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type {
  CreateInterviewContextDto,
  LlmProvider,
  SuggestedAnswerPayload,
} from '../interview/interview.types';

type GenerateInput = {
  context: CreateInterviewContextDto;
  detectedQuestion: string;
  transcriptWindow: string;
  provider?: LlmProvider;
  model?: string;
};

type GeminiCandidatePart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
  }>;
};

type OpenAiCompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private readonly defaultProvider =
    (process.env.LLM_PROVIDER as LlmProvider | undefined) ?? 'gemini';

  private readonly geminiApiKey = process.env.GEMINI_API_KEY;
  private readonly geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

  private readonly openAiApiKey = process.env.OPENAI_API_KEY;
  private readonly openAiBaseUrl =
    process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  private readonly openAiModel = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

  private readonly ollamaApiKey = process.env.OLLAMA_API_KEY;
  private readonly ollamaBaseUrl =
    process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1';
  private readonly ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';

  private readonly whisperBaseUrl =
    process.env.WHISPER_BASE_URL ?? 'http://localhost:8000';
  private readonly whisperModel =
    process.env.WHISPER_MODEL ?? 'Systran/faster-whisper-large-v3';
  private readonly whisperApiKey = process.env.WHISPER_API_KEY;

  private readonly maxResumeChars = 1800;
  private readonly maxJobDescriptionChars = 1200;
  private readonly maxCompanySegmentChars = 350;
  private readonly maxQuestionChars = 280;
  private readonly maxTranscriptChars = 1400;
  private readonly maxAiBehaviorChars = 280;
  private readonly llmTimeoutMs =
    Number(process.env.LLM_TIMEOUT_MS ?? '45000') || 45000;

  async transcribeLiveChunk(input: {
    transcript?: string;
    audioBase64?: string;
    mimeType?: string;
  }): Promise<string> {
    if (input.transcript && input.transcript.trim().length > 0) {
      return input.transcript.trim();
    }

    if (!input.audioBase64) {
      throw new BadRequestException(
        'Envie transcript ou audioBase64 para transcrição.',
      );
    }

    const mimeType = input.mimeType ?? 'audio/webm';
    const file = new Blob([Buffer.from(input.audioBase64, 'base64')], {
      type: mimeType,
    });
    const formData = new FormData();
    formData.append('file', file, 'chunk.webm');
    formData.append('model', this.whisperModel);

    const response = await fetch(
      `${this.whisperBaseUrl.replace(/\/$/, '')}/v1/audio/transcriptions`,
      {
        method: 'POST',
        headers: this.whisperApiKey
          ? { Authorization: `Bearer ${this.whisperApiKey}` }
          : undefined,
        body: formData,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new BadRequestException(
        `Falha na transcrição via Whisper/faster-whisper: ${body}`,
      );
    }

    const data = (await response.json()) as { text?: string };
    if (!data.text || !data.text.trim()) {
      throw new BadRequestException(
        'Transcrição vazia retornada pelo provedor STT.',
      );
    }

    return data.text.trim();
  }

  async generateSuggestedAnswer(
    input: GenerateInput,
  ): Promise<SuggestedAnswerPayload> {
    const provider = this.resolveProvider(input.provider);
    const model = this.resolveModel(provider, input.model);
    const prompt = this.buildPrompt(input);

    let outputText: string;
    if (provider === 'gemini') {
      outputText = await this.generateWithGemini(model, prompt);
    } else if (provider === 'openai') {
      outputText = await this.generateWithOpenAi(model, prompt);
    } else {
      outputText = await this.generateWithOllama(model, prompt);
    }

    const parsed = this.parseSuggestedAnswer(outputText);
    if (!parsed) {
      this.logger.error(
        `${provider} retornou JSON inválido para o contrato esperado. output=${this.truncate(outputText)}`,
      );
      throw new BadRequestException(
        `${provider} retornou resposta em formato inválido para o contrato esperado.`,
      );
    }

    return parsed;
  }

  private async generateWithGemini(
    model: string,
    prompt: string,
  ): Promise<string> {
    if (!this.geminiApiKey) {
      this.logger.error('GEMINI_API_KEY não configurada.');
      throw new BadRequestException(
        'LLM indisponível: GEMINI_API_KEY não configurada no backend.',
      );
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(this.geminiApiKey)}`;

    let response: Response;
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
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error(`Timeout ao chamar Gemini (${this.llmTimeoutMs}ms).`);
        throw new BadRequestException(
          `Gemini excedeu tempo limite de ${this.llmTimeoutMs}ms.`,
        );
      }
      this.logger.error('Erro de rede ao chamar Gemini.', error);
      throw new BadRequestException(
        'Falha ao comunicar com Gemini. Verifique conexão e configuração.',
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      const details = this.truncate(errorBody);
      this.logger.error(
        `Gemini retornou erro HTTP ${response.status}. body=${details}`,
      );
      throw new BadRequestException(
        `Falha no Gemini (${response.status}): ${details || 'sem detalhes'}`,
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const outputText = this.extractGeminiText(data);
    if (!outputText) {
      this.logger.error('Gemini retornou conteúdo vazio.');
      throw new BadRequestException(
        'Gemini retornou conteúdo vazio. Tente novamente.',
      );
    }

    return outputText;
  }

  private async generateWithOpenAi(
    model: string,
    prompt: string,
  ): Promise<string> {
    if (!this.openAiApiKey) {
      this.logger.error('OPENAI_API_KEY não configurada.');
      throw new BadRequestException(
        'LLM indisponível: OPENAI_API_KEY não configurada no backend.',
      );
    }

    return this.generateWithOpenAiCompatible({
      providerLabel: 'OpenAI',
      baseUrl: this.openAiBaseUrl,
      model,
      prompt,
      apiKey: this.openAiApiKey,
    });
  }

  private async generateWithOllama(
    model: string,
    prompt: string,
  ): Promise<string> {
    return this.generateWithOpenAiCompatible({
      providerLabel: 'Ollama',
      baseUrl: this.ollamaBaseUrl,
      model,
      prompt,
      apiKey: this.ollamaApiKey,
    });
  }

  private async generateWithOpenAiCompatible(input: {
    providerLabel: 'OpenAI' | 'Ollama';
    baseUrl: string;
    model: string;
    prompt: string;
    apiKey?: string;
  }): Promise<string> {
    const endpoint = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`;

    let response: Response;
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
              content:
                'Você responde apenas em JSON válido com as chaves: detectedQuestion, suggestedAnswer, shortVersion, keyPoints, strategicNote.',
            },
            { role: 'user', content: input.prompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
          max_tokens: 550,
          stream: false,
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error(
          `Timeout ao chamar ${input.providerLabel} (${this.llmTimeoutMs}ms).`,
        );
        throw new BadRequestException(
          `${input.providerLabel} excedeu tempo limite de ${this.llmTimeoutMs}ms.`,
        );
      }
      this.logger.error(
        `Erro de rede ao chamar ${input.providerLabel}.`,
        error,
      );
      throw new BadRequestException(
        `Falha ao comunicar com ${input.providerLabel}. Verifique conexão e configuração.`,
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      const details = this.truncate(errorBody);
      this.logger.error(
        `${input.providerLabel} retornou erro HTTP ${response.status}. body=${details}`,
      );
      throw new BadRequestException(
        `Falha no ${input.providerLabel} (${response.status}): ${details || 'sem detalhes'}`,
      );
    }

    const data = (await response.json()) as OpenAiCompatibleResponse;
    const outputText = data.choices?.[0]?.message?.content?.trim();
    if (!outputText) {
      this.logger.error(`${input.providerLabel} retornou conteúdo vazio.`);
      throw new BadRequestException(
        `${input.providerLabel} retornou conteúdo vazio. Tente novamente.`,
      );
    }

    return outputText;
  }

  private buildPrompt(input: GenerateInput): string {
    const compactContext = {
      resumeText: this.compactText(
        input.context.resumeText,
        this.maxResumeChars,
      ),
      interviewType: this.compactText(input.context.interviewType, 80),
      jobLevel: this.compactText(input.context.jobLevel, 40),
      jobDescription: this.compactText(
        input.context.jobDescription,
        this.maxJobDescriptionChars,
      ),
      companyName: this.compactText(input.context.companyName, 80),
      companySegment: this.compactText(
        input.context.companySegment ?? '',
        this.maxCompanySegmentChars,
      ),
      responsePreference: this.compactText(
        input.context.responsePreference,
        80,
      ),
      aiBehavior: this.compactText(
        input.context.aiBehavior ?? '',
        this.maxAiBehaviorChars,
      ),
    };

    const compactQuestion = this.compactText(
      input.detectedQuestion,
      this.maxQuestionChars,
    );
    const compactTranscript = this.compactText(
      input.transcriptWindow,
      this.maxTranscriptChars,
    );

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

  private resolveProvider(provider?: LlmProvider): LlmProvider {
    const resolved = provider ?? this.defaultProvider;
    if (
      resolved === 'gemini' ||
      resolved === 'openai' ||
      resolved === 'ollama'
    ) {
      return resolved;
    }
    throw new BadRequestException(`Provider LLM inválido: ${String(resolved)}`);
  }

  private resolveModel(provider: LlmProvider, requestedModel?: string): string {
    const configuredModel =
      provider === 'gemini'
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
      throw new BadRequestException(
        `Modelo não permitido para ${provider}: ${normalized}`,
      );
    }

    return normalized;
  }

  private getAllowedModels(
    provider: LlmProvider,
    configuredModel: string,
  ): Set<string> {
    const raw =
      provider === 'gemini'
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

  private extractGeminiText(data: GeminiResponse): string | null {
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

  private parseSuggestedAnswer(
    rawOutput: string,
  ): SuggestedAnswerPayload | null {
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
        const parsed = JSON.parse(candidate) as Partial<SuggestedAnswerPayload>;
        if (
          !parsed.detectedQuestion ||
          !parsed.suggestedAnswer ||
          !parsed.shortVersion ||
          !parsed.strategicNote ||
          !Array.isArray(parsed.keyPoints)
        ) {
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
      } catch {
        continue;
      }
    }

    return null;
  }

  private extractFirstJsonObject(text: string): string | null {
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

  private truncate(value: string, max = 400): string {
    const text = value.trim();
    if (text.length <= max) return text;
    return `${text.slice(0, max)}...`;
  }

  private compactText(value: string, max: number): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= max) return normalized;
    return `${normalized.slice(0, max)}...`;
  }
}
