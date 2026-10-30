import { type InjectionToken } from './types.js';

export * from './types.js';
export * from './container.js';
export * from './container-builder.js';
export * from './fastify-plugin.js';

/**
 * Creates a new injection token with the given description.
 */
export function createToken<T>(description: string): InjectionToken<T> {
  return Symbol(description) as InjectionToken<T>;
}
