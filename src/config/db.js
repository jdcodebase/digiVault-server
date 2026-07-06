import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

export let isShuttingDown = false;

export const setShutdownState = (value) => {
    isShuttingDown = value;
};

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(env.MONGODB_URI, {
            autoIndex: env.NODE_ENV === "development",
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 5,
        });

        logger.info("MongoDB connected successfully");
        logger.info(`Database: ${conn.connection.name}`);
        logger.info(`Host: ${conn.connection.host}`);
    } catch (error) {
        logger.error("Error connecting to MongoDB", {
            message: error.message,
            stack: error.stack,
        });

        process.exit(1);
    }
};

mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error", {
        message: error.message,
    });
});

mongoose.connection.on("disconnected", () => {
    if (isShuttingDown) return;

    logger.warn("MongoDB connection lost.");
});

mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected successfully.");
});

export default connectDB;