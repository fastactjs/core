import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { glob } from 'node:fs/promises';
import { colorTag } from '../internal/utils/index.js';
import type {
  ContainerInstance,
  Factory,
  Lifecycle,
  Token,
  RegistrationTarget,
  RegistrationLifecycle,
  Provider,
} from './types.js';
import { Container } from './container.js';

/** Represents a module that can be loaded into the container builder. */
export type ContainerModule = (builder: ContainerBuilder) => Promise<void>;

/**
 * Dependency container builder with a fluent registration API.
 *
 * @example
 * ```ts
 * builder.register(DI.UserService).asClass(UserService).withDeps(DI.Database).singleton()
 * ```
 */
export class ContainerBuilder {
  private container = new Container();

  /**
   * Starts dependency registration using its token.
   *
   * Specify a class with `asClass()`, a factory with `asFactory()`, or a ready
   * value with `asValue()`.
   */
  register<T>(token: Token<T>): RegistrationTarget<T, this> {
    const withFactory = (factory: Factory<T>) => {
      // prettier-ignore
      const withLifecycle = (deps: Token<any>[] = []): RegistrationLifecycle<this> => ({
        scoped: () => this.registerEntry(token, factory, deps, 'scoped'),
        singleton: () => this.registerEntry(token, factory, deps, 'singleton'),
        transient: () => this.registerEntry(token, factory, deps, 'transient'),
      });

      return {
        ...withLifecycle(),
        /**
         * Passes factory dependency tokens in the order of its arguments.
         * Accepts individual tokens or a single array of tokens.
         */
        withDeps: (...deps: Array<Token<any> | Token<any>[]>) =>
          withLifecycle(deps.flat()),
      };
    };

    return {
      /** Specifies a class that the container instantiates with `new`. */
      asClass: (Class: new (...deps: any[]) => T) =>
        withFactory((...deps) => new Class(...deps)),
      /** Specifies a factory that creates the dependency instance. */
      asFactory: (factory: Factory<T>) => withFactory(factory),
      /** Registers a ready value as a singleton dependency. */
      asValue: (value: T) => {
        this.container.registerValue(token, value);
        return this;
      },
    };
  }

  // Alias for `register()` to provide a more concise API.
  add = this.register;
  bind = this.register;

  async build(): Promise<ContainerInstance> {
    let moduleErrorName: string | undefined;

    try {
      const entryPoint = process.env.pm_exec_path ?? process.argv[1];

      if (!entryPoint) {
        throw new Error('Unable to determine application entry point');
      }

      const runDir = path.dirname(path.resolve(entryPoint));
      const root = this.findProjectRoot(runDir);
      const config = await this.loadConfig(root);

      const isTypeScriptRuntime =
        /\.(?:ts|mts|cts)$/.test(entryPoint) ||
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
          /**
           * Build container module via builder pattern.
           * @deprecated Use createContainerModule instead.
           */
          const buildContainerModule = moduleExport.buildContainerModule;

          /**
           * Create container module via declarative pattern.
           * Recommended approach. Returns an array of providers.
           */
          const createContainerModule = moduleExport.createContainerModule;
          if (typeof buildContainerModule === 'function') {
            await buildContainerModule(this);
          } else {
            throw new Error(
              `Missing required "export function buildContainerModule(builder) { ... }"`
            );
          }

          if (typeof createContainerModule === 'function') {
            const moduleProviders = await createContainerModule();
            this.addProviders(moduleProviders);
          } else {
            throw new Error(
              `Missing required "export function createContainerModule() { ... }"`
            );
          }
        }
      }
    } catch (err) {
      console.error(
        `${colorTag.ERROR} DI auto-load failed: ${err instanceof Error ? err.message : err} in the module: ${moduleErrorName}`
      );
    }

    return this.container as unknown as ContainerInstance;
  }

  private addProviders(providers: Provider[]): void {
    for (const provider of providers) {
      if ('useValue' in provider) {
        this.container.registerValue(provider.provide, provider.useValue);
      } else if ('useFactory' in provider) {
        this.container.register(
          provider.provide,
          provider.useFactory,
          provider.inject ?? []
        );
      } else {
        this.container.register(
          provider.provide,
          (...deps) => new provider.useClass(...deps),
          provider.inject ?? []
        );
      }
    }
  }

  private registerEntry<T>(
    token: Token<T>,
    factory: Factory<T>,
    deps: Token<any>[],
    lifecycle: Lifecycle
  ): this {
    this.container.register(token, factory, deps, lifecycle);
    return this;
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
      console.error(
        `${colorTag.ERROR} Failed to load config file: ${err instanceof Error ? err.message : err}`
      );
      return {};
    }
  }
}
