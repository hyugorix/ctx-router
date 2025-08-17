import { TCtx, USER_ROLE, IBaseApi } from "./ctx/ctx.types";
import { transformFromExpress } from "./transform/fromExpress";
import { CtxRouter } from "./ctx/ctx.router";

export type { TCtx, IBaseApi };
export { USER_ROLE, CtxRouter };

export namespace toCtx {
  export const fromExpress = transformFromExpress;
}
