import { handleBeforeExec } from "../defaultHandler/handle.beforeExec";
import { handleOnError } from "../defaultHandler/handle.onError";
import { ctxErr, CtxError } from "./ctx.err";
import { TCtx } from "./ctx.types";

type TRouteObj<TContext> = Record<
  string,
  Record<string, (ctx: TContext) => Promise<TContext>>
>;

export class CtxRouter<TContext extends TCtx> {
  private routeObj: TRouteObj<TContext> = {};
  private onErrorHandler: (
    ctx: TContext,
    error: CtxError | Error | unknown
  ) => Promise<TContext> = handleOnError<TContext>;
  private beforeExecHandler: (ctx: TContext) => Promise<TContext> =
    handleBeforeExec<TContext>;
  private onFinallyHandler: (ctx: TContext) => Promise<TContext> = async (
    ctx
  ) => {
    return ctx;
  };

  beforeExec(handler: (ctx: TContext) => Promise<TContext>) {
    this.beforeExecHandler = handler;
  }

  async exec(method: string, path: string, ctx: TContext): Promise<TContext> {
    try {
      await this.beforeExecHandler(ctx);
      const handler = this.routeObj[method]?.[path];
      if (!handler) {
        throw ctxErr.general.handlerNotFound({
          data: { method, path },
        });
      }
      return await handler(ctx);
    } catch (error) {
      return await this.onErrorHandler(ctx, error);
    } finally {
      await this.onFinallyHandler(ctx);
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
  onFinally(handler: (ctx: TContext) => Promise<TContext>) {
    this.onFinallyHandler = handler;
  }
}
