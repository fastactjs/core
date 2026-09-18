import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { glob } from 'node:fs/promises';
import chalk from 'chalk';
import { logger } from '../utils';
import type {
  ContainerInstance,
  Factory,
  Lifecycle,
  InjectionToken,
  RegistrationTarget,
  RegistrationLifecycle,
} from './types';
import { Container } from './container';

/** Represents a module that can be loaded into the container builder. */
export type ContainerModule = (builder: ContainerBuilder) => Promise<void>;

/**
 * Dependency container builder with a fluent registration API.
 *
 * Example: `builder.add(DI.UserService).asClass(UserService).withDeps(DI.Database).scoped()`.
 */
export class ContainerBuilder {
  private container = new Container();

  private register<T>(
    token: InjectionToken<T>,
    factory: Factory<T>,
    deps: InjectionToken<any>[],
    lifecycle: Lifecycle
  ): this {
    this.container.register(token, factory, deps, lifecycle);
    return this;
  }

  /**
   * Starts dependency registration using its token.
   *
   * Specify a class with `asClass()`, a factory with `asFactory()`, or a ready
   * value with `asValue()`.
   */
  add<T>(token: InjectionToken<T>): RegistrationTarget<T, this> {
    const withFactory = (factory: Factory<T>) => {
      // prettier-ignore
      // prettier-ignore
      const withLifecycle = (deps: InjectionToken<any>[] = []): RegistrationLifecycle<this> => ({
        scoped: () => this.register(token, factory, deps, 'scoped'),
        /** Registers one instance for the container's entire lifetime. */
        singleton: () => this.register(token, factory, deps, 'singleton'),
        /** Registers a new instance for each resolution. */
        transient: () => this.register(token, factory, deps, 'transient'),
      });

      return {
        ...withLifecycle(),
        /**
         * Passes factory dependency tokens in the order of its arguments.
         * Accepts individual tokens or a single array of tokens.
         */
        withDeps: (
          ...deps: Array<InjectionToken<any> | InjectionToken<any>[]>
        ) => withLifecycle(deps.flat()),
      };
    };

    return {
      /** Specifies a class that the container instantiates with `new`. */
      asClass: (Class: new (...deps: any[]) => T) =>
        withFactory((...deps) => new Class(...deps)),

      /*
      withFactory((...deps) => {
      const instance = new Class(...deps);
      const allProps = new Set([
        ...Object.getOwnPropertyNames(instance),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      ]);

      allProps.forEach((name) => {
        if (name === 'constructor') return;
        const value = (instance as any)[name];
        if (typeof value === 'function' && value.prototype !== undefined) {
          (instance as any)[name] = value.bind(instance);
        }
      });

      return instance;
    }),
      */

      /** Specifies a factory that creates the dependency instance. */
      asFactory: (factory: Factory<T>) => withFactory(factory),
      /** Registers a ready value as a singleton dependency. */
      asValue: (value: T) => {
        this.container.registerValue(token, value);
        return this;
      },
    };
  }

  async build(): Promise<ContainerInstance> {
    let moduleErrorName: string | undefined;

    try {
      const runDir = path.dirname(process.argv[1]);
      const root = this.findProjectRoot(runDir);
      const config = await this.loadConfig(root);

      const isTypeScriptRuntime =
        process.argv[1]?.endsWith('.ts') ||
        typeof (globalThis as typeof globalThis & { Bun?: unknown }).Bun !==
          'undefined';

      let masks: string[];

      if (isTypeScriptRuntime) {
        masks =
          config.modulesTs && config.modulesTs.length > 0
            ? config.modulesTs
            : ['src/**/*.module.ts'];
      } else {
        masks =
          config.modules && config.modules.length > 0
            ? config.modules
            : ['dist/**/*.module.js'];
      }

      for (const mask of masks) {
        const cleanPathMask = mask.startsWith('./') ? mask.slice(2) : mask;

        const modulesGlob = glob(cleanPathMask, {
          cwd: root,
          exclude: (p) =>
            p.includes('node_modules') ||
            p.includes('.git') ||
            (isTypeScriptRuntime ? p.endsWith('.js') : p.endsWith('.ts')), // Smart exclusion: ignore dist in TS runtime, ignore src in JS runtime
        });

        for await (const relativePath of modulesGlob) {
          const fullPath = path.resolve(root, relativePath);
          moduleErrorName = fullPath;

          // In production this will be a native, fast import() of a plain JS file
          const fileUrl = pathToFileURL(fullPath).href;
          const moduleExport = await import(fileUrl);
          const initModule = moduleExport.createContainerModule;

          if (typeof initModule === 'function') {
            await initModule(this);
          } else {
            throw new Error(
              `Missing required "export function createContainerModule(builder) { ... }"`
            );
          }
        }
      }
    } catch (err) {
      console.log(
        `${chalk.red.bold('[FastAct]')} IoC auto-load failed: ${err instanceof Error ? err.message : err} in the module: ${moduleErrorName}`
      );
    }

    return this.container as unknown as ContainerInstance;
  }

  private findProjectRoot(startDir: string): string {
    let currentDir = startDir;

    while (currentDir !== path.parse(currentDir).root) {
      if (existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return startDir;
  }

  /** Helper method for loading the config with TS/JS support. */
  private async loadConfig(
    projectRootDir: string
  ): Promise<{ modules?: string[]; modulesTs?: string[] }> {
    const extensions = ['.ts', '.js', '.mts', '.mjs', '.cts', '.cjs'];
    let configPath = '';

    for (const ext of extensions) {
      const file = path.join(projectRootDir, `fastact.config${ext}`);
      if (existsSync(file)) {
        configPath = file;
        break;
      }
    }

    if (!configPath) return {};

    try {
      // Convert the absolute path to a file:// URL (required for ESM import)
      const fileUrl = pathToFileURL(configPath).href;
      const configModule = await import(fileUrl);

      return configModule.default || configModule;
    } catch (err) {
      console.log(
        `${chalk.yellow.bold('[FastAct]')} Failed to load config file: ${err instanceof Error ? err.message : err}`
      );
      return {};
    }
  }
}
