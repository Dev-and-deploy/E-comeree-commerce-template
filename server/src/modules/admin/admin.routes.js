import { Router } from "express";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminActive,
  deleteAdmin,
} from "./admin.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { SUPER_ADMIN_ONLY } from "../../shared/constants/roles.js";
import {
  createAdminSchema,
  updateAdminSchema,
  adminIdSchema,
} from "./admin.validation.js";

const router = Router();

// All admin-management routes are SUPER_ADMIN only
router.use(authenticate, authorize(...SUPER_ADMIN_ONLY));

router.get("/", getAdmins);
router.post("/", validate(createAdminSchema), createAdmin);
router.patch("/:id", validate(updateAdminSchema), updateAdmin);
router.patch("/:id/toggle-active", validate(adminIdSchema), toggleAdminActive);
router.delete("/:id", validate(adminIdSchema), deleteAdmin);

export default router;
