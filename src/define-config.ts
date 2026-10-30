import type { AppConfig } from './types.js';

/**
 * Helper function to define FastAct configuration.
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
export function defineConfig(config: AppConfig): AppConfig {
  return config;
}
