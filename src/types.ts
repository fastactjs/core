import type {
  FastifyInstance,
  FastifyBaseLogger,
  FastifyServerOptions,
  RawServerBase,
  RawServerDefault,
  FastifyHttpOptions,
} from 'fastify';
import type { ContainerInstance } from './di/index.js';

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
  /** Path to the compiled JS module files to auto-load. */
  modules?: string[];
  /** Path to the TypeScript module files to auto-load. */
  modulesTs?: string[];
}
