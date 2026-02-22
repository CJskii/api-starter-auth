import { Schema, model } from "mongoose";
import { mockUserModel } from "./mock-db";

export type Projection = Record<string, 0 | 1>;

export interface IUserDocLike<T> {
  toObject?: () => any;
  save: () => Promise<IUserDocLike<T>>;
  _id?: any;
  id?: string;
}

export interface IUserModelLike<T> {
  find(filter?: any, projection?: Projection): Promise<any[]>;
  findOne(filter: any, projection?: Projection): Promise<any | null>;
  findById(id: string, projection?: Projection): Promise<any | null>;
  create(data: Partial<T>): Promise<any>;
  deleteOne(filter: any): Promise<{ deletedCount?: number }>;
}

const isProduction = process.env.NODE_ENV === "production";

export interface IUser {
  save(): IUser | PromiseLike<IUser | null> | null;
  name: string;
  email: string;
  age?: number;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User: IUserModelLike<IUser> = isProduction
  ? (model<IUser>("User", userSchema) as unknown as IUserModelLike<IUser>)
  : mockUserModel;
