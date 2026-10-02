<p align="center">The explicit <a href="https://nodejs.org" target="_blank">Node.js</a> framework on top of <a href="https://fastify.dev" target="_blank">Fastify</a>. Backend without the bullsh*t: no decorators, no boilerplate, no magic.</p><p align="center">

---

## 🔥 Key Features & Philosophy

### 🚫 No Decorator Pollution

Forget about `@Injectable()`, `@Inject()`, or `@Module()`. Your code should be pure TypeScript. FastAct uses an explicit, declarative, and fluent API for building dependencies, which plays perfectly with modern editors, refactors, and static analysis.

### 🛡 Symbol-Driven IoC Container

Our custom built-in Dependency Injection (DI) container operates entirely on unique `Symbol` tokens. No string name collisions, no accidental service overwrites. You get 100% type safety and perfect runtime clarity.

### 🧬 Advanced Lifecycles (Singleton & Scoped)

FastAct natively supports both lazy `Singleton` instances and fully isolated `Scoped` contexts for every single HTTP request or CLI command. This makes it an ideal fit for managing MikroORM's `EntityManager`, Redis sessions, request-level services, or any app that needs clean isolation without framework magic.

### 🔀 Unified Web & CLI Architecture (Standalone Mode)

Initialize your entire application with a single `createApp()` function. Need a web server? Pass `runServer: true`. Need a lightweight cron job, queue worker, or a CLI command via our `fac` utility? Run it directly. One framework, many entry points.

---

## 🎹 Code Showcase

### 1. Define Unique Tokens

```typescript
// src/modules/auth/auth.tokens.ts
import type { InjectionToken } from '@fastactjs/core';
import type { AuthService } from './auth.service';

export const AUTH_DI = {
  AuthService: Symbol('AuthService') as InjectionToken<AuthService>,
};
```

### 2. Register Dependencies Cleanly (Fluent API)

```typescript
// src/modules/auth/auth.module.ts
import { AUTH_DI } from './auth.tokens';
import { AuthService } from './auth.service';
import type { ContainerBuilder } from '@fastactjs/core';

export async function createContainerModule(builder: ContainerBuilder) {
  // Simple, elegant, and instantly readable for developers worldwide
  builder.add(AUTH_DI.AuthService).asClass(AuthService).singleton();
}
```

### 3. Ignite the Engine

```typescript
// src/main.ts
import { createApp } from '@fastactjs/core';
import path from 'node:path';

async function bootstrap() {
  const app = await createApp({
    modulesDir: path.join(__dirname, 'modules'),
    runServer: true,
    port: 3000,
  });

  await app.start();
}
bootstrap();
```

---

## 🛠 Our Powerful CLI: `fac`

Manage your FastAct applications with our sharp and blunt console utility — `fac`. Fast, efficient, straight to the point.

```bash
# Generate a new module structure automatically (Zero Boilerplate)
$ fac add module user

# Run the project in development mode with hot-reload
$ fac start --dev

# Execute a standalone CLI command / cron script
$ fac run cron:sync-users
```

---

## 💝 Support the Project

If you enjoy FastAct and want to support its development, you can sponsor the project:

- [GitHub Sponsors](https://github.com/sponsors/fastactjs)

Your support helps keep the project moving forward and fuels more features, docs, and examples.

---

## 🌏 Join the Movement

We are building a backend framework that speaks the same language of simplicity to engineers in Moscow, Seoul, Tokyo, and San Francisco. If you share our passion for clean JavaScript/TypeScript without the framework drama, come build with us.

[Community] • [Documentation] • [GitHub Issues] • [Discord / Telegram / Forum when available]
