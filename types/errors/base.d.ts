export declare abstract class FastactError extends Error {
    abstract readonly code: string;
    abstract readonly statusCode: number;
    constructor(message: string);
    get fullCode(): string;
}
