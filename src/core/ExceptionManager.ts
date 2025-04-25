import { HttpError } from '../errors/HttpError';

export class ExceptionManager {
  static handle(error: unknown): HttpError {
    if (error instanceof Error) {
      return new HttpError(error.message);
    }
    return new HttpError('Unknown error occurred');
  }
}