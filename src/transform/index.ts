import crypto from "crypto";
import { TCtx, USER_ROLE } from "../ctx/ctx.types";

const INSTANCE = {
  ID: crypto.randomBytes(5).toString("hex"),
  TRACE_ID: crypto.randomBytes(5).toString("hex"),
  CREATED_AT: new Date(),
  SERVICE_NAME: process.env.SERVICE_NAME || "fantasy-service",
  SEQ: 0,
  INFLIGHT: 0,
  LAST_HEARTBEAT: new Date(),
  PORT: parseInt(process.env.SERVICE_PORT || "3000", 10),
};

type TCtxBuild = {
  method: string;
  path: string;
  header: Record<string, string | string[] | undefined>;
  data: Record<string, unknown>;
  ip: string;
  ips: string[];
};

export function buildCtx(ctxRaw: TCtxBuild) {
  const meta = buildMeta(ctxRaw);
  const req = buildReq(ctxRaw);
  const user = buildUser(ctxRaw);
  const res = buildRes();
  const id = meta.monitor.traceId;
  return { id, meta, req, user, res };
}

export async function doneCtx(ctx: TCtx): Promise<void> {
  ctx.meta.ts.out = new Date();
  ctx.meta.ts.execTime = ctx.meta.ts.out.getTime() - ctx.meta.ts.in.getTime();

  // Log context using ctxLogger
  // await logCtx(ctx);
  setResMeta(ctx);
  // decrease the number of request inflight when response of this request goes out
  INSTANCE.INFLIGHT--;
}

function buildMeta(ctxRaw: TCtxBuild): TCtx["meta"] {
  const inTime = new Date();
  ++INSTANCE.SEQ;
  ++INSTANCE.INFLIGHT;

  // Extract clientIn from header and validate if it's a valid date using IIFE
  const clientIn = (() => {
    const dtStr = ctxRaw.header["x-ctx-ts"];
    if (typeof dtStr !== "string") return inTime;
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return inTime;
    return dt;
  })();

  return {
    serviceName: INSTANCE.SERVICE_NAME,
    instance: {
      id: INSTANCE.ID,
      createdAt: INSTANCE.CREATED_AT,
      seq: INSTANCE.SEQ,
      inflight: INSTANCE.INFLIGHT,
    },
    ts: {
      in: inTime,
      clientIn: clientIn,
      owd: inTime.getTime() - clientIn.getTime(),
    },
    monitor: {
      traceId: `${INSTANCE.ID}-${INSTANCE.SEQ}`,
      spanId: `${INSTANCE.ID}-${INSTANCE.SEQ}`,
      stdout: [],
      dbLog: [],
    },
  };
}

function buildReq(data: TCtxBuild): TCtx["req"] {
  return {
    method: data.method,
    path: data.path,
    header: data.header,
    data: data.data,
    ip: data.ip,
    ips: data.ips,
  };
}

function buildUser(ctxRaw: TCtxBuild): TCtx["user"] {
  const header = ctxRaw.header;
  const clientSeq = Number(header["x-ctx-seq"]);
  return {
    id: "none",
    role: USER_ROLE.none,
    seq: isNaN(clientSeq) ? 0 : clientSeq,
    sessionId: String(header["x-ctx-session-id"] || "none"),
    deviceId: String(header["x-ctx-device-id"] || "none"),
    deviceName: String(header["x-ctx-device-name"] || "none"),
    appVersion: String(header["x-ctx-app-version"] || "none"),
    os: String(header["x-ctx-os"] || "none"),
    apiVersion: String(header["x-ctx-api-version"] || "none"),
    auth: {
      token: String(
        header["authorization"] || header["Authorization"] || "none"
      ),
      refresh: String(header["x-ctx-refresh-token"] || "none"),
    },
  };
}

function buildRes(): TCtx["res"] {
  return {
    code: "OK",
    msg: "OK",
    data: {},
  };
}

function setResMeta(ctx: TCtx): void {
  const meta = ctx.meta;
  ctx.res.meta = {
    ctxId: ctx.id,
    seq: ctx.user.seq,
    traceId: meta.monitor.traceId,
    spanId: meta.monitor.spanId,
    inTime: meta.ts.in,
    outTime: meta.ts.out!,
    execTime: meta.ts.execTime!,
    owd: meta.ts.owd,
  };
}
