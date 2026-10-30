import type { Lifecycle, Factory, Token } from './types.js';
export declare class Container {
    private registry;
    private scopeCaches;
    /** Registers a dependency factory, its dependencies, and its lifecycle. */
    register<T, D extends any[]>(token: Token<T>, factory: Factory<T, D>, deps?: Token<D[number]>[], lifecycle?: Lifecycle): this;
    /** Registers a ready value as a singleton dependency. */
    registerValue<T>(token: Token<T>, value: T): this;
    /** Resolves a dependency according to its lifecycle. */
    get<T>(token: Token<T>, scopeId?: string, resolvesSingleton?: boolean, resolutionPath?: Token<any>[]): T;
    private resolveSingleton;
    private resolveScoped;
    private getScopeCache;
    private build;
    /** Creates a scoped resolver that reuses instances for the given scope ID. */
    createScope(id: string): ScopedContainer;
    /** Removes all cached scoped dependencies for the specified scope. */
    clearScope(id: string): void;
    private clearTokenFromScopes;
}
/** Resolves dependencies within a predefined scope. */
export declare class ScopedContainer {
    private parent;
    scopeId: string;
    constructor(parent: Container, scopeId: string);
    get<T>(token: Token<T>): T;
    /** Clears the dependency cache for the current scope. */
    clear(): void;
}
