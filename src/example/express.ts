import express, { Request, Response } from "express";
import { toCtx, TCtx } from "..";
import { router } from "./router";

const app = express();

function getHttpCode(ctx: TCtx) {
  if (ctx.res.code === "OK") return 200;
  if (ctx.res.code === "UNKNOWN_ERROR") return 500;
  return 400;
}

app.all("/{*any}", async (req: Request, res: Response) => {
  const ctx: TCtx = toCtx.fromExpress(req);
  await router.exec(ctx.req.method, ctx.req.path, ctx);
  res.type("application/json").status(getHttpCode(ctx)).send(ctx.res);
});

app.listen(3000, () => {
  console.log(`Express server listening on port 3000`);
});
