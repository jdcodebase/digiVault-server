import ApiError from '../utils/apiError.js';

const notFoundMiddleware = (req, res, next) => {
    const message = `Cannot find ${req.originalUrl} on this server!`;
    const error = new ApiError(message, 404);
    next(error);
}

export default notFoundMiddleware;