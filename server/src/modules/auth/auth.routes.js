import { Router } from "express";
import { register, login, refreshToken, logout, me } from "./auth.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { validate } from "../../shared/middleware/validate.middleware.js";
import { authLimiter } from "../../shared/middleware/rateLimiter.middleware.js";
import { registerSchema, loginSchema,  } from "./auth.validation.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
