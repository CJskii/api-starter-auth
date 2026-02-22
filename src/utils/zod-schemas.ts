import { z, type ZodIssue } from "zod";

// Define Zod schemas for validation
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
  id: z
    .string()
    .min(1, "User ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

export const validateUserInput = (data: unknown) => {
  const result = userRegisterSchema.safeParse(data);

  return {
    isValid: result.success,
    error: result.success ? null : result.error.issues.map((e: ZodIssue) => e.message).join(", "),
  };
};
