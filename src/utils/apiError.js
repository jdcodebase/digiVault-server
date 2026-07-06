import env from '../config/env.js';

class ApiError extends Error {
    constructor(statusCode, message = 'An unexpected error occurred', errors = [], stack = null) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;
        this.errors = errors;
        this.timestamp = new Date().toISOString();
        this.isOperational = true;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON(){
        return {
            name: this.name,
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            errors: this.errors,
            timestamp: this.timestamp,
            stack: env.NODE_ENV === 'development' ? this.stack : undefined
        };
    }
}

export default ApiError;