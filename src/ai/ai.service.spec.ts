import {
  BadGatewayException,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiService } from './ai.service';

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
