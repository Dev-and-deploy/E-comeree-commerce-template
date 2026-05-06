import { Router } from "express";
import {
  getActiveTheme, getAllThemes, createTheme, updateTheme, activateTheme,
  getTemplates, getAdminSettings, updateAdminSetting,
} from "./theme.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { ADMIN_ROLES, SUPER_ADMIN_ONLY } from "../../shared/constants/roles.js";

const router = Router();

router.get("/active", getActiveTheme);
router.get("/templates", getTemplates);

router.use(authenticate, authorize(...ADMIN_ROLES));

router.get("/", getAllThemes);
router.post("/", createTheme);
router.patch("/:id", updateTheme);
router.post("/:id/activate", activateTheme);

router.get("/settings", getAdminSettings);
router.patch("/settings", authorize(...SUPER_ADMIN_ONLY), updateAdminSetting);

export default router;
