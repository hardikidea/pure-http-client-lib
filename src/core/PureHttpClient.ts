import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { EventEmitter } from 'events';
import { HttpRequest } from './HttpRequest';
import { HttpResponse } from './HttpResponse';
import { ExceptionManager } from './ExceptionManager';
import { DEFAULT_TIMEOUT, DEFAULT_RETRY_COUNT, DEFAULT_RETRY_DELAY } from '../config/constants';

export class PureHttpClient extends EventEmitter {
  private baseUrl: string;

  constructor(config: { baseUrl: string }) {
    super();
    this.baseUrl = config.baseUrl;
  }

  async send<T>(request: HttpRequest, signal?: AbortSignal): Promise<HttpResponse<T>> {
    const url = new URL(request.path ?? '', this.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port ? Number(url.port) : (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: request.method,
      headers: request.headers,
      timeout: request.timeout ?? DEFAULT_TIMEOUT,
    };

    const retries = request.retries ?? DEFAULT_RETRY_COUNT;

    return this.tryRequest<T>(client, options, request.data, retries, signal);
  }

  private tryRequest<T>(
    client: typeof http | typeof https,
    options: http.RequestOptions,
    data: any,
    retries: number,
    signal?: AbortSignal
  ): Promise<HttpResponse<T>> {
    return new Promise<HttpResponse<T>>((resolve, reject) => {
      const req = client.request(options, (res) => {
        let body = '';
        const total = Number(res.headers['content-length']) || 0;
        let loaded = 0;

        res.on('data', (chunk) => {
          loaded += chunk.length;
          this.emit('progress:update', {
            type: 'download',
            percent: Math.round((loaded * 100) / total)
          });
          body += chunk.toString();
        });

        res.on('end', () => {
          const safeHeaders: Record<string, string | string[]> = {};

          for (const key in res.headers) {
            const value = res.headers[key];
            if (value !== undefined) {
              safeHeaders[key] = value;
            }
          }

          resolve({
            status: res.statusCode ?? 0,
            headers: safeHeaders,
            data: JSON.parse(body),
          });
        });
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          req.destroy();
          reject(new Error('Request Aborted'));
        });
      }

      req.on('timeout', () => {
        req.destroy();
        if (retries > 0) {
          setTimeout(() => {
            this.tryRequest<T>(client, options, data, retries - 1, signal)
              .then((resp) => resolve(resp))
              .catch(reject);
          }, DEFAULT_RETRY_DELAY);
        } else {
          reject(new Error('Request Timeout'));
        }
      });

      req.on('error', (err) => {
        if (retries > 0) {
          setTimeout(() => {
            this.tryRequest<T>(client, options, data, retries - 1, signal)
              .then((resp) => resolve(resp))
              .catch(reject);
          }, DEFAULT_RETRY_DELAY);
        } else {
          reject(ExceptionManager.handle(err));
        }
      });

      if (data) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        req.write(payload);
      }

      req.end();
    });
  }
}
