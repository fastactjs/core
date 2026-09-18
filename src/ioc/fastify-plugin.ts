import fp from 'fastify-plugin';
import type {
  FastifyPluginAsync,
  FastifyInstance,
  FastifyRequest as Request,
} from 'fastify';
import type { ContainerInstance, ScopedContainerInstance } from './types';

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
// prettier-ignore
const plugin: FastifyPluginAsync<{ container: InternalRootContainer }> = async (fastify, options) => {
  
  fastify.decorateRequest('container', null as any);
  fastify.decorateRequest('scopedContainer', null as any);

  fastify.addHook('onRequest', async (req: Request) => {
    const r = req as any;
    
    r.container = options.container;
    r.scopedContainer = options.container.createScope(req.id);
  });

  fastify.addHook('onResponse', async (req: Request) => {
    const r = req as any;
    

    if (r.scopedContainer && typeof r.scopedContainer.dispose === 'function') {
      await r.scopedContainer.dispose();
    }

    // Зануляем ссылки, очищая память для Garbage Collector
    r.container = null;
    r.scopedContainer = null;
  });
};

export const fastactIocPlugin = fp(plugin, { name: '@fastact/ioc-plugin' });
