import { CtxRouter, TCtx } from "..";
import * as api from "./api/index";
import { ctxRedisClient } from "./config/ctx.redis.config";

// Set your router
const router = new CtxRouter<TCtx>({
  log: { capture: true },
  stream: { redisClient: ctxRedisClient, key: "CTX:OBJ" },
});

router.handle("GET", "/health/ping", api.health.ping);
router.handle("POST", "/user/update", api.user.update);
router.handle("GET", "/user/detail", api.user.detail);

router.onErrorHook(async (ctx, error) => {
  console.error("Route error:", error);
  ctx.res.code = "ERROR";
  ctx.res.msg = "Something went wrong";
  return ctx;
});

export { router };
