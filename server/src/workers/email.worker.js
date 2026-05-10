import { Worker } from "bullmq";
import redis from "../core/cache/redis.js";
import { sendMail, sendOrderConfirmation } from "../core/mail/index.js";
import logger from "../core/utils/logger.js";

const worker = new Worker(
  "email",
  async (job) => {
    logger.info(`Email job: ${job.name}`, { id: job.id });

    switch (job.name) {
      case "welcome":
        await sendMail({
          to: job.data.to,
          subject: "Welcome to MyStore!",
          html: `<h1>Welcome, ${job.data.name}!</h1><p>Thank you for joining us.</p>`,
        });
        break;

      case "order_confirmation":
        await sendOrderConfirmation(job.data.to, job.data.order);
        break;

      case "order_status_update":
        await sendMail({
          to: job.data.to,
          subject: `Order Update — #${job.data.order.orderNumber}`,
          html: `<p>Your order <strong>#${job.data.order.orderNumber}</strong> status is now: <strong>${job.data.order.status}</strong></p>`,
        });
        break;

      case "password_reset":
        await sendMail({
          to: job.data.to,
          subject: "Password Reset Request",
          html: `<p>Click <a href="${job.data.resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
        });
        break;

      default:
        logger.warn(`Unknown email job type: ${job.name}`);
    }
  },
  { connection: redis, concurrency: 5 }
);

worker.on("completed", (job) => logger.info(`Email job ${job.id} completed`));
worker.on("failed", (job, err) => logger.error(`Email job ${job?.id} failed:`, err.message));

export default worker;
