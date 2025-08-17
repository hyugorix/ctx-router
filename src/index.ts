import { TCtx, USER_ROLE, IBaseApi } from "./ctx/ctx.types";
import { expressTransformer } from "./transformer/express";
import { CtxRouter } from "./ctx/ctx.router";

export type { TCtx, IBaseApi };
export { USER_ROLE, CtxRouter };

export namespace toCtx {
  export const fromExpress = expressTransformer;
}
