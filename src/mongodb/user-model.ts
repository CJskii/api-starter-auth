import { Schema, model, Document } from "mongoose";
import { mockUserModel } from "./mock-db";

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Mongoose schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Export the appropriate User model based on environment
// In production, use Mongoose model; in development, use mock database
// Use type assertion to satisfy TypeScript
export const User = isProduction ? model<IUser>("User", userSchema) : (mockUserModel as any);
