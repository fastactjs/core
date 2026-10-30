import { App } from './app.js';
import type { NormalAppOptions, StandaloneAppOptions } from './types.js';
export declare class AppFactory {
    static create(options?: NormalAppOptions): Promise<App>;
    static createStandalone(options?: StandaloneAppOptions): Promise<App>;
}
export declare function createApp(options?: NormalAppOptions): Promise<App>;
export declare function createStandaloneApp(options?: StandaloneAppOptions): Promise<App>;
