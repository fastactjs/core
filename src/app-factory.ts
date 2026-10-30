import { App } from './app';
import { ContainerBuilder } from './ioc';
import type { NormalAppOptions, StandaloneAppOptions } from './types';

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

// prettier-ignore
export async function createApp(options?: NormalAppOptions): Promise<App> {
    const container = await new ContainerBuilder().build();
    return new App(container, { runServer: true, ...options });
}

// prettier-ignore
export async function createStandaloneApp(options?: StandaloneAppOptions): Promise<App> {
  const container = await new ContainerBuilder().build();
  return new App(container, { runServer: false, ...options });
}
