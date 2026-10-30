export declare class ValidationError extends Error {
    readonly code = "E_VALIDATION_ERROR";
    readonly statusCode = 422;
    readonly errors: any[];
    constructor(rawErrors: any[]);
}
