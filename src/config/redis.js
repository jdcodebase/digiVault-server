import Redis from "ioredis";
import env from "./env.js";
import logger from "../utils/logger.js";

const redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,

    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
});

redisClient.on("connect", () => {
    logger.info("Connected to Redis");
});

redisClient.on("ready", () => {
    logger.info("Redis is ready");
});

redisClient.on("error", (err) => {
    logger.error(`Redis Error: ${err.message}`);
});

redisClient.on("reconnecting", (delay) => {
    logger.warn(`Reconnecting to Redis in ${delay}ms`);
});

redisClient.on("end", () => {
    logger.warn("Redis connection closed");
});

export default redisClient;