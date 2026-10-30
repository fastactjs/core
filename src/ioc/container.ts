import type { Lifecycle, Factory, DepEntry, InjectionToken } from './types';

export class Container {
  private registry = new Map<InjectionToken<any>, DepEntry<any>>();
  private scopeCaches = new Map<string, Map<InjectionToken<any>, any>>();

  /** Registers a dependency factory, its dependencies, and its lifecycle. */
  register<T, D extends any[]>(
    token: InjectionToken<T>,
    factory: Factory<T, D>,
    deps: InjectionToken<D[number]>[] = [],
    lifecycle: Lifecycle = 'singleton'
  ): this {
    this.registry.set(token, {
      factory,
      deps,
      lifecycle,
      isInitialized: false,
    });

    this.clearTokenFromScopes(token);
    return this;
  }

  /** Registers a ready value as a singleton dependency. */
  registerValue<T>(token: InjectionToken<T>, value: T): this {
    this.registry.set(token, {
      factory: () => value,
      deps: [],
      lifecycle: 'singleton',
      instance: value,
      isInitialized: true,
    });

    this.clearTokenFromScopes(token);
    return this;
  }

  /** Resolves a dependency according to its lifecycle. */
  get<T>(
    token: InjectionToken<T>,
    scopeId?: string,
    resolvesSingleton = false,
    resolutionPath: InjectionToken<any>[] = []
  ): T {
    const entry = this.registry.get(token);

    if (!entry) {
      throw new Error(`Dependency ${String(token)} not found`);
    }

    const resolvers = {
      singleton: () =>
        this.resolveSingleton(token, entry, scopeId, resolutionPath),
      scoped: () =>
        // prettier-ignore
        this.resolveScoped(token, entry, scopeId, resolvesSingleton, resolutionPath),
      transient: () =>
        this.build(token, entry, scopeId, resolvesSingleton, resolutionPath),
    };

    return resolvers[entry.lifecycle]?.();
  }

  private resolveSingleton<T>(
    token: InjectionToken<T>,
    entry: DepEntry<T>,
    scopeId: string | undefined,
    resolutionPath: InjectionToken<any>[]
  ): T {
    if (!entry.isInitialized) {
      entry.instance = this.build(token, entry, scopeId, true, resolutionPath);
      entry.isInitialized = true;
    }
    return entry.instance as T;
  }

  private resolveScoped<T>(
    token: InjectionToken<T>,
    entry: DepEntry<T>,
    scopeId: string | undefined,
    resolvesSingleton: boolean,
    resolutionPath: InjectionToken<any>[]
  ): T {
    if (resolvesSingleton) {
      throw new Error(
        `Singleton dependency chain cannot include scoped dependency ${String(token)}`
      );
    }

    if (!scopeId) throw new Error(`Scope ID required for ${String(token)}`);

    const scopeCache = this.getScopeCache(scopeId);
    if (!scopeCache.has(token)) {
      scopeCache.set(
        token,
        this.build(token, entry, scopeId, false, resolutionPath)
      );
    }
    return scopeCache.get(token) as T;
  }

  private getScopeCache(scopeId: string): Map<InjectionToken<any>, any> {
    let scopeCache = this.scopeCaches.get(scopeId);

    if (!scopeCache) {
      scopeCache = new Map();
      this.scopeCaches.set(scopeId, scopeCache);
    }
    return scopeCache;
  }

  private build<T>(
    token: InjectionToken<T>,
    entry: DepEntry<T>,
    scopeId: string | undefined,
    resolvesSingleton: boolean,
    resolutionPath: InjectionToken<any>[]
  ): T {
    if (resolutionPath.includes(token)) {
      const chain = [...resolutionPath, token].map(String).join(' -> ');
      throw new Error(`Circular dependency detected: ${chain}`);
    }

    const nextPath = [...resolutionPath, token];
    const args = entry.deps.map((dep) =>
      this.get(dep, scopeId, resolvesSingleton, nextPath)
    );
    return entry.factory(...args);
  }

  /** Creates a scoped resolver that reuses instances for the given scope ID. */
  createScope(id: string): ScopedContainer {
    return new ScopedContainer(this, id);
  }

  /** Removes all cached scoped dependencies for the specified scope. */
  clearScope(id: string): void {
    this.scopeCaches.delete(id);
  }

  private clearTokenFromScopes(token: InjectionToken<any>): void {
    for (const scopeCache of this.scopeCaches.values()) {
      scopeCache.delete(token);
    }
  }
}

/** Resolves dependencies within a predefined scope. */
export class ScopedContainer {
  constructor(
    private parent: Container,
    public scopeId: string
  ) {}

  get<T>(token: InjectionToken<T>): T {
    return this.parent.get(token, this.scopeId);
  }

  /** Clears the dependency cache for the current scope. */
  clear(): void {
    this.parent.clearScope(this.scopeId);
  }
}
