import { TCtx, USER_ROLE } from "../../..";
import { ctxErr } from "../../../ctx/ctx.err";

export async function execute(reqData: TReqData): Promise<TResData> {
  return {
    userDetail: {
      userId: reqData.userId,
      userName: "kaushik",
    },
  };
}

export async function auth(ctx: TCtx): Promise<TCtx> {
  // authenticate the request, and return the context if the request is authenticated
  // await authRequest(ctx);
  if (ctx.user.role.includes(USER_ROLE.user)) return ctx;
  if (ctx.user.role.includes(USER_ROLE.admin)) return ctx;
  throw ctxErr.general.notAuthorized();
}

export async function validate(ctx: TCtx): Promise<TReqData> {
  // Validate request data and return the request data
  return ctx.req.data as TReqData;
}

type TReqData = {
  userId: string;
};
type TResData = {
  userDetail: {
    userId: string;
    userName: string;
  };
};
