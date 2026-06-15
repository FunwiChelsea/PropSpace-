import { Request, Response, NextFunction } from "express";
import { userService } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export const userController = {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const user = await userService.getProfile(req.user.userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const user = await userService.updateProfile(req.user.userId, req.body);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      await userService.changePassword(req.user.userId, req.body);
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  },
};
