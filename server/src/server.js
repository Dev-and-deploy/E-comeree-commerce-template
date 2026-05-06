import "dotenv/config";
import app from "./app.js";
import config from "./core/config/index.js";
import logger from "./core/utils/logger.js";

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.env}]`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
  process.exit(1);
});
