import { type InjectionToken } from './types.js';
export * from './types.js';
export * from './container.js';
export * from './container-builder.js';
export * from './fastify-plugin.js';
/**
 * Creates a new injection token with the given string value.
 */
export declare function createToken<T>(value: string): InjectionToken<T>;
