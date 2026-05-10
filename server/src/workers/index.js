import "./email.worker.js";
import "./order.worker.js";
import "./notification.worker.js";
import logger from "../core/utils/logger.js";

logger.info("Workers started — email, order, notification");

process.on("SIGTERM", () => {
  logger.info("Workers shutting down gracefully");
  process.exit(0);
});
