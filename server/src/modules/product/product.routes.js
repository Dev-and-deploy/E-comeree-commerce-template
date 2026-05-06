import { Router } from "express";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAdminProducts,
  getCategories, createCategory, updateCategory, deleteCategory,
} from "./product.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { createProductSchema, updateProductSchema, createCategorySchema } from "./product.validation.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:slug", getProduct);

router.use(authenticate, authorize(...ADMIN_ROLES));

router.get("/admin/all", getAdminProducts);
router.post("/", validate(createProductSchema), createProduct);
router.patch("/:id", validate(updateProductSchema), updateProduct);
router.delete("/:id", deleteProduct);

router.post("/categories", validate(createCategorySchema), createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
