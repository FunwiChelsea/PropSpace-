import { Router } from "express";
import { propertyController } from "../controllers/property.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody, validateQuery } from "../middleware/validate.middleware.js";
import {
  createPropertySchema,
  propertyFilterSchema,
  updatePropertySchema,
} from "../utils/validators.js";

const router = Router();

router.get("/", validateQuery(propertyFilterSchema), propertyController.list);
router.get("/mine", authenticate, propertyController.listMine);
router.get("/:id", propertyController.getById);
router.post("/", authenticate, validateBody(createPropertySchema), propertyController.create);
router.put("/:id", authenticate, validateBody(updatePropertySchema), propertyController.update);
router.delete("/:id", authenticate, propertyController.remove);

export default router;
