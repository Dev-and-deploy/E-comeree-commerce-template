import Redis from "ioredis";
import config from "../config/index.js";
import logger from "../utils/logger.js";

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error("Redis error:", err.message));

export const cacheGet = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key, value, ttlSeconds = 300) => {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const cacheDel = async (...keys) => {
  if (keys.length) await redis.del(...keys);
};

export const cacheDelPattern = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(...keys);
};

export default redis;
