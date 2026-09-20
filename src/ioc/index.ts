import { type NewInjectionToken } from './types';

export * from './types';
export * from './container';
export * from './container-builder';
export * from './fastify-plugin';

export function createToken<T>(description: string): NewInjectionToken<T> {
  return Symbol(description) as NewInjectionToken<T>;
}
