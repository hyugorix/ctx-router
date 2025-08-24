import { handleBeforeExec } from "../defaultHandler/handle.beforeExec";
import { handleOnError } from "../defaultHandler/handle.onError";
import { ctxErr, CtxError } from "./ctx.err";
import { TCtx } from "./ctx.types";

type TRouteObj<TContext extends TCtx> = Record<
  string,
  Record<string, (ctx: TContext) => Promise<TContext>>
>;
type THooks = {
  beforeExec<TContext extends TCtx>(ctx: TContext): Promise<TContext>;
  onError<TContext extends TCtx>(
    ctx: TContext,
    error: CtxError | Error | unknown
  ): Promise<TContext>;
  onFinally<TContext extends TCtx>(ctx: TContext): Promise<TContext>;
};

export class CtxRouter<TContext extends TCtx> {
  private routeObj: TRouteObj<TContext> = {};
  private hooks: THooks;

  constructor() {
    this.hooks = {
      beforeExec: handleBeforeExec,
      onError: handleOnError,
      onFinally: async (ctx) => ctx,
    };
  }

  beforeExecHook(handler: THooks["beforeExec"]) {
    this.hooks.beforeExec = handler;
  }

  async exec(ctx: TContext): Promise<TContext> {
    try {
      await this.hooks.beforeExec(ctx);
      const handler = this.routeObj[ctx.req.method]?.[ctx.req.path];
      if (!handler) {
        throw ctxErr.general.handlerNotFound({
          data: { method: ctx.req.method, path: ctx.req.path },
        });
      }
      return await handler(ctx);
    } catch (error) {
      return await this.hooks.onError(ctx, error);
    } finally {
      await this.hooks.onFinally(ctx);
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

  onErrorHook(handler: THooks["onError"]) {
    this.hooks.onError = handler;
  }
  onFinallyHook(handler: THooks["onFinally"]) {
    this.hooks.onFinally = handler;
  }
}
