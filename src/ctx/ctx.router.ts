import { TCtx } from "./ctx.types";
import { ctxErr, CtxError } from "./ctx.err";

type TRouteObj<TContext> = Record<
  string,
  Record<string, (ctx: TContext) => Promise<TContext>>
>;

export class CtxRouter<TContext> {
  private routeObj: TRouteObj<TContext> = {};
  private onErrorHandler: (
    ctx: TContext,
    error: CtxError | Error | unknown
  ) => Promise<TContext> = async (ctx, error) => {
    console.log("CtxError:onErrorHandler", error);
    return ctx;
  };

  async exec(method: string, path: string, ctx: TContext): Promise<TContext> {
    const handler = this.routeObj[method]?.[path];
    if (!handler) {
      throw ctxErr.general.handlerNotFound({
        data: { method, path },
      });
    }
    try {
      return await handler(ctx);
    } catch (error) {
      return await this.onErrorHandler(ctx, error);
    }
  }

  handle(
    method: string,
    path: string,
    handler: (ctx: TContext) => Promise<TContext>
  ) {
    const methodRoute = this.routeObj[method] || (this.routeObj[method] = {});
    methodRoute[path] = handler;
  }

  onError(
    handler: (
      ctx: TContext,
      error: CtxError | Error | unknown
    ) => Promise<TContext>
  ) {
    this.onErrorHandler = handler;
  }
}

const ctxRouter = new CtxRouter<TCtx>();
async function handler(ctx: TCtx): Promise<TCtx> {
  console.log(ctx);
  return ctx;
}

ctxRouter.handle("GET", "/", handler);
ctxRouter.handle("GET", "/instance/ping", handler);
ctxRouter.handle("GET", "/instance/health", handler);
ctxRouter.handle("POST", "/route/test", handler);
