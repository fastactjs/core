import path from 'node:path';
import { glob } from 'node:fs/promises';
import chalk from 'chalk';
import type {
  IContainerBuilder,
  ContainerInstance,
  Factory,
  Lifecycle,
  InjectionToken,
  RegistrationTarget,
  RegistrationLifecycle,
  RegistrationWithDependencies,
} from './types';
import { Container } from './container';

/**
 * Dependency container builder with a fluent registration API.
 *
 * Example: `builder.add(DI.UserService).asClass(createUserService).withDeps(DI.Database).scoped()`.
 */
export class ContainerBuilder implements IContainerBuilder {
  private container = new Container();

  private register<T>(
    token: InjectionToken<T>,
    factory: Factory<T>,
    deps: InjectionToken<any>[],
    lifecycle: Lifecycle
  ): ContainerBuilder {
    this.container.register(token, factory, deps, lifecycle);
    return this;
  }

  /**
   * Starts dependency registration using its unique token.
   *
   * Specify a class with `asClass()`, a factory with `asFactory()`, or a ready
   * value with `asValue()`.
   */
  add<T>(token: InjectionToken<T>): RegistrationTarget<T> {
    const withFactory = (factory: Factory<T>) => {
      // prettier-ignore
      const withLifecycle = (deps: InjectionToken<any>[] = []): RegistrationLifecycle => ({
        /** One instance per scope, such as an HTTP request. */
        scoped: () => this.register(token, factory, deps, 'scoped'),
        /** One instance for the container's entire lifetime. */
        singleton: () => this.register(token, factory, deps, 'singleton'),
        /** A new instance each time the dependency is resolved. */
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
      const modulesGlob = glob('**/*.module.{ts,js}', {
        cwd: runDir,
        exclude: (p) => p.includes('node_modules'),
      });

      for await (const relativePath of modulesGlob) {
        const fullPath = path.resolve(runDir, relativePath);
        //console.log(
        //  `${chalk.green.bold('[fastact]')} Found module file: ${relativePath}`
        //);

        const moduleExport = require(fullPath);
        moduleErrorName = fullPath;
        const initModule = moduleExport.createContainerModule;

        if (typeof initModule === 'function') {
          await initModule(this);
        } else {
          console.warn(
            `${chalk.yellow.bold('[fastact]')} File ${relativePath} skipped: missing "export function createContainerModule(builder) { ... }"`
          );
        }
      }
    } catch (err) {
      console.log(
        `${chalk.red.bold('[fastact]')} IoC auto-load failed: ${err instanceof Error ? err.message : err} in the module: ${moduleErrorName}`
      );
    }

    const container = this.container;

    /*     container.get = <T>(token: InjectionToken<T>): T => {
      const key = token.description;
      if (!key) {
        throw new Error('Symbol token must have a description to be resolved!');
      }

      const dependency = container[key];
      if (!dependency) {
        throw new Error(`IoC dependency for Symbol(${key}) not found`);
      }

      return dependency;
    }; */

    return this.container as unknown as ContainerInstance;
  }
}
