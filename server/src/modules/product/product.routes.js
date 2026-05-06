import { Router } from "express";
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getAdminProducts,
} from "./product.controller.js";
import categoryRoutes from "../category/category.routes.js";
import { getAdminCategories } from "../category/category.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validation.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();
const requireAdmin = [authenticate, authorize(...ADMIN_ROLES)];

router.get("/", getProducts);
router.use("/categories", categoryRoutes);

router.get("/admin/all", requireAdmin, getAdminProducts);
router.get("/admin/categories", requireAdmin, getAdminCategories);
router.post("/", requireAdmin, validate(createProductSchema), createProduct);
router.patch("/:id", requireAdmin, validate(updateProductSchema), updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

router.get("/:slug", getProduct);

export default router;
