import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils";
import { dbAdapter } from "../mongodb/db-adapter";
import { toUserDto } from "../mappers";
import { logger } from "../utils/logger";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const userService = {
  listUsers: async () => {
    const users = await dbAdapter.findAllUsers();
    return users.map(toUserDto);
  },

  getUserById: async (id: string, requesterId?: string) => {
    const user = await dbAdapter.findUserById(id);
    if (!user) throw new HttpError(404, "User not found");

    if (!requesterId || requesterId !== user.id.toString()) {
      throw new HttpError(403, "Access denied");
    }

    return toUserDto(user);
  },

  register: async (payload: { name: string; email: string; age?: number; password: string }) => {
    const existing = await dbAdapter.findUserByEmail(payload.email);
    if (existing) throw new HttpError(409, "User with this email already exists");

    const created = await dbAdapter.createUser({
      name: payload.name,
      email: payload.email,
      age: payload.age,
      password: hashPassword(payload.password),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = jwt.sign({ id: created.id, email: created.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

    return { user: toUserDto(created), token };
  },

  login: async (payload: { email: string; password: string }) => {
    const user = await dbAdapter.findUserByEmailWithPassword(payload.email);
    if (!user) throw new HttpError(401, "Invalid email or password");

    if (!comparePassword(payload.password, user.password)) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

    return { user: toUserDto(user), token };
  },

  update: async (
    id: string,
    requesterId: string | undefined,
    payload: { name?: string; email?: string; age?: number; password?: string },
  ) => {
    if (!requesterId || requesterId !== id) {
      throw new HttpError(403, "Access denied. You can only update your own profile.");
    }

    const existing = await dbAdapter.findUserDocById(id);
    if (!existing) throw new HttpError(404, "User not found");

    const update: any = { updatedAt: new Date() };
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.email !== undefined) update.email = payload.email;
    if (payload.age !== undefined) update.age = payload.age;
    if (payload.password !== undefined) update.password = hashPassword(payload.password);

    const updated = await dbAdapter.updateUser(existing, update);
    logger.info("User updated successfully", { id: updated.id });
    return toUserDto(updated);
  },

  remove: async (id: string, requesterId?: string) => {
    if (!requesterId || requesterId !== id) {
      throw new HttpError(403, "Access denied. You can only delete your own profile.");
    }

    const existed = await dbAdapter.deleteUser(id);
    if (!existed) throw new HttpError(404, "User not found");
  },
};
