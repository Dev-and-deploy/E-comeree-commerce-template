import { Worker } from "bullmq";
import redis from "../core/cache/redis.js";
import prisma from "../core/database/prisma.js";
import logger from "../core/utils/logger.js";

const worker = new Worker(
  "order",
  async (job) => {
    logger.info(`Order job: ${job.name}`, { id: job.id });

    switch (job.name) {
      case "process_order": {
        const order = await prisma.order.findUnique({
          where: { id: job.data.orderId },
          include: { items: true },
        });
        if (!order) break;

        await Promise.all(
          order.items.map((item) =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          )
        );

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PROCESSING" },
        });

        logger.info(`Order ${order.orderNumber} processed — stock updated`);
        break;
      }

      case "generate_invoice": {
        logger.info(`Invoice generation for order ${job.data.orderId}`);
        break;
      }

      default:
        logger.warn(`Unknown order job type: ${job.name}`);
    }
  },
  { connection: redis, concurrency: 3 }
);

worker.on("completed", (job) => logger.info(`Order job ${job.id} completed`));
worker.on("failed", (job, err) => logger.error(`Order job ${job?.id} failed:`, err.message));

export default worker;
