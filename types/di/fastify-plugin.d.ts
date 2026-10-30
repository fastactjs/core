import type { FastifyPluginAsync } from 'fastify';
import type { ContainerInstance, ScopedContainerInstance } from './types.js';
interface InternalRootContainer extends ContainerInstance {
    createScope(id: string): InternalScopedContainer;
}
interface InternalScopedContainer extends ScopedContainerInstance {
    dispose(): void | Promise<void>;
}
declare module 'fastify' {
    interface FastifyRequest {
        container: ContainerInstance;
        scopedContainer: ScopedContainerInstance;
    }
}
export declare const fastactDiPlugin: FastifyPluginAsync<{
    container: InternalRootContainer;
}>;
export {};
