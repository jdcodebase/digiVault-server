import { EMAIL_VERIFICATION_PREFIX, EMAIL_VERIFICATION_TTL, MAX_OTP_ATTEMPTS } from "../constants/auth.constants.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { hashRefreshToken } from "../utils/hash.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.util.js";
import { deleteRedis, getRedis, getRedisTTL, setRedis } from "../utils/redis.util.js";
import { generateAccessToken, generateRefreshToken, generateRegistrationToken, verifyRegistrationToken } from "../utils/token.util.js";
import { sendVerificationEmail } from "./email.service.js";

export const sendEmailVerificationOtpService = async ({
  name,
  email,
}) => {
  // Check if email is already registered
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists. If you recently completed registration, please sign in instead.");
  }

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

  // Redis key
  const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

  // Store verification data in Redis
  const verificationData = {
    name,
    email,
    hashedOtp,
    isVerified: false,
    attempts: 0,
    verifiedAt: null,
    createdAt: new Date().toISOString(),
  };

  await setRedis(
    redisKey,
    JSON.stringify(verificationData),
    EMAIL_VERIFICATION_TTL
  );

  // Send OTP email
  await sendVerificationEmail(name, email, otp);

  // Return response
  return {
    message: "Verification OTP sent successfully.",
    data: {
      email,
    },
  };
};

export const verifyEmailOtpService = async ({
    email,
    otp,
}) => {
    const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

    const verificationData = await getRedis(redisKey);

    if (!verificationData) {
        throw new ApiError(
            400,
            "OTP has expired. Please request a new one."
        );
    }

    const data = JSON.parse(verificationData);

    if (data.isVerified) {
        throw new ApiError(
            400,
            "Email is already verified."
        );
    }

    if (data.attempts >= MAX_OTP_ATTEMPTS) {
        throw new ApiError(
            429,
            "Maximum verification attempts exceeded. Request a new OTP."
        );
    }

    const isOtpValid = await verifyOtp(
        otp,
        data.hashedOtp
    );


    if (!isOtpValid) {
        data.attempts += 1;

        const remainingTTL = await getRedisTTL(redisKey);

        await setRedis(redisKey, JSON.stringify(data), remainingTTL);

        if (data.attempts >= MAX_OTP_ATTEMPTS) {
            throw new ApiError(
                429,
                "Maximum verification attempts exceeded. Please request a new OTP."
            );
        }

        throw new ApiError(400, "Invalid OTP.");
    }

    data.isVerified = true;
    data.verifiedAt = new Date().toISOString();

    await setRedis(
        redisKey,
        JSON.stringify(data),
        EMAIL_VERIFICATION_TTL
    );

    const registrationToken = generateRegistrationToken({
        email: data.email,
        type: "registration",
    });

    return {
        message: "Email verified successfully.",
        registrationToken,
        data: {
            name: data.name,
        },
    };
};

export const registerService = async ({
    registrationToken,
    phoneNumber,
    dateOfBirth,
    gender,
    password,
}) => {

    if (!registrationToken) {
        throw new ApiError(401, "Registration session expired.");
    }

    const payload = verifyRegistrationToken(registrationToken);

    const email = payload.email;

    const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

    const verificationData = await getRedis(redisKey);

    if (!verificationData) {
        throw new ApiError(404, "Verification session not found.");
    }

    const data = JSON.parse(verificationData);

    if (!data.isVerified) {
        throw new ApiError(403, "Email is not verified.");
    }

    const existingUser = await User.findOne({
        email: data.email,
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists.");
    }
    
    const user = new User({
        name: data.name,
        email: data.email,
        phoneNumber,
        dateOfBirth,
        gender,
        password,
    });

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = await hashRefreshToken(refreshToken);

    await user.save();

    await deleteRedis(redisKey);

    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
    };

    return {
        user: userResponse,
        accessToken,
        refreshToken,
    };
};