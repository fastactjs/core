import { App } from './app.js';
import { ContainerBuilder } from './di/index.js';
import type { NormalAppOptions, StandaloneAppOptions } from './types.js';

/**
 * @deprecated Use the createApp or createStandaloneApp functions instead.
 */
export class AppFactory {
  // prettier-ignore
  static async create(options?: NormalAppOptions): Promise<App> {
    const container = await new ContainerBuilder().build();
    return new App(container, { runServer: true, ...options });
  }

  // prettier-ignore
  static async createStandalone(options?: StandaloneAppOptions): Promise<App> {
    const container = await new ContainerBuilder().build();
    return new App(container, { runServer: false, ...options });
  }
}

/**
 * Creates a new application instance with an HTTP server powered by Fastify.
 * Use this for standard web applications, APIs, and microservices.
 *
 * @param options The configuration options for the web application.
 * @returns A promise that resolves to the created app instance.
 */
export async function createApp(options?: NormalAppOptions): Promise<App> {
  const container = await new ContainerBuilder().build();
  return new App(container, { runServer: true, ...options });
}

/**
 * Creates a new standalone application instance without an HTTP server.
 * Use this for scripts, cron jobs, migration runners, or CLI tools.
 *
 * @param options The configuration options for the standalone application.
 * @returns A promise that resolves to the created standalone app instance.
 */
export async function createStandaloneApp(
  options?: StandaloneAppOptions
): Promise<App> {
  const container = await new ContainerBuilder().build();
  return new App(container, { runServer: false, ...options });
}
