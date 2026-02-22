import crypto from "crypto";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

// Helper function to hash passwords
const hashPassword = (password: string): string => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

// Helper function to validate ID format and return error if invalid
const validateId = (id: string): { isValid: boolean; error?: string } => {
  if (!id) {
    return { isValid: false, error: "ID is required" };
  }

  if (process.env.NODE_ENV === "production" && !Types.ObjectId.isValid(id)) {
    return { isValid: false, error: "Invalid ID format" };
  }

  if (process.env.NODE_ENV !== "production" && !Types.ObjectId.isValid(id)) {
    // In development, we allow UUIDs but still validate they're properly formatted
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { isValid: false, error: "Invalid ID format" };
    }
  }

  return { isValid: true };
};

// Helper function to compare passwords
const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

export { hashPassword, validateId, comparePassword };
