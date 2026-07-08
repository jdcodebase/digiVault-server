import redisClient from "../config/redis.js";

export const setRedis = async (key, value, ttl) => {
  await redisClient.set(key, value, "EX", ttl);
};

export const getRedis = async (key) => {
  return await redisClient.get(key);
};

export const getRedisTTL = async (key) => {
  return await redisClient.ttl(key);
};

export const deleteRedis = async (key) => {
  await redisClient.del(key);
};
