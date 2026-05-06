import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import config from "./core/config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { errorHandler, notFoundHandler } from "./shared/middleware/error.middleware.js";
import { apiLimiter } from "./shared/middleware/rateLimiter.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import themeRoutes from "./modules/theme/theme.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({ origin: [config.clientUrl, config.adminUrl], credentials: true }));
app.use(morgan(config.env === "production" ? "combined" : "dev"));

app.post("/api/orders/webhook/stripe", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", env: config.env, timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admins", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
