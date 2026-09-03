/** Public contract for configuring and building a dependency container. */
export interface IContainerBuilder {
  add<T>(token: InjectionToken<T>): RegistrationTarget<T>;
  build(): Promise<ContainerInstance>;
}

export interface ContainerInstance {
  get<T>(token: InjectionToken<T>): T;
}

export interface SymbolToken<T> extends Symbol {
  readonly __type?: T;
}

export type InjectionToken<T> = string | SymbolToken<T>;

/** The lifetime of a registered dependency. */
export type Lifecycle = 'singleton' | 'scoped' | 'transient';

export type Factory<T, Deps extends any[] = any[]> = (...deps: Deps) => T;

export interface DepEntry<T> {
  factory: Factory<T>;
  deps: InjectionToken<any>[];
  lifecycle: Lifecycle;
  instance?: T;
  isInitialized: boolean;
}

export interface RegistrationLifecycle {
  scoped(): IContainerBuilder;
  singleton(): IContainerBuilder;
  transient(): IContainerBuilder;
}

export interface RegistrationWithDependencies extends RegistrationLifecycle {
  withDeps(
    ...deps: Array<InjectionToken<any> | InjectionToken<any>[]>
  ): RegistrationLifecycle;
}

export interface RegistrationTarget<T> {
  asClass(Class: new (...deps: any[]) => T): RegistrationWithDependencies;
  asFactory(factory: Factory<T>): RegistrationWithDependencies;
  asValue(value: T): IContainerBuilder;
}
