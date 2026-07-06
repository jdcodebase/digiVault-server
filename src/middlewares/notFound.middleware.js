import ApiError from '../utils/apiError.js';

const notFoundMiddleware = (req, res, next) => {
    const message = `Cannot find ${req.originalUrl} on this server!`;
    const error = new ApiError(404,message);
    next(error);
}

export default notFoundMiddleware;