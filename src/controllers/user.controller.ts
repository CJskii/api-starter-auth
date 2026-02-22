import type { Request, Response } from "express";
import { logger } from "../utils/logger";
import { AuthRequest } from "../middleware/auth";
import { userService } from "../services/user.service";

function handleServiceError(res: Response, error: unknown, fallbackMessage: string) {
  const status = (error as any)?.status;
  const message = (error as any)?.message;

  if (typeof status === "number" && typeof message === "string") {
    return res.status(status).json({ message });
  }

  logger.error(fallbackMessage, {
    error,
    message: (error as any)?.message,
    stack: (error as any)?.stack,
  });

  return res.status(500).json({ message: fallbackMessage, error });
}

export const userController = {
  // GET /user
  list: async (_req: Request, res: Response) => {
    try {
      logger.info("Fetching all users");
      const users = await userService.listUsers();
      logger.info("Successfully fetched users", { count: users.length });
      return res.json(users);
    } catch (error) {
      return handleServiceError(res, error, "Error fetching users");
    }
  },

  // GET /user/:id
  getById: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      logger.info("Fetching user by ID", { id });

      const user = await userService.getUserById(id, req.user?.id);

      logger.info("Successfully fetched user", { id: user.id });
      return res.json(user);
    } catch (error) {
      return handleServiceError(res, error, "Error fetching user");
    }
  },

  // POST /user/register
  register: async (req: Request, res: Response) => {
    try {
      const payload = req.body as { name: string; email: string; age?: number; password: string };

      logger.info("Registering new user", { name: payload.name, email: payload.email });

      const result = await userService.register(payload);

      logger.info("User registered successfully", { id: result.user.id, email: result.user.email });
      return res.status(201).json(result);
    } catch (error) {
      return handleServiceError(res, error, "Error creating user");
    }
  },

  // POST /user/login
  login: async (req: Request, res: Response) => {
    try {
      const payload = req.body as { email: string; password: string };
      logger.info("User login attempt", { email: payload.email });

      const result = await userService.login(payload);

      logger.info("User login successful", { id: result.user.id, email: result.user.email });
      return res.json(result);
    } catch (error) {
      return handleServiceError(res, error, "Error logging in");
    }
  },

  // PUT /user/:id
  update: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const payload = req.body as {
        name?: string;
        email?: string;
        age?: number;
        password?: string;
      };

      logger.info("Updating user", { id });

      const updatedUser = await userService.update(id, req.user?.id, payload);

      logger.info("User updated successfully", { id: updatedUser.id });
      return res.json(updatedUser);
    } catch (error) {
      return handleServiceError(res, error, "Error updating user");
    }
  },

  // DELETE /user/:id
  remove: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      logger.info("Deleting user", { id });

      await userService.remove(id, req.user?.id);

      logger.info("User deleted successfully", { id });
      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      return handleServiceError(res, error, "Error deleting user");
    }
  },
};
