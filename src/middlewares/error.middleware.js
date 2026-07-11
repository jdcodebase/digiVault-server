import ApiError from "../utils/apiError.js";
import env from "../config/env.js";
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        let statusCode =
            Number.isInteger(error.statusCode) &&
            error.statusCode >= 100 &&
            error.statusCode <= 599
                ? error.statusCode
                : 500;

        let message = error.message || "Internal Server Error";
        let errors = [];

        switch (error.name) {
            case "ValidationError":
                statusCode = 400;
                message = "Validation failed";
                errors = Object.values(error.errors).map((item) => ({
                    field: item.path,
                    message: item.message,
                }));
                break;

            case "CastError":
                statusCode = 400;
                message = `Invalid ${error.path}: ${error.value}`;
                break;

            case "JsonWebTokenError":
                statusCode = 401;
                message = "Invalid token. Please log in again.";
                break;

            case "TokenExpiredError":
                statusCode = 401;
                message = "Your token has expired. Please log in again.";
                break;

            default:
                if (error.code === 11000) {
                    statusCode = 409;

                    const field = Object.keys(error.keyValue)[0];
                    const value = error.keyValue[field];

                    message = `${field} "${value}" already exists.`;
                }
        }

        error = new ApiError(
            statusCode,
            message,
            errors,
            error.stack
        );
    }

    const logMeta = {
        statusCode: error.statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        stack: error.stack,
    };

    if (error.statusCode >= 500) {
        logger.error(error.message, logMeta);
    } else {
        logger.warn(error.message, logMeta);
    }

    return res.status(error.statusCode).json(error.toJSON());
};

export default errorMiddleware;