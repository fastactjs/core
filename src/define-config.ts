import type { AppConfig } from './types';

/**
 * Helper function to define FastAct configuration with TypeScript inference
 *
 * @example
 * ```ts
 * // fastact.config.ts
 * import { defineConfig } from '@fastact/core'
 *
 * export default defineConfig({
 *   modules: ['./dist/**\/*.module.js'],
 *   modulesTs: ['./src/**\/*.module.ts'],
 * })
 * ```
 */
export function defineConfig<T extends AppConfig = AppConfig>(config: T): T {
  return config;
}
