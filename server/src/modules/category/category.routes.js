import { Router } from "express";
import {
  getCategories, getAdminCategories, createCategory, updateCategory, deleteCategory,
} from "./category.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

const router = Router();

router.get("/", getCategories);

router.use(authenticate, authorize(...ADMIN_ROLES));

router.get("/admin", getAdminCategories);
router.post("/", validate(createCategorySchema), createCategory);
router.patch("/:id", validate(updateCategorySchema), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
