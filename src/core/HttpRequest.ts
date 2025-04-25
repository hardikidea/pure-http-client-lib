import { RequestOptions } from 'http';

export interface HttpRequest<T = undefined> extends RequestOptions {
  data?: T;
  timeout?: number;
  retries?: number;
}