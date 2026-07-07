import { EMAIL_VERIFICATION_PREFIX, EMAIL_VERIFICATION_TTL } from "../constants/auth.constants.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { generateOtp, hashOtp } from "../utils/otp.util.js";
import { setRedis } from "../utils/redis.util.js";
import { sendVerificationEmail } from "./email.service.js";

export const sendEmailVerificationOtpService = async ({
  fullName,
  email,
}) => {
  // Check if email is already registered
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  // Redis key
  const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

  // Store verification data in Redis
  const verificationData = {
    fullName,
    email,
    hashedOtp,
    isVerified: false,
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  await setRedis(
    redisKey,
    JSON.stringify(verificationData),
    EMAIL_VERIFICATION_TTL
  );

  // Send OTP email
  await sendVerificationEmail(fullName, email, otp);

  // Return response
  return {
    message: "Verification OTP sent successfully.",
    data: {
      email,
    },
  };
};