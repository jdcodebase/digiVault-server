import { Router } from "express";

import {
    sendEmailVerificationOtp,
    verifyEmailOtp,
    register,
} from "../controllers/auth.controller.js";

import validateMiddleware from "../middlewares/validate.middleware.js";

import {
    sendEmailVerificationOtpSchema,
    verifyEmailOtpSchema,
    registerSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post(
    "/send-email-verification-otp",
    validateMiddleware(sendEmailVerificationOtpSchema),
    sendEmailVerificationOtp
);

router.post(
    "/verify-email-otp",
    validateMiddleware(verifyEmailOtpSchema),
    verifyEmailOtp
);

router.post(
    "/register",
    validateMiddleware(registerSchema),
    register
);

export default router;