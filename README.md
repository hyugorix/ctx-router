# Context Router

A TypeScript router library for handling context-based routing with type safety.

## Installation

```bash
npm install ctx-router
```

Or using pnpm:

```bash
pnpm add ctx-router
```

## Usage

### Basic Usage

```typescript
import { CtxRouter, TCtx, USER_ROLE } from "ctx-router";

// Create a router instance
const router = new CtxRouter<TCtx>();

// Define a handler
async function myHandler(ctx: TCtx): Promise<TCtx> {
  // Your logic here
  ctx.res.data = { message: "Hello World" };
  return ctx;
}

// Register routes
router.handle("GET", "/hello", myHandler);
router.handle("POST", "/api/data", myHandler);

// Handle errors
router.onError(async (ctx, error) => {
  console.error("Route error:", error);
  ctx.res.code = "ERROR";
  ctx.res.msg = "Something went wrong";
  return ctx;
});

// Execute routes
const result = await router.exec(ctx);
```

### Express.js Integration

Here's how to use it with Express.js by splitting router configuration and server setup:

#### `router.ts` - Router Configuration

```typescript
import { CtxRouter, TCtx } from "ctx-router";
import * as api from "./api/index";

// Set your router
const router = new CtxRouter<TCtx>();

router.handle("GET", "/health/ping", api.health.ping);
router.handle("POST", "/user/update", api.user.update);
router.handle("GET", "/user/detail", api.user.detail);

router.onError(async (ctx, error) => {
  console.error("Route error:", error);
  ctx.res.code = "ERROR";
  ctx.res.msg = "Something went wrong";
  return ctx;
});

export { router };
```

#### `express.ts` - Express Server Setup

```typescript
import express, { Request, Response } from "express";
import { toCtx, TCtx } from "ctx-router";
import { router } from "./router";

const app = express();

function getHttpCode(ctx: TCtx) {
  if (ctx.res.code === "OK") return 200;
  if (ctx.res.code === "UNKNOWN_ERROR") return 500;
  return 400;
}

app.all("/{*any}", async (req: Request, res: Response) => {
  const ctx: TCtx = toCtx.fromExpress(req);
  await router.exec(ctx);
  res.type("application/json").status(getHttpCode(ctx)).send(ctx.res);
});

app.listen(3000, () => {
  console.log(`Express server listening on port 3000`);
});
```

## Exports

### Classes

- `CtxRouter<TContext>` - Main router class for handling context-based routing

### Types

- `TCtx` - Main context type with request, response, user, and metadata
- `IBaseApi` - Interface for base API implementation

### Constants

- `USER_ROLE` - User role constants (user, admin, server, none)

## API Reference

### CtxRouter

#### Methods

- `handle(method: string, path: string, handler: (ctx: TContext) => Promise<TContext>)` - Register a route handler
- `exec(method: string, path: string, ctx: TContext): Promise<TContext>` - Execute a route
- `onError(handler: (ctx: TContext, error: Error | unknown) => Promise<TContext>)` - Set error handler

## License

MIT
