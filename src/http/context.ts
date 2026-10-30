import { FastifyPluginAsync } from 'fastify';

// Расширяем интерфейс Fastify, чтобы контейнер был под рукой
declare module 'fastify' {
  interface FastifyInstance {
    container: Container;
  }
}

export const fastactPlugin: FastifyPluginAsync<{ builder: ContainerBuilder }> = async (fastify, options) => {
  const container = options.builder.build();
  
  fastify.decorate('container', container);
  
  // При закрытии сервера Fastify — тушим соединения в контейнере
  fastify.addHook('onClose', async () => {
    await container.dispose();
  });
};