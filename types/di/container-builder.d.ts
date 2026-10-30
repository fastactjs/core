import type { ContainerInstance, Token, RegistrationTarget } from './types.js';
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
export declare class ContainerBuilder {
    private container;
    /**
     * Starts dependency registration using its token.
     *
     * Specify a class with `asClass()`, a factory with `asFactory()`, or a ready
     * value with `asValue()`.
     */
    register<T>(token: Token<T>): RegistrationTarget<T, this>;
    build(): Promise<ContainerInstance>;
    private registerEntry;
    private findProjectRoot;
    /** Helper method for loading the config with TS/JS support. */
    private loadConfig;
}
