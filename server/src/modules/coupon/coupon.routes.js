import { Router } from "express";
import {
  getCoupons, getCoupon, getBannerCoupon, createCoupon, updateCoupon, deleteCoupon, validateCoupon,
} from "./coupon.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { createCouponSchema, updateCouponSchema } from "./coupon.validation.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();
const requireAdmin = [authenticate, authorize(...ADMIN_ROLES)];

router.get("/banner", getBannerCoupon);
router.post("/validate", validateCoupon);

router.get("/", requireAdmin, getCoupons);
router.get("/:id", requireAdmin, getCoupon);
router.post("/", requireAdmin, validate(createCouponSchema), createCoupon);
router.patch("/:id", requireAdmin, validate(updateCouponSchema), updateCoupon);
router.delete("/:id", requireAdmin, deleteCoupon);

export default router;
