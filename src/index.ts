import { TCtx, USER_ROLE } from "./ctx/ctx.types";
import { transformFromExpress } from "./transform/fromExpress";
import { CtxRouter } from "./ctx/ctx.router";
import { CtxError } from "./ctx/ctx.err";
export type { TCtx };
export { USER_ROLE, CtxRouter, CtxError };

export namespace toCtx {
  export const fromExpress = transformFromExpress;
}
