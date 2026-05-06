import { Router } from "express";
import { getUsers, getUser, updateUser, deleteUser, updateProfile } from "./user.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { ADMIN_ROLES, SUPER_ADMIN_ONLY } from "../../shared/constants/roles.js";

const router = Router();

router.use(authenticate);

router.patch("/profile", updateProfile);

router.use(authorize(...ADMIN_ROLES));

router.get("/", getUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", authorize(...SUPER_ADMIN_ONLY), deleteUser);

export default router;
