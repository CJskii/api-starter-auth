import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { userService } from "../services/user.service";

export const userController = {
  // GET /user  (requires auth)
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.listUsers();
      res.json(users);
    } catch (e) {
      next(e);
    }
  },

  // GET /user/:id  (requires auth)
  getById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.id, req.user?.id);
      res.json(user);
    } catch (e) {
      next(e);
    }
  },

  // POST /user/register
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  // POST /user/login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.login(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  // PUT /user/:id  (requires auth)
  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await userService.update(req.params.id, req.user?.id, req.body);
      res.json(updated);
    } catch (e) {
      next(e);
    }
  },

  // DELETE /user/:id  (requires auth)
  remove: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await userService.remove(req.params.id, req.user?.id);
      res.json({ message: "User deleted successfully" });
    } catch (e) {
      next(e);
    }
  },
};
