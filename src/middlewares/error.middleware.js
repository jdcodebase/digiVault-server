import ApiError from '../utils/apiError.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    if(!(err instanceof ApiError)) {
        let message = err.message || 'Internal Server Error';
        let statusCode = err.statusCode || 500;

        if(error.name === 'ValidationError') {
            message = Object.values(error.errors).map((el) => el.message).join(', ');
            statusCode = 400;
        }else if(error.name === 'CastError') {
            message = `Invalid ${error.path}: ${error.value}`;
            statusCode = 400;
        }else if(error.code === 11000) {
            message = `Duplicate field value entered: ${JSON.stringify(error.keyValue)}`;
            statusCode = 400;
        }else if(error.name === 'JsonWebTokenError') {
            message = 'Invalid token. Please log in again.';
            statusCode = 401;
        }else if(error.name === 'TokenExpiredError') {
            message = 'Your token has expired! Please log in again.';
            statusCode = 401;
        }

        error = new ApiError(
            statusCode,
            message,
            [],
            err.stack
        );
        error.isOperational = false;
    }

    if(error.statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} ${error.statusCode} - ${error.message}`,{
            stack: error.stack,
        });
    }else{
        logger.warn(`${req.method} ${req.originalUrl} ${error.statusCode} - ${error.message}`);
    }

    let response;

    if (typeof error.toJSON === "function") {
        response = error.toJSON();
    } else {
        response = {
            statusCode: error.statusCode,
            success: false,
            message: error.message,
            stack:
                env.NODE_ENV === "development"
                    ? error.stack
                    : undefined,
    };
    }

    return res.status(error.statusCode).json(response);
}

export default errorMiddleware;