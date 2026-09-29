# ⚡ FastAct — Backend Without the Bullsh*it.

**FastAct** is a lightweight, ultra-fast backend framework for Node.js built with **TypeScript** and **Fastify**.

It is designed for engineers who are tired of bloated enterprise monsters, endless decorators, heavy reflection magic, and overwhelming boilerplate. **FastAct** brings back the joy of writing clean, explicit code without the ceremony.

[Documentation (Coming Soon)] • [CLI Utility: fac] • [Community]

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
