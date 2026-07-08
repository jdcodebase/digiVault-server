import { Router } from "express";

import { sendEmailVerificationOtp, verifyEmailOtp } from "../controllers/auth.controller.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import { sendEmailVerificationOtpSchema, verifyEmailOtpSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/send-email-verification-otp", validateMiddleware(sendEmailVerificationOtpSchema), sendEmailVerificationOtp);
router.post("/verify-email-otp", validateMiddleware(verifyEmailOtpSchema), verifyEmailOtp);

export default router;
