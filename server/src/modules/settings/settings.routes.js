import { Router } from "express";
import {
  getPublicSettings,
  getAllSettings,
  updateSetting,
  updateManySettings,
} from "./settings.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { ADMIN_ROLES, SUPER_ADMIN_ONLY } from "../../shared/constants/roles.js";

const router = Router();

// Public — client storefront reads currency, taxRate, freeShippingThreshold, etc.
router.get("/public", getPublicSettings);

// Admin-only reads
router.use(authenticate, authorize(...ADMIN_ROLES));
router.get("/", getAllSettings);

// Super-admin writes
router.patch("/", authorize(...SUPER_ADMIN_ONLY), updateSetting);
router.put("/", authorize(...SUPER_ADMIN_ONLY), updateManySettings);

export default router;
