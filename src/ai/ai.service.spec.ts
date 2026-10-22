import {
  BadGatewayException,
  GatewayTimeoutException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  CreateInterviewContextDto,
  LlmProvider,
} from '../interview/interview.types';
import { AiService } from './ai.service';

describe.each<LlmProvider>(['gemini', 'openai', 'ollama'])(
  'AiService %s generation boundary',
  (provider) => {
    const originalEnv = process.env;
    const originalFetch = global.fetch;
    let loggerError: jest.SpyInstance;
    const privateProviderDetail = 'synthetic-secret-provider-detail';
    const context: CreateInterviewContextDto = {
      resumeText: 'Engenheiro de software com experiência em Node.js.',
      interviewType: 'Técnica (Coding/System Design)',
      jobLevel: 'Sênior',
      jobDescription: 'Desenvolvimento de APIs concorrentes.',
      companyName: 'Empresa Exemplo',
      companySegment: 'Tecnologia',
      responsePreference: 'equilibrada',
      aiBehavior: '',
    };
    const generationInput = {
      context,
      provider,
      detectedQuestion: 'Como você trata concorrência?',
      transcriptWindow: 'Entrevistador: Como você trata concorrência?',
    };
    const answer = {
      detectedQuestion: 'Como você trata concorrência?',
      suggestedAnswer: 'Uso transações curtas e idempotência.',
      shortVersion: 'Transações curtas e idempotência.',
      keyPoints: ['locks curtos', 'idempotência'],
      strategicNote: 'Explique o trade-off.',
    };

    function providerResponse(text: string) {
      return new Response(
        JSON.stringify(
          provider === 'gemini'
            ? { candidates: [{ content: { parts: [{ text }] } }] }
            : { choices: [{ message: { content: text } }] },
        ),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    async function expectSanitizedFailure(
      request: Promise<unknown>,
      exception: typeof BadGatewayException,
    ) {
      const error: unknown = await request.catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(exception);
      expect(JSON.stringify(error)).not.toContain(privateProviderDetail);
      expect(JSON.stringify(loggerError.mock.calls)).not.toContain(
        privateProviderDetail,
      );
    }

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        STT_TIMEOUT_MS: '5000',
        LLM_TIMEOUT_MS: '45000',
        GEMINI_API_KEY: 'synthetic-gemini-key',
        OPENAI_API_KEY: 'synthetic-openai-key',
        OLLAMA_API_KEY: 'synthetic-ollama-key',
        OPENAI_BASE_URL: 'https://openai.invalid/v1',
        OLLAMA_BASE_URL: 'https://ollama.invalid/v1',
        GEMINI_MODEL: 'synthetic-gemini-model',
        OPENAI_MODEL: 'synthetic-openai-model',
        OLLAMA_MODEL: 'synthetic-ollama-model',
      };
      global.fetch = jest.fn().mockRejectedValue(new Error('Unmocked request'));
      loggerError = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
    });

    afterEach(() => {
      process.env = originalEnv;
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    it.each([
      ['plain JSON', JSON.stringify(answer)],
      ['JSON code fence', `\`\`\`json\n${JSON.stringify(answer)}\n\`\`\``],
      ['plain code fence', `\`\`\`\n${JSON.stringify(answer)}\n\`\`\``],
      ['surrounding prose', `Resposta: ${JSON.stringify(answer)} Fim.`],
    ])('parses a valid structured response from %s', async (_label, text) => {
      global.fetch = jest.fn().mockResolvedValue(providerResponse(text));

      await expect(
        new AiService().generateSuggestedAnswer(generationInput),
      ).resolves.toEqual(answer);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('normalizes text and keeps at most three nonempty key points', async () => {
      global.fetch = jest.fn().mockResolvedValue(
        providerResponse(
          JSON.stringify({
            detectedQuestion: `  ${answer.detectedQuestion}  `,
            suggestedAnswer: `  ${answer.suggestedAnswer}  `,
            shortVersion: `  ${answer.shortVersion}  `,
            strategicNote: `  ${answer.strategicNote}  `,
            keyPoints: [
              ' locks curtos ',
              ' ',
              'idempotência',
              'retries',
              'extra',
            ],
          }),
        ),
      );

      await expect(
        new AiService().generateSuggestedAnswer(generationInput),
      ).resolves.toEqual({
        ...answer,
        keyPoints: ['locks curtos', 'idempotência', 'retries'],
      });
    });

    it('extracts JSON with braces and escaped quotes inside answer text', async () => {
      const structuredAnswer = {
        ...answer,
        suggestedAnswer:
          'Uso chaves {requestId} e digo "retries idempotentes".',
      };
      global.fetch = jest
        .fn()
        .mockResolvedValue(
          providerResponse(
            `Resposta: ${JSON.stringify(structuredAnswer)} Fim.`,
          ),
        );

      await expect(
        new AiService().generateSuggestedAnswer(generationInput),
      ).resolves.toEqual(structuredAnswer);
    });

    it.each([
      ['invalid JSON', `{invalid:${privateProviderDetail}`],
      [
        'missing fields',
        JSON.stringify({ detectedQuestion: privateProviderDetail }),
      ],
      ['empty key points', JSON.stringify({ ...answer, keyPoints: [] })],
      ['blank key points', JSON.stringify({ ...answer, keyPoints: [' ', ''] })],
      [
        'non-array key points',
        JSON.stringify({ ...answer, keyPoints: 'invalid' }),
      ],
      ['non-string answer', JSON.stringify({ ...answer, suggestedAnswer: 42 })],
    ])('rejects %s with a sanitized 502', async (_label, text) => {
      global.fetch = jest.fn().mockResolvedValue(providerResponse(text));

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        BadGatewayException,
      );
    });

    it.each<keyof typeof answer>([
      'detectedQuestion',
      'suggestedAnswer',
      'shortVersion',
      'keyPoints',
      'strategicNote',
    ])('rejects a response missing %s', async (field) => {
      const incompleteAnswer: Partial<typeof answer> = { ...answer };
      delete incompleteAnswer[field];
      global.fetch = jest
        .fn()
        .mockResolvedValue(providerResponse(JSON.stringify(incompleteAnswer)));

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        BadGatewayException,
      );
    });

    it.each([429, 500])(
      'maps upstream HTTP %s to a sanitized 502',
      async (status) => {
        global.fetch = jest
          .fn()
          .mockResolvedValue(new Response(privateProviderDetail, { status }));

        await expectSanitizedFailure(
          new AiService().generateSuggestedAnswer(generationInput),
          BadGatewayException,
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);
      },
    );

    it('maps a network failure to a sanitized 503 without retrying', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue(new TypeError(privateProviderDetail));

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        ServiceUnavailableException,
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('maps a provider timeout to a sanitized 504 without waiting or retrying', async () => {
      global.fetch = jest.fn().mockRejectedValue(
        Object.assign(new Error(privateProviderDetail), {
          name: 'TimeoutError',
        }),
      );

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        GatewayTimeoutException,
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
      const [, requestInit] = fetchMock.mock.calls[0];
      expect(requestInit?.signal).toBeInstanceOf(AbortSignal);
    });

    it('maps an invalid provider JSON envelope to a sanitized 502', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue(new Response(privateProviderDetail));

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        BadGatewayException,
      );
    });

    it.each(['', ' \n\t '])(
      'rejects empty provider content %j',
      async (text) => {
        global.fetch = jest.fn().mockResolvedValue(providerResponse(text));

        await expectSanitizedFailure(
          new AiService().generateSuggestedAnswer(generationInput),
          BadGatewayException,
        );
      },
    );

    it('rejects a provider envelope without candidates or choices', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: privateProviderDetail })),
        );

      await expectSanitizedFailure(
        new AiService().generateSuggestedAnswer(generationInput),
        BadGatewayException,
      );
    });

    if (provider !== 'ollama') {
      it('rejects an absent API key before calling the provider', async () => {
        delete process.env[
          provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY'
        ];

        await expectSanitizedFailure(
          new AiService().generateSuggestedAnswer(generationInput),
          ServiceUnavailableException,
        );
        expect(global.fetch).not.toHaveBeenCalled();
      });
    }
  },
);

