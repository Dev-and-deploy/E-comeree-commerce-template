import { Worker } from "bullmq";
import redis from "../core/cache/redis.js";
import logger from "../core/utils/logger.js";

const worker = new Worker(
  "notification",
  async (job) => {
    logger.info(`Notification job: ${job.name}`, { id: job.id });

    switch (job.name) {
      case "push":
        logger.info(`Push notification to user ${job.data.userId}: ${job.data.message}`);
        break;

      case "sms":
        logger.info(`SMS to ${job.data.phone}: ${job.data.message}`);
        break;

      case "admin_alert":
        logger.warn(`Admin alert: ${job.data.message}`);
        break;

      default:
        logger.warn(`Unknown notification job: ${job.name}`);
    }
  },
  { connection: redis, concurrency: 10 }
);

worker.on("completed", (job) => logger.info(`Notification job ${job.id} completed`));
worker.on("failed", (job, err) => logger.error(`Notification job ${job?.id} failed:`, err.message));

export default worker;
