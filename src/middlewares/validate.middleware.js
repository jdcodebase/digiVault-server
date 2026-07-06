import {ZodError} from "zod"
import ApiError from "../utils/apiError.js"

const validateMiddleware = (schema) => {
    return (req, res, next) => {
        try{
            const result = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            })

            req.body = result.body
            req.query = result.query
            req.params = result.params
            
            next()
        }catch (error) {
            if(error instanceof ZodError){
                const errors = error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))
                const apiError = new ApiError(400, 'Validation Error', errors)
                return next(apiError)      
            }

            next(error)
        }
    }
}

export default validateMiddleware