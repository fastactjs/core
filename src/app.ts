import chalk from 'chalk';
import fastify, { FastifyInstance } from 'fastify';
import { type ContainerInstance, fastactIocPlugin } from './ioc';
import type { NormalAppOptions, StandaloneAppOptions } from './types';
import {
  DEFAULT_SERVER_HOST,
  DEFAULT_SERVER_PORT,
  LOG_PREFIX,
} from './constants';

export type AppOptions = NormalAppOptions &
  StandaloneAppOptions & { runServer?: boolean };

export class App {
  private readonly container: ContainerInstance;
  private readonly server!: FastifyInstance;
  private readonly options: AppOptions;

  constructor(container: ContainerInstance, options: AppOptions = {}) {
    this.options = options;
    this.container = container;

    if (this.options.runServer !== false) {
      this.server = fastify(this.options.server);
      this.server.register(fastactIocPlugin, {
        container: this.container as any,
      });
    }
  }

  getContainer(): ContainerInstance {
    return this.container;
  }

  getServer(): FastifyInstance {
    if (!this.server) {
      throw new Error('Fastify server is not initialized in standalone mode');
    }
    return this.server;
  }

  async start(): Promise<void> {
    if (this.options.runServer === false) {
      // prettier-ignore
      console.log(`${LOG_PREFIX.WARN} Standalone context initialized (CLI mode)`);
      return;
    }

    // Защита для TypeScript (хотя при runServer !== false сервер точно есть)
    if (!this.server) return;

    const host = this.options.host ?? DEFAULT_SERVER_HOST;
    const port = this.options.port ?? DEFAULT_SERVER_PORT;

    try {
      await this.server.listen({ port, host });
      console.log(
        `${chalk.green.bold('[FastAct]')} Server is now listening on ${host}:${port}`
      );
    } catch (err) {
      // console.log(`${LOG_PREFIX.ERROR} ${err}`);
      throw err;
    }
  }

  async close(): Promise<void> {
    //if (this.container?.dispose) await this.container.dispose();

    await this.stopServer();

    if (this.options.runServer !== false) return;

    console.log(`${LOG_PREFIX.INFO} Standalone application stopped`);
    process.exit(0);
  }

  private async stopServer(): Promise<void> {
    if (!this.server) return;

    console.log(`${LOG_PREFIX.WARN} Shutting down the server...`);
    await this.server.close();
    console.log(`${LOG_PREFIX.INFO} Server gracefully stopped`);
  }
}
