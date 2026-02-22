import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../utils/index";
import { loggingConfig } from "../config/logging";

export type RequestWithLog = Request & {
  requestId?: string;
  log?: ReturnType<typeof logger.child>;
  user?: { id?: string; email?: string };
};

function bodyKeysSafe(body: any) {
  if (!body || typeof body !== "object") return undefined;
  return Object.keys(body);
}

export const requestLogger = (req: RequestWithLog, res: Response, next: NextFunction) => {
  const requestId = req.header("x-request-id") ?? crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  req.log = logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  const start = Date.now();

  if (loggingConfig.httpStart) {
    req.log.info("request.start", {
      layer: "http",
      module: "request",
      action: "start",
      // keep these only in dev by default
      params: req.params,
      query: req.query,
      bodyKeys: bodyKeysSafe(req.body),
    });
  }

  res.on("finish", () => {
    if (!loggingConfig.httpEnd) return;

    const durationMs = Date.now() - start;
    const log = req.log ?? logger;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    (log as any)[level]("request.end", {
      layer: "http",
      module: "request",
      action: "end",
      statusCode: res.statusCode,
      durationMs,
      userId: (req as any)?.user?.id,
    });
  });

  next();
};
