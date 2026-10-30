import { FastifyInstance } from 'fastify';
import { type ContainerInstance } from './di/index.js';
import type { NormalAppOptions, StandaloneAppOptions } from './types.js';
export type AppOptions = NormalAppOptions & StandaloneAppOptions & {
    runServer?: boolean;
};
export declare class App {
    private readonly container;
    private readonly server;
    private readonly options;
    constructor(container: ContainerInstance, options?: AppOptions);
    getContainer(): ContainerInstance;
    getServer(): FastifyInstance;
    start(): Promise<void>;
    close(): Promise<void>;
    private stopServer;
}
