import { Router } from "express";
import {
  getBlogs,
  getBlog,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "./blog.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { createBlogSchema, updateBlogSchema } from "./blog.validation.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();
const requireAdmin = [authenticate, authorize(...ADMIN_ROLES)];

// Public
router.get("/", getBlogs);

// Admin
router.get("/admin/all", requireAdmin, getAdminBlogs);
router.post("/", requireAdmin, validate(createBlogSchema), createBlog);
router.patch("/:id", requireAdmin, validate(updateBlogSchema), updateBlog);
router.delete("/:id", requireAdmin, deleteBlog);

// Public — must be last to avoid catching /admin/all
router.get("/:slug", getBlog);

export default router;
