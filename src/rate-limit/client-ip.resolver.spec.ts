import type { Request } from 'express';
import { ClientIpResolver } from './client-ip.resolver';

function request(input: Partial<Request>): Request {
  return input as Request;
}

describe('ClientIpResolver', () => {
  it('uses only a valid CF-Connecting-IP on Render', () => {
    const resolver = new ClientIpResolver('render');
    expect(
      resolver.resolve(
        request({
          headers: {
            'cf-connecting-ip': '203.0.113.8',
            'x-forwarded-for': '198.51.100.99',
          },
        }),
      ),
    ).toBe('203.0.113.8');
  });

  it.each([undefined, '', 'unknown', '203.0.113.8, 198.51.100.2'])(
    'rejects an unsafe Render client IP value %s',
    (value) => {
      const resolver = new ClientIpResolver('render');
      expect(
        resolver.resolve(request({ headers: { 'cf-connecting-ip': value } })),
      ).toBeNull();
    },
  );

  it('rejects repeated Render headers', () => {
    const resolver = new ClientIpResolver('render');
    expect(
      resolver.resolve(
        request({ headers: { 'cf-connecting-ip': ['203.0.113.8'] } }),
      ),
    ).toBeNull();
  });

  it('keeps the existing Express IP strategy outside Render', () => {
    const resolver = new ClientIpResolver('express');
    expect(
      resolver.resolve(
        request({
          ip: '192.0.2.4',
          headers: {},
          socket: {} as Request['socket'],
        }),
      ),
    ).toBe('192.0.2.4');
  });
});
