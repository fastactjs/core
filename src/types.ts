import type {
  FastifyInstance,
  FastifyBaseLogger,
  FastifyServerOptions,
  RawServerBase,
  RawServerDefault,
} from 'fastify';
import { ContainerInstance } from './ioc';

export interface Application {
  getContainer(): ContainerInstance;
  getServer(): FastifyInstance;
  /** Starts the application. */
  start(): Promise<void>;
  /** Stops the application. */
  stop(): Promise<void>;
}

export interface ApplicationOptions<
  RawServer extends RawServerBase = RawServerDefault,
  Logger extends FastifyBaseLogger = FastifyBaseLogger,
> {
  host?: string;
  port?: number;
  runServer?: boolean;
  server?: FastifyServerOptions<RawServer, Logger>;
}