describe('AiService STT boundary', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, STT_TIMEOUT_MS: '5000' };
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('keeps manual transcript precedence without calling STT', async () => {
    global.fetch = jest.fn();
    await expect(
      new AiService().transcribeLiveChunk({
        transcript: '  resposta manual  ',
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).resolves.toBe('resposta manual');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('maps STT network and invalid responses to sanitized gateway errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('secret endpoint'));
    await expect(
      new AiService().transcribeLiveChunk({
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(
      new AiService().transcribeLiveChunk({
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ text: '   ' }),
    });
    await expect(
      new AiService().transcribeLiveChunk({
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(BadGatewayException);

    for (const text of [42, 'x'.repeat(4_001)]) {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ text }),
      });
      await expect(
        new AiService().transcribeLiveChunk({
          audioBase64: 'dGVzdA==',
          mimeType: 'audio/webm',
        }),
      ).rejects.toBeInstanceOf(BadGatewayException);
    }
  });

  it('returns a normalized valid STT transcript', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ text: '  resposta transcrita  ' }),
    });
    await expect(
      new AiService().transcribeLiveChunk({
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).resolves.toBe('resposta transcrita');
  });

  it('maps aborts to gateway timeout', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('aborted'), { name: 'AbortError' }),
      );
    await expect(
      new AiService().transcribeLiveChunk({
        audioBase64: 'dGVzdA==',
        mimeType: 'audio/webm',
      }),
    ).rejects.toBeInstanceOf(GatewayTimeoutException);
  });

  it('blocks startup for invalid STT timeout configuration', () => {
    process.env.STT_TIMEOUT_MS = '4999';
    expect(() => new AiService()).toThrow(
      'STT_TIMEOUT_MS deve estar entre 5000 e 120000.',
    );
  });
});
