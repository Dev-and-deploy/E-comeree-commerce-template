import { Queue } from "bullmq";
import redis from "../cache/redis.js";

const connection = redis;

export const emailQueue = new Queue("email", { connection });
export const orderQueue = new Queue("order", { connection });
export const notificationQueue = new Queue("notification", { connection });

export const addEmailJob = (name, data, opts = {}) =>
  emailQueue.add(name, data, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, ...opts });

export const addOrderJob = (name, data, opts = {}) =>
  orderQueue.add(name, data, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, ...opts });

export const addNotificationJob = (name, data, opts = {}) =>
  notificationQueue.add(name, data, { attempts: 2, ...opts });
