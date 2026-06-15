import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, errors: err.errors });
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller"
        : err.code === "LIMIT_FILE_COUNT"
          ? "You can upload up to 10 images at a time"
          : err.message;
    res.status(400).json({ message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
    return;
  }

  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error && (err as { code?: number }).code === 11000) {
    res.status(400).json({ message: "Duplicate field value" });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}
