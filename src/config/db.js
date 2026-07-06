import mongoose from 'mongoose';
import env from "./env.js"
import logger from "../utils/logger.js";

const connectDB = async () => {
    try{
        mongoose.set('strictQuery', true);

        const conn = await mongoose.connect(env.MONGODB_URI, {
            autoIndex: env.NODE_ENV === 'development',
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            minPoolSize: 5,
        })

        logger.info("MongoDB connected successfully");
        logger.info(`Database: ${conn.connection.name}`);
        logger.info(`Host: ${conn.connection.host}`);
    }catch(err){
        logger.error("Error connecting to MongoDB:");
        logger.error(err.message);
        process.exit(1);
    }
}


mongoose.connection.on("error",(error)=>{
    logger.error("MongoDB connection error:");
    logger.error(error.message);
})

mongoose.connection.on("disconnected",()=>{
    logger.warn("MongoDB disconnected. Attempting to reconnect...");
})

mongoose.connection.on("reconnected",()=>{
    logger.info("MongoDB reconnected successfully.");
})  


export default connectDB;