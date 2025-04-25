import { AuthManager, AuthType } from '../src/core/AuthManager';

describe('AuthManager', () => {
  it('should apply Bearer token correctly', () => {
    const auth = new AuthManager({
      type: AuthType.BEARER,
      credentials: { token: 'token123' },
    });

    const req = auth.applyAuth({ method: 'GET', hostname: 'localhost' });
    expect(req.headers?.Authorization).toBe('Bearer token123');
  });

  it('should apply Basic auth correctly', () => {
    const auth = new AuthManager({
      type: AuthType.BASIC,
      credentials: { username: 'admin', password: '1234' },
    });

    const req = auth.applyAuth({ method: 'GET', hostname: 'localhost' });
    const authHeader = req.headers?.Authorization;
    expect(typeof authHeader).toBe('string');
    expect((authHeader as string).startsWith('Basic')).toBe(true);
  });

  it('should apply API key header correctly', () => {
    const auth = new AuthManager({
      type: AuthType.API_KEY_HEADER,
      credentials: { apiKey: 'apikey', headerName: 'X-API-KEY' },
    });

    const req = auth.applyAuth({ method: 'GET', hostname: 'localhost' });
    expect(req.headers?.['X-API-KEY']).toBe('apikey');
  });
});
