import { Request, Response, NextFunction } from "express";
import { propertyService } from "../services/property.service.js";
import { AppError } from "../utils/AppError.js";

function paramId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export const propertyController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const properties = await propertyService.list(
        (req.validatedQuery ?? {}) as {
          city?: string;
          minPrice?: number;
          maxPrice?: number;
        }
      );
      res.status(200).json(properties);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await propertyService.getById(paramId(req));
      res.status(200).json(property);
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const properties = await propertyService.listByAuthor(req.user.userId);
      res.status(200).json(properties);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const property = await propertyService.create(req.user.userId, req.body);
      res.status(201).json(property);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      const property = await propertyService.update(paramId(req), req.user.userId, req.body);
      res.status(200).json(property);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError("Unauthorized", 401);
      await propertyService.delete(paramId(req), req.user.userId);
      res.status(200).json({ message: "Property deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
