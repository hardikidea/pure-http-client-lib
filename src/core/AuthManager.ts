import { HttpRequest } from './HttpRequest';

export enum AuthType {
  NONE = 'none',
  BEARER = 'bearer',
  BASIC = 'basic',
  API_KEY_HEADER = 'api_key_header',
  API_KEY_QUERY = 'api_key_query',
}

export interface AuthConfig {
  type: AuthType;
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    headerName?: string;
    queryName?: string;
  };
}

export class AuthManager {
  constructor(private authConfig: AuthConfig) {}

  applyAuth<T>(options: HttpRequest<T>): HttpRequest<T> {
    const updated = { ...options };
    if (!updated.headers) updated.headers = {};

    switch (this.authConfig.type) {
      case AuthType.NONE:
        break;
      case AuthType.BEARER:
        updated.headers['Authorization'] = `Bearer ${this.authConfig.credentials?.token}`;
        break;
      case AuthType.BASIC:
        const username = this.authConfig.credentials?.username ?? '';
        const password = this.authConfig.credentials?.password ?? '';
        const encoded = Buffer.from(`${username}:${password}`).toString('base64');
        updated.headers['Authorization'] = `Basic ${encoded}`;
        break;
      case AuthType.API_KEY_HEADER:
        updated.headers[this.authConfig.credentials?.headerName ?? 'X-API-KEY'] = this.authConfig.credentials?.apiKey ?? '';
        break;
      case AuthType.API_KEY_QUERY:
        break;
    }
    return updated;
  }
}