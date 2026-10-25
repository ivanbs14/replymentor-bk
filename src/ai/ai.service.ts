import {
  BadRequestException,
  Injectable,
  Optional,
  PayloadTooLargeException,
} from '@nestjs/common';
import {
  ProviderBadGatewayException,
  ProviderTimeoutException,
  ProviderUnavailableException,
} from '../common/api-exception.filter';
import { MAX_AUDIO_BYTES, MAX_TRANSCRIPT_CHARS } from '../common/api-contract';
import type {
  CreateInterviewContextDto,
  LlmProvider,
  SuggestedAnswerPayload,
} from '../interview/interview.types';
import type {
  SessionSummaryContext,
  SessionSummaryTarget,
} from '../interview/session-summary.types';
import { OperationalLogger } from '../observability/operational-logger';

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
  constructor(@Optional() private readonly logger = new OperationalLogger()) {}

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
  private readonly sttTimeoutMs = this.readTimeout(
    'STT_TIMEOUT_MS',
    60_000,
    5_000,
    120_000,
  );

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
      this.logger.info({ event: 'stt', outcome: 'manual', durationMs: 0 });
      return input.transcript.trim();
    }

    if (!input.audioBase64) {
      throw new BadRequestException(
        'Envie transcript ou audioBase64 para transcrição.',
      );
    }

    const mimeType = input.mimeType ?? 'audio/webm';
    const audio = Buffer.from(input.audioBase64, 'base64');
    if (audio.byteLength > MAX_AUDIO_BYTES) {
      throw new PayloadTooLargeException('Áudio excede o limite permitido.');
    }
    const file = new Blob([audio], {
      type: mimeType,
    });
    const formData = new FormData();
    formData.append('file', file, `chunk.${this.audioExtension(mimeType)}`);
    formData.append('model', this.whisperModel);

    const startedAt = Date.now();
    let response: Response;
    try {
      response = await fetch(
        `${this.whisperBaseUrl.replace(/\/$/, '')}/v1/audio/transcriptions`,
        {
          method: 'POST',
          headers: this.whisperApiKey
            ? { Authorization: `Bearer ${this.whisperApiKey}` }
            : undefined,
          body: formData,
          signal: AbortSignal.timeout(this.sttTimeoutMs),
        },
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      if (
        error instanceof Error &&
        ['TimeoutError', 'AbortError'].includes(error.name)
      ) {
        this.logger.warn({
          event: 'stt',
          provider: 'whisper',
          outcome: 'timeout',
          durationMs,
        });
        throw new ProviderTimeoutException();
      }
      this.logger.warn({
        event: 'stt',
        provider: 'whisper',
        outcome: 'network_error',
        durationMs,
      });
      throw new ProviderUnavailableException();
    }

    if (!response.ok) {
      this.logger.warn({
        event: 'stt',
        provider: 'whisper',
        outcome: 'http_error',
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
      });
      throw new ProviderBadGatewayException();
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      this.logger.warn({
        event: 'stt',
        provider: 'whisper',
        outcome: 'invalid_json',
        durationMs: Date.now() - startedAt,
      });
      throw new ProviderBadGatewayException();
    }
    const text =
      typeof data === 'object' &&
      data !== null &&
      typeof Reflect.get(data, 'text') === 'string'
        ? (Reflect.get(data, 'text') as string).trim()
        : '';
    if (!text || text.length > MAX_TRANSCRIPT_CHARS) {
      this.logger.warn({
        event: 'stt',
        provider: 'whisper',
        outcome: 'invalid_response',
        durationMs: Date.now() - startedAt,
      });
      throw new ProviderBadGatewayException();
    }

    this.logger.info({
      event: 'stt',
      provider: 'whisper',
      model: this.whisperModel,
      outcome: 'success',
      durationMs: Date.now() - startedAt,
    });
    return text;
  }

  async generateSuggestedAnswer(
    input: GenerateInput,
  ): Promise<SuggestedAnswerPayload> {
    const { provider, model } = this.resolveGenerationTarget(
      input.provider,
      input.model,
    );
    const prompt = this.buildPrompt(input);
    const started = performance.now();
    let outcome = 'error';
    try {
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
        outcome = 'invalid_contract';
        throw new ProviderBadGatewayException();
      }
      outcome = 'success';
      return parsed;
    } finally {
      this.logger.emit(outcome === 'success' ? 'info' : 'error', {
        event: 'llm_generation',
        provider,
        model,
        outcome,
        durationMs: performance.now() - started,
      });
    }
  }

  async generateSessionSummary(input: {
    context: SessionSummaryContext;
    target: SessionSummaryTarget;
  }): Promise<string> {
    const prompt = this.buildSessionSummaryPrompt(input.context);
    const timeoutMs = 15_000;
    if (input.target.provider === 'gemini') {
      return this.generateWithGemini(
        input.target.model,
        prompt,
        timeoutMs,
        1_600,
      );
    }
    const providerLabel =
      input.target.provider === 'openai' ? 'OpenAI' : 'Ollama';
    const baseUrl =
      input.target.provider === 'openai'
        ? this.openAiBaseUrl
        : this.ollamaBaseUrl;
    const apiKey =
      input.target.provider === 'openai'
        ? this.openAiApiKey
        : this.ollamaApiKey;
    if (input.target.provider === 'openai' && !apiKey) {
      this.logger.error({
        event: 'llm_provider',
        provider: input.target.provider,
        model: input.target.model,
        outcome: 'config_error',
        durationMs: 0,
      });
      throw new ProviderUnavailableException();
    }
    return this.generateWithOpenAiCompatible({
      providerLabel,
      baseUrl,
      model: input.target.model,
      prompt,
      apiKey,
      timeoutMs,
      maxTokens: 1_600,
      systemPrompt:
        'Você produz somente JSON válido e descritivo, sem nota, ranking ou recomendação de contratação.',
    });
  }

  resolveGenerationTarget(provider?: LlmProvider, model?: string) {
    const resolvedProvider = this.resolveProvider(provider);
    return {
      provider: resolvedProvider,
      model: this.resolveModel(resolvedProvider, model),
    };
  }

  private async generateWithGemini(
    model: string,
    prompt: string,
    timeoutMs = this.llmTimeoutMs,
    maxOutputTokens = 500,
  ): Promise<string> {
    const started = performance.now();
    if (!this.geminiApiKey) {
      this.logger.error({
        event: 'llm_provider',
        provider: 'gemini',
        model,
        outcome: 'config_error',
        durationMs: performance.now() - started,
      });
      throw new ProviderUnavailableException();
    }

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(this.geminiApiKey)}`;

    let response: Response;
    const signal = AbortSignal.timeout(timeoutMs);
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
            maxOutputTokens,
          },
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error({
          event: 'llm_provider',
          provider: 'gemini',
          model,
          outcome: 'timeout',
          durationMs: performance.now() - started,
        });
        throw new ProviderTimeoutException();
      }
      this.logger.error({
        event: 'llm_provider',
        provider: 'gemini',
        model,
        outcome: 'network_error',
        durationMs: performance.now() - started,
      });
      throw new ProviderUnavailableException();
    }

    if (!response.ok) {
      this.logger.error({
        event: 'llm_provider',
        provider: 'gemini',
        model,
        outcome: 'http_error',
        statusCode: response.status,
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }

    let data: GeminiResponse;
    try {
      data = (await response.json()) as GeminiResponse;
    } catch {
      this.logger.error({
        event: 'llm_provider',
        provider: 'gemini',
        model,
        outcome: 'invalid_json',
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }
    const outputText = this.extractGeminiText(data);
    if (!outputText) {
      this.logger.error({
        event: 'llm_provider',
        provider: 'gemini',
        model,
        outcome: 'empty_response',
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }

    this.logger.info({
      event: 'llm_provider',
      provider: 'gemini',
      model,
      outcome: 'success',
      durationMs: performance.now() - started,
    });
    return outputText;
  }

  private async generateWithOpenAi(
    model: string,
    prompt: string,
  ): Promise<string> {
    const started = performance.now();
    if (!this.openAiApiKey) {
      this.logger.error({
        event: 'llm_provider',
        provider: 'openai',
        model,
        outcome: 'config_error',
        durationMs: performance.now() - started,
      });
      throw new ProviderUnavailableException();
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
    timeoutMs?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<string> {
    const started = performance.now();
    const endpoint = `${input.baseUrl.replace(/\/$/, '')}/chat/completions`;

    let response: Response;
    const timeoutMs = input.timeoutMs ?? this.llmTimeoutMs;
    const signal = AbortSignal.timeout(timeoutMs);
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
                input.systemPrompt ??
                'Você responde apenas em JSON válido com as chaves: detectedQuestion, suggestedAnswer, shortVersion, keyPoints, strategicNote.',
            },
            { role: 'user', content: input.prompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
          max_tokens: input.maxTokens ?? 550,
          stream: false,
        }),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error({
          event: 'llm_provider',
          provider: input.providerLabel.toLowerCase(),
          model: input.model,
          outcome: 'timeout',
          durationMs: performance.now() - started,
        });
        throw new ProviderTimeoutException();
      }
      this.logger.error({
        event: 'llm_provider',
        provider: input.providerLabel.toLowerCase(),
        model: input.model,
        outcome: 'network_error',
        durationMs: performance.now() - started,
      });
      throw new ProviderUnavailableException();
    }

    if (!response.ok) {
      this.logger.error({
        event: 'llm_provider',
        provider: input.providerLabel.toLowerCase(),
        model: input.model,
        outcome: 'http_error',
        statusCode: response.status,
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }

    let data: OpenAiCompatibleResponse;
    try {
      data = (await response.json()) as OpenAiCompatibleResponse;
    } catch {
      this.logger.error({
        event: 'llm_provider',
        provider: input.providerLabel.toLowerCase(),
        model: input.model,
        outcome: 'invalid_json',
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }
    const outputText = data.choices?.[0]?.message?.content?.trim();
    if (!outputText) {
      this.logger.error({
        event: 'llm_provider',
        provider: input.providerLabel.toLowerCase(),
        model: input.model,
        outcome: 'empty_response',
        durationMs: performance.now() - started,
      });
      throw new ProviderBadGatewayException();
    }

    this.logger.info({
      event: 'llm_provider',
      provider: input.providerLabel.toLowerCase(),
      model: input.model,
      outcome: 'success',
      durationMs: performance.now() - started,
    });
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

  private buildSessionSummaryPrompt(context: SessionSummaryContext): string {
    return [
      'Gere um resumo fiel desta sessão de entrevista em português brasileiro.',
      'Use somente os dados fornecidos. Não atribua competências ou fatos não evidenciados.',
      'Não dê nota, ranking nem recomendação de contratação.',
      'Pontos fortes e melhorias devem conter evidenceResponseId exatamente igual ao id de uma resposta fornecida.',
      'Retorne JSON com estas chaves exatas:',
      'overview, questions, topics, strengths, improvements, nextSteps.',
      'questions: [{"question":"...","answerSummary":"..."}]',
      'strengths e improvements: [{"text":"...","evidenceResponseId":"..."}]',
      'Blocos sem evidência devem ser arrays vazios. Não use markdown ou comentários.',
      '',
      JSON.stringify(context),
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

  private readTimeout(
    name: string,
    fallback: number,
    min: number,
    max: number,
  ): number {
    const raw = process.env[name]?.trim();
    if (!raw) return fallback;
    if (!/^\d+$/.test(raw))
      throw new Error(`${name} deve ser um inteiro entre ${min} e ${max}.`);
    const value = Number(raw);
    if (value < min || value > max)
      throw new Error(`${name} deve estar entre ${min} e ${max}.`);
    return value;
  }

  private audioExtension(mimeType: string): string {
    if (mimeType === 'audio/ogg') return 'ogg';
    if (mimeType === 'audio/mp4') return 'mp4';
    if (mimeType === 'audio/mpeg') return 'mp3';
    if (mimeType === 'audio/wav') return 'wav';
    return 'webm';
  }

  private compactText(value: string, max: number): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized.length <= max) return normalized;
    return `${normalized.slice(0, max)}...`;
  }
}
