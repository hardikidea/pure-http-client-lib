import { PureHttpClient } from '../src/core/PureHttpClient';

describe('PureHttpClient', () => {
  it('should instantiate successfully', () => {
    const client = new PureHttpClient({ baseUrl: 'https://api.example.com' });
    expect(client).toBeDefined();
  });
});
