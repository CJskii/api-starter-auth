import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/index";
import { loggingConfig } from "../config/logging";

function bodyKeysSafe(body: any) {
  if (!body || typeof body !== "object") return undefined;
  return Object.keys(body);
}

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = typeof err?.message === "string" && err.message.length > 0 ? err.message : "Internal server error";

  const log = (req as any).log ?? logger;

  const is4xx = status >= 400 && status < 500;
  const is5xx = status >= 500;

  const shouldLog = (is5xx && loggingConfig.logHttp5xx) || (is4xx && loggingConfig.logHttp4xx);

  if (shouldLog) {
    const base = {
      layer: "http",
      module: "errorHandler",
      action: "handle",
      status,
      message,
      userId: (req as any)?.user?.id,
      params: req.params,
      query: req.query,
      bodyKeys: bodyKeysSafe(req.body),
    };

    const includeStack = (is5xx && loggingConfig.stackFor5xx) || (is4xx && loggingConfig.stackFor4xx);

    if (is5xx) {
      log.error("request.error", includeStack ? { ...base, stack: err?.stack } : base);
    } else {
      log.warn("request.error", includeStack ? { ...base, stack: err?.stack } : base);
    }
  }

  res.status(status).json({ message });
};
