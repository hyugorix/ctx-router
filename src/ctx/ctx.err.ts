type TCtxErrorData = {
  [key: string]: number | string | object | boolean | null;
};
type TCtxError = {
  name: string; // error name | constant (unique and capitalized)
  msg: string; // Human readable error message
  data?: TCtxErrorData; // non sensitive data that can be sent back to client
  info?: unknown; // error info (for debugging that will be logged internally)
};
export class CtxError extends Error {
  data: { [key: string]: number | string | object | boolean | null };
  info?: unknown;
  constructor({ name, msg, data, info }: TCtxError) {
    super(msg);
    super.name = name;
    this.data = data || {};
    this.info = info;
  }
}

type TResErr = Partial<Pick<TCtxError, "data" | "info" | "msg">>;

export namespace ctxErr {
  export const general = {
    unknown: (e?: TResErr) =>
      new CtxError({
        name: "UNKNOWN_ERROR",
        msg: "Something went wrong",
        ...e,
      }),
    responseNotSet: (e?: TResErr) =>
      new CtxError({
        name: "RESPONSE_NOT_SET",
        msg: "Response not set",
        ...e,
      }),
    malformedRequestData: (e?: TResErr) =>
      new CtxError({
        name: "MALFORMED_REQUEST_DATA",
        msg: "Malformed request data",
        ...e,
      }),
    handlerNotFound: (e?: TResErr) =>
      new CtxError({
        name: "HANDLER_NOT_FOUND",
        msg: "Handler not found",
        ...e,
      }),
    notAuthorized: (e?: TResErr) =>
      new CtxError({
        name: "NOT_AUTHORIZED",
        msg: "Not authorized",
        ...e,
      }),
  };
}
