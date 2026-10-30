import type {
  FastifyInstance,
  FastifyBaseLogger,
  FastifyServerOptions,
  RawServerBase,
  RawServerDefault,
  FastifyHttpOptions,
} from 'fastify';
import type { ContainerInstance, ContainerModule } from './ioc';

export interface Application {
  getContainer(): ContainerInstance;
  getServer(): FastifyInstance;
  /** Close the application. */
  close(): Promise<void>;
}
/** 
export interface ApplicationOptions<
  RawServer extends RawServerBase = RawServerDefault,
  Logger extends FastifyBaseLogger = FastifyBaseLogger,
> {
  host?: string;
  port?: number;
  // runServer?: boolean;
  server?: FastifyServerOptions<RawServer, Logger>;
}
**/
export interface NormalAppOptions {
  host?: string;
  port?: number;
  server?: FastifyHttpOptions<any>;
}

export interface StandaloneAppOptions {}

export interface AppConfig {
  /**
   * Glob patterns for compiled JS module files to auto-load.
   *
   * @example
   * ```js
   *   modules: ['./dist/**\/*.module.js'],
   * ```
   */
  modules?: string[];
  /**
   * Glob patterns for TypeScript module files to auto-load.
   *
   * @example
   * ```ts
   * modulesTs: ['./src/**\/*.module.ts'],
   * ```
   */
  modulesTs?: string[];
}
