import { App } from './application';
import { ContainerBuilder } from './ioc';
import type { Application, ApplicationOptions } from './types';

// prettier-ignore
export async function createApp(options?: ApplicationOptions): Promise<Application> {
  const container = await new ContainerBuilder().build();
  return new App(container, options);
}
