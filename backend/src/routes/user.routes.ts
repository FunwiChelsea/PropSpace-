import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { changePasswordSchema, updateProfileSchema } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get("/me", userController.getMe);
router.put("/me", validateBody(updateProfileSchema), userController.updateMe);
router.put("/me/password", validateBody(changePasswordSchema), userController.changePassword);

export default router;
