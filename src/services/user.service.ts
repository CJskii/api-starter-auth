import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils/password";
import { dbAdapter } from "../mongodb/db-adapter";
import { toUserDto } from "../mappers";
import { logger } from "../utils/index";
import { HttpError } from "./http-error";

export const userService = {
  listUsers: async () => {
    logger.info("user.list", { layer: "service", module: "userService", action: "listUsers" });

    const users = await dbAdapter.findAllUsers();

    logger.info("user.list.success", {
      layer: "service",
      module: "userService",
      action: "listUsers",
      count: users.length,
    });

    return users.map(toUserDto);
  },

  getUserById: async (id: string, requesterId?: string) => {
    logger.info("user.getById", { layer: "service", module: "userService", action: "getUserById", id, requesterId });

    const user = await dbAdapter.findUserById(id);
    if (!user) throw new HttpError(404, "User not found", "USER_NOT_FOUND");

    if (!requesterId || requesterId !== user.id.toString()) {
      logger.warn("user.getById.denied", {
        layer: "service",
        module: "userService",
        action: "getUserById",
        id,
        requesterId,
      });
      throw new HttpError(403, "Access denied", "ACCESS_DENIED");
    }

    logger.info("user.getById.success", {
      layer: "service",
      module: "userService",
      action: "getUserById",
      id: user.id,
    });

    return toUserDto(user);
  },

  register: async (payload: { name: string; email: string; age?: number; password: string }) => {
    logger.info("user.register", {
      layer: "service",
      module: "userService",
      action: "register",
      email: payload.email,
    });

    const existing = await dbAdapter.findUserByEmail(payload.email);
    if (existing) throw new HttpError(409, "User with this email already exists", "USER_EXISTS");

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

    logger.info("user.register.success", {
      layer: "service",
      module: "userService",
      action: "register",
      id: created.id,
      email: created.email,
    });

    return { user: toUserDto(created), token };
  },

  login: async (payload: { email: string; password: string }) => {
    logger.info("user.login", { layer: "service", module: "userService", action: "login", email: payload.email });

    const user = await dbAdapter.findUserByEmailWithPassword(payload.email);
    if (!user) throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");

    if (!comparePassword(payload.password, user.password)) {
      logger.warn("user.login.invalid_password", {
        layer: "service",
        module: "userService",
        action: "login",
        email: payload.email,
      });
      throw new HttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

    logger.info("user.login.success", { layer: "service", module: "userService", action: "login", id: user.id });

    return { user: toUserDto(user), token };
  },

  update: async (
    id: string,
    requesterId: string | undefined,
    payload: { name?: string; email?: string; age?: number; password?: string },
  ) => {
    logger.info("user.update", { layer: "service", module: "userService", action: "update", id, requesterId });

    if (!requesterId || requesterId !== id) {
      logger.warn("user.update.denied", { layer: "service", module: "userService", action: "update", id, requesterId });
      throw new HttpError(403, "Access denied. You can only update your own profile.", "ACCESS_DENIED");
    }

    const existing = await dbAdapter.findUserDocById(id);
    if (!existing) throw new HttpError(404, "User not found", "USER_NOT_FOUND");

    const updateData: any = { updatedAt: new Date() };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.age !== undefined) updateData.age = payload.age;
    if (payload.password !== undefined) updateData.password = hashPassword(payload.password);

    const updated = await dbAdapter.updateUser(existing, updateData);

    logger.info("user.update.success", { layer: "service", module: "userService", action: "update", id: updated.id });

    return toUserDto(updated);
  },

  remove: async (id: string, requesterId?: string) => {
    logger.info("user.remove", { layer: "service", module: "userService", action: "remove", id, requesterId });

    if (!requesterId || requesterId !== id) {
      logger.warn("user.remove.denied", { layer: "service", module: "userService", action: "remove", id, requesterId });
      throw new HttpError(403, "Access denied. You can only delete your own profile.", "ACCESS_DENIED");
    }

    const existed = await dbAdapter.deleteUser(id);
    if (!existed) throw new HttpError(404, "User not found", "USER_NOT_FOUND");

    logger.info("user.remove.success", { layer: "service", module: "userService", action: "remove", id });
  },
};