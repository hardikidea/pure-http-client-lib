import { ExceptionManager } from '../src/core/ExceptionManager';
import { HttpError } from '../src/errors/HttpError';

describe('ExceptionManager', () => {
  it('should wrap a normal Error into HttpError', () => {
    const error = new Error('test error');
    const httpError = ExceptionManager.handle(error);

    expect(httpError).toBeInstanceOf(HttpError);
    expect(httpError.message).toBe('test error');
  });

  it('should wrap unknown errors into HttpError', () => {
    const httpError = ExceptionManager.handle('random unknown error');

    expect(httpError).toBeInstanceOf(HttpError);
    expect(httpError.message).toBe('Unknown error occurred');
  });
});
