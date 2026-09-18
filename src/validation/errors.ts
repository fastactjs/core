export class ValidationError extends Error {
  public readonly code = 'E_VALIDATION_ERROR';
  public readonly statusCode = 422;
  public readonly errors: any[];

  constructor(rawErrors: any[]) {
    super('Validation failed');

    this.name = 'ValidationError';
    this.errors = rawErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
