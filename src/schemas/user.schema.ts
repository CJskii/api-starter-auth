import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isProduction = process.env.NODE_ENV === "production";

export const idSchema = z
  .string()
  .min(1, "ID is required")
  .refine((val) => objectIdRegex.test(val) || (!isProduction && uuidRegex.test(val)), {
    message: isProduction ? "Invalid ID format" : "Invalid ID format (expected ObjectId or UUID)",
  });

export const userRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email format"),
  age: z.number().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const userLoginSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.email("Invalid email format").optional(),
  age: z.number().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long").optional(),
});

export const userIdParamsSchema = z.object({
  id: idSchema,
});
