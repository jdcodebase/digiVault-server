import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import env from './config/env.js';
import logger from './config/logger.js';
import notFoundMiddleware from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import routes from "./routes/index.js";

const app = express()

app.use(helmet({
    crossOriginResourcePolicy: false
}));

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));

app.use(compression());

app.use(express.json({
    limit: '10kb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));

app.use(cookieParser());

app.use(ExpressMongoSanitize())

app.use(morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to DigiVault API",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/v1', globalLimiter, routes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;