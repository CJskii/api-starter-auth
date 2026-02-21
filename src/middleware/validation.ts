import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../utils";

// Generic validation middleware function
export const validateSchema = (schema: ZodSchema, location: "body" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (location === "body") {
        schema.parse(req.body);
      } else {
        schema.parse(req.params);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract error messages from Zod validation
        const errors = error.issues.map((issue) => issue.message);
        logger.warn("Validation error", { errors });
        return res.status(400).json({
          message: "Validation failed",
          errors: errors,
        });
      }
      logger.error("Unexpected validation error", { error });
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
};
