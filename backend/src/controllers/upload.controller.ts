import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

function getPublicBaseUrl(req: Request): string {
  const host = req.get("host");
  if (!host) {
    throw new AppError("Unable to determine upload URL", 500);
  }
  return `${req.protocol}://${host}`;
}

export const uploadController = {
  uploadImages(req: Request, res: Response, next: NextFunction): void {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files?.length) {
        throw new AppError("At least one image is required", 400);
      }

      const baseUrl = getPublicBaseUrl(req);
      const urls = files.map((file) => `${baseUrl}/uploads/${file.filename}`);

      res.status(201).json({ urls });
    } catch (err) {
      next(err);
    }
  },
};
