import { Types } from "mongoose";

export function validateMongoId(id: string): { isValid: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { isValid: false, error: "ID is required" };
  }
  if (!Types.ObjectId.isValid(id)) {
    return { isValid: false, error: "Invalid ID format" };
  }
  return { isValid: true };
}
