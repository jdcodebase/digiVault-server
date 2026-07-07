import { Router } from "express";

import { sendEmailVerificationOtp } from "../controllers/auth.controller.js";
import validateMiddleware from "../middlewares/validate.middleware.js";
import { sendEmailVerificationOtpSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/send-email-verification-otp", validateMiddleware(sendEmailVerificationOtpSchema), sendEmailVerificationOtp);

export default router;
