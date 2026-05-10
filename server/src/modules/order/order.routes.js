import { Router } from "express";
import express from "express";
import { createOrder, stripeWebhook, getOrders, getOrder, getMyOrders, updateOrderStatus, cancelOrder } from "./order.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/role.middleware.js";
import { ADMIN_ROLES } from "../../shared/constants/roles.js";

const router = Router();

router.post("/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);

router.use(authenticate);

router.post("/", createOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/cancel", cancelOrder);

router.use(authorize(...ADMIN_ROLES));
router.get("/", getOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
