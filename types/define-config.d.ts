/**
 * Helper function to define FastAct configuration with TypeScript inference.
 *
 * @param {import('./types.js').AppConfig} config
 * @returns {import('./types.js').AppConfig}
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
export function defineConfig(config: import("./types.js").AppConfig): import("./types.js").AppConfig;
