export interface ContainerInstance {
  get<T>(token: InjectionToken<T>): T;
}

export interface ScopedContainerInstance {
  get<T>(token: InjectionToken<T>): T;
}

/** A symbol token carrying the type of the dependency it identifies. */
export interface SymbolToken<T> extends Symbol {
  readonly __type?: T;
}

/** A string or typed symbol used to identify a dependency. */
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

export interface RegistrationLifecycle<B = any> {
  scoped(): B;
  singleton(): B;
  transient(): B;
}

export interface RegistrationWithDependencies<
  B,
> extends RegistrationLifecycle<B> {
  withDeps(
    ...deps: Array<InjectionToken<any> | InjectionToken<any>[]>
  ): RegistrationLifecycle<B>;
}

export interface RegistrationTarget<V, B> {
  asClass(Class: new (...args: any[]) => V): RegistrationWithDependencies<B>;
  asFactory(factory: (...args: any[]) => V): RegistrationWithDependencies<B>;
  asValue(value: V): B;
}
