import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

import { logger } from "../utils/index";
import { loggingConfig } from "../config/logging";

type ValidationSchemas = {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
};

type LoggableZodIssue = {
  path: string;
  message: string;
  code: string;
};

function formatZodError(err: ZodError): LoggableZodIssue[] {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
}

function bodyKeysSafe(body: unknown): string[] | undefined {
  if (!body || typeof body !== "object") return undefined;
  return Object.keys(body as Record<string, unknown>);
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req, res, next) => {
    const targets: Array<keyof ValidationSchemas> = ["params", "query", "body"];

    for (const target of targets) {
      const schema = schemas[target];
      if (!schema) continue;

      const data = (req as any)[target];
      const result = schema.safeParse(data);

      if (!result.success) {
        const issues = formatZodError(result.error);

        // Prefer request-scoped logger (adds requestId/method/path automatically)
        const log = (req as any).log ?? logger;

        // Production-ready: only log validation failures if configured
        if (loggingConfig.validation) {
          log.warn("validation.failed", {
            layer: "http",
            module: "validation",
            action: "validate",
            target,
            issues,
            meta: target === "body" ? { bodyKeys: bodyKeysSafe(data) } : { value: data },
          });
        }

        return res.status(400).json({
          message: "Validation failed",
          target,
          errors: issues,
        });
      }

      // replace request data with parsed/transformed values
      (req as any)[target] = result.data;
    }

    return next();
  };
};