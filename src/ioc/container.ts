import type { Lifecycle, Factory, DepEntry, InjectionToken } from './types';

export class Container {
  private registry = new Map<InjectionToken<any>, DepEntry<any>>();
  private scoped = new Map<string, Map<InjectionToken<any>, any>>();

  /** Registers a dependency factory and its dependency list. */
  register<T, D extends any[]>(
    token: InjectionToken<T>,
    factory: Factory<T, D>,
    deps: InjectionToken<D[number]>[],
    lifecycle: Lifecycle = 'scoped'
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

  /**
  * Resolves a dependency. Scoped dependencies require a scope identifier,
  * such as an HTTP request identifier.
   */
  get<T>(
    token: InjectionToken<T>,
    scopeId?: string,
    resolvesSingleton = false,
    resolutionPath: InjectionToken<any>[] = []
  ): T {
    const entry = this.registry.get(token);

    if (!entry) throw new Error(`Dependency ${String(token)} not found`);

    if (entry.lifecycle === 'singleton') {
      if (!entry.isInitialized) {
        entry.instance = this.build(
          token,
          entry,
          scopeId,
          true,
          resolutionPath
        );
        entry.isInitialized = true;
      }
      return entry.instance as T;
    }

    if (entry.lifecycle === 'scoped') {
      if (resolvesSingleton) {
        throw new Error(
          `Singleton dependency chain cannot include scoped dependency ${String(token)}`
        );
      }
      if (!scopeId) throw new Error(`Scope ID required for ${String(token)}`);

      if (!this.scoped.has(scopeId)) {
        this.scoped.set(scopeId, new Map());
      }

      const scopeCache = this.scoped.get(scopeId)!;
      if (!scopeCache.has(token)) {
        scopeCache.set(
          token,
          this.build(token, entry, scopeId, false, resolutionPath)
        );
      }
      return scopeCache.get(token) as T;
    }

    return this.build(token, entry, scopeId, resolvesSingleton, resolutionPath);
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

  /** Creates an isolated scope for scoped dependencies. */
  createScope(id: string): ScopedContainer {
    return new ScopedContainer(this, id);
  }

  /** Removes all cached scoped dependencies for the specified scope. */
  clearScope(id: string): void {
    this.scoped.delete(id);
  }

  private clearTokenFromScopes(token: InjectionToken<any>): void {
    for (const scopeCache of this.scoped.values()) {
      scopeCache.delete(token);
    }
  }
}

/** A container with a predefined scope identifier. */
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
