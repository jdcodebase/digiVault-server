import { ZodError } from "zod";
import ApiError from "../utils/apiError.js";

const validateMiddleware = (schema) => {
    return (req, res, next) => {
        try {
        const result = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            });

            req.body = result.body;
            req.query = result.query;
            req.params = result.params;

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(
                    new ApiError(
                        400,
                        "Validation failed",
                        error.issues.map((issue) => ({
                            path: issue.path.length
                                ? issue.path.join(".")
                                : "body",
                            message: issue.message,
                        }))
                    )
                );
            }

            next(error);
        }
    };
};

export default validateMiddleware;