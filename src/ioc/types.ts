export interface ContainerInstance {
  get<T>(token: OldInjectionToken<T>): T;
}

export interface ScopedContainerInstance {
  get<T>(token: OldInjectionToken<T>): T;
}

/** The lifetime of a registered dependency. */
export type Lifecycle = 'singleton' | 'scoped' | 'transient';

/** Тип для любого класса-конструктора */
export type Constructor<T> = new (...args: any[]) => T;

/** 
 * Брендированный уникальный токен (в рантайме это нативный Symbol).
 * Фантомное поле __type нужно исключительно для магии типов TypeScript.
 */
export type NewInjectionToken<T> = symbol & {
  readonly __type?: T;
};

/** 
 * Универсальный входной тип для любых методов контейнера.
 */
export type Token<T> = Constructor<T> | NewInjectionToken<T> | string;


/** A symbol token carrying the type of the dependency it identifies. */
export interface SymbolToken<T> extends Symbol {
  readonly __type?: T;
}

/** A string or typed symbol used to identify a dependency. */
export type OldInjectionToken<T> = string | SymbolToken<T>;

export type Factory<T, Deps extends any[] = any[]> = (...deps: Deps) => T;

export interface DepEntry<T> {
  factory: Factory<T>;
  deps: Token<any>[];
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
    ...deps: Array<OldInjectionToken<any> | OldInjectionToken<any>[]>
  ): RegistrationLifecycle<B>;
}

export interface RegistrationTarget<V, B> {
  asClass(Class: new (...args: any[]) => V): RegistrationWithDependencies<B>;
  asFactory(factory: (...args: any[]) => V): RegistrationWithDependencies<B>;
  asValue(value: V): B;
}
