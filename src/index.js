import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";
import connectDB, { setShutdownState } from "./config/db.js";
import redisClient from "./config/redis.js";

import mongoose from "mongoose";
import { verifyTransporter } from "./services/email.service.js";

const PORT = env.PORT || 8000;

let httpServer;
let isShuttingDown = false;

const startServer = async () => {
  try {

    logger.info("Connecting to MongoDB...");
    await connectDB();

    logger.info("Connecting to Redis...");
    if (redisClient.status !== "ready") {
      await redisClient.connect();
    }

    logger.info("Verifying email transporter...");
    await verifyTransporter();

    httpServer = app.listen(PORT, () => {
      logger.info("Welcome to DigiVault Server!");
      logger.info(
        `Server running in ${env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error("Failed to start server", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();

/**
 * Handle unhandled Promise rejections
 */
process.on("unhandledRejection", async (reason) => {
  logger.error("Unhandled Promise Rejection", {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });

  await shutdown("UNHANDLED_REJECTION");
});

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", async (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });

  await shutdown("UNCAUGHT_EXCEPTION");
});

/**
 * Gracefully shut down the application
 */
const shutdown = async (signal) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  logger.warn(`Received ${signal}. Starting graceful shutdown...`);

  const forceShutdownTimeout = setTimeout(() => {
    logger.error("Forced shutdown after 10 seconds.");
    process.exit(1);
  }, 10000);

  forceShutdownTimeout.unref();

  try {
    // Stop accepting new requests
    if (httpServer) {
      await new Promise((resolve) => {
        httpServer.close(() => {
          logger.info("HTTP server closed.");
          resolve();
        });
      });
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      setShutdownState(true);

      await mongoose.connection.close();
      logger.info("MongoDB connection closed.");
    }

    // Disconnect Redis
    if (redisClient.status !== "end") {
      redisClient.disconnect();
      logger.info("Redis connection closed.");
    }

    clearTimeout(forceShutdownTimeout);

    logger.info("Graceful shutdown completed.");

    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimeout);

    logger.error("Error during shutdown", {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

/**
 * Handle termination signals
 */

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));