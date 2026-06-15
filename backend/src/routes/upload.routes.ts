import { Router } from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../config/upload.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.array("images", 10),
  uploadController.uploadImages
);

export default router;
