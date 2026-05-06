import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import config from "./core/config/index.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/error.middleware.js";
import { apiLimiter } from "./shared/middleware/rateLimiter.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import themeRoutes from "./modules/theme/theme.routes.js";
import userRoutes from "./modules/user/user.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: [config.clientUrl, config.adminUrl], credentials: true }));
app.use(morgan(config.env === "production" ? "combined" : "dev"));

app.post("/api/orders/webhook/stripe", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", env: config.env, timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
