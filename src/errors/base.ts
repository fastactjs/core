export abstract class FastactError extends Error {
  public abstract readonly code: string;
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public get fullCode(): string {
    return `FA_${this.code.toUpperCase()}`;
  }
}
