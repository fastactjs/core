import chalk from 'chalk';
import fastify, { FastifyInstance } from 'fastify';
import type { ContainerInstance } from './ioc';
import type { ApplicationOptions, Application } from './types';
import { DEFAULT_SERVER_HOST, DEFAULT_SERVER_PORT } from './constants';

export class App implements Application {
  private readonly container: ContainerInstance;
  private readonly server: FastifyInstance;
  private readonly options: ApplicationOptions;

  constructor(container: ContainerInstance, options: ApplicationOptions = {}) {
    this.options = options;
    this.container = container;

    this.server = fastify(this.options.server);
  }

  getContainer(): ContainerInstance {
    return this.container;
  }

  getServer(): FastifyInstance {
    return this.server;
  }

  async start(): Promise<void> {
    /** Exit immediately when running as a CLI command or worker without a server. */
    if (this.options.runServer === false) {
      console.log(chalk.yellow('FastAct initialized in standalone (CLI) mode'));
      return;
    }

    const host = this.options.host ?? DEFAULT_SERVER_HOST;
    const port = this.options.port ?? DEFAULT_SERVER_PORT;

    try {
      await this.server.ready();
      await this.server.listen({ port, host });
      console.log(
        `${chalk.green.bold('[fastact]')} Server is now listening on ${host}:${port}`
      );
    } catch (err) {
      console.log(`${chalk.red.bold('[fastact]')} ${err}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    console.log(
      `${chalk.yellow.bold('[fastact] Shutting down the server...')}`
    );
    await this.server.close();
    console.log(
      chalk.bgGreenBright.bold('[fastact] Server gracefully stopped')
    );
  }
}
