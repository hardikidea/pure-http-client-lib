import { EventEmitter } from 'events';
import { RequestOptions } from 'http';

interface HttpRequest<T = undefined> extends RequestOptions {
    data?: T;
    timeout?: number;
    retries?: number;
}

interface HttpResponse<T> {
    status: number;
    headers: Record<string, string | string[]>;
    data: T;
}

declare class PureHttpClient extends EventEmitter {
    private baseUrl;
    constructor(config: {
        baseUrl: string;
    });
    send<T>(request: HttpRequest, signal?: AbortSignal): Promise<HttpResponse<T>>;
    private tryRequest;
}

declare class HttpError extends Error {
    status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}

declare enum AuthType {
    NONE = "none",
    BEARER = "bearer",
    BASIC = "basic",
    API_KEY_HEADER = "api_key_header",
    API_KEY_QUERY = "api_key_query"
}
interface AuthConfig {
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
declare class AuthManager {
    private authConfig;
    constructor(authConfig: AuthConfig);
    applyAuth<T>(options: HttpRequest<T>): HttpRequest<T>;
}

declare class ExceptionManager {
    static handle(error: unknown): HttpError;
}

export { type AuthConfig, AuthManager, AuthType, ExceptionManager, HttpError, type HttpRequest, type HttpResponse, PureHttpClient };
