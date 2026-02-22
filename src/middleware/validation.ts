import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

type ValidationSchemas = {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
};

function formatZodError(err: ZodError) {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    code: i.code,
  }));
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

        logger.warn("Validation failed", {
          target,
          issues,
          meta:
            target === "body"
              ? { keys: data && typeof data === "object" ? Object.keys(data) : typeof data }
              : { value: data },
          path: req.originalUrl,
          method: req.method,
        });

        return res.status(400).json({
          message: "Validation failed",
          target,
          errors: issues,
        });
      }

      // Important: replace with parsed/transformed data
      (req as any)[target] = result.data;
    }

    return next();
  };
};
