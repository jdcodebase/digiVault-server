import { ACCOUNT_LOCK_DURATION, EMAIL_VERIFICATION_PREFIX, EMAIL_VERIFICATION_TTL, MAX_LOGIN_ATTEMPTS, MAX_OTP_ATTEMPTS } from "../constants/security.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { hashRefreshToken, verifyRefreshTokenHash } from "../utils/refreshToken.js";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp.util.js";
import { deleteRedis, getRedis, getRedisTTL, setRedis } from "../utils/redis.util.js";
import { generateAccessToken, generateRefreshToken, generateRegistrationToken, verifyRefreshToken, verifyRegistrationToken } from "../utils/token.util.js";
import { sendVerificationEmail } from "./email.service.js";

export const sendEmailVerificationOtpService = async ({
  name,
  email,
}) => {
  // Check if email is already registered
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists. If you recently completed registration, please sign in instead."
    );
  }

  // Redis key
  const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

  // Check if an OTP already exists
  const existingVerification = await getRedis(redisKey);

  if (existingVerification) {
    const ttl = await getRedisTTL(redisKey);

    // OTP is less than 3 minutes old (10 min TTL - 3 min = 7 min remaining)
    if (ttl >= 7 * 60) {
      throw new ApiError(
        429,
        "A verification OTP has already been sent. Please wait before requesting a new one."
      );
    }
  }

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);

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

  return {
    message: "Verification OTP sent successfully.",
    data: {
      email,
    },
  };
};

export const verifyEmailOtpService = async ({ email, otp }) => {
  const redisKey = `${EMAIL_VERIFICATION_PREFIX}:${email}`;

  // Check registration session
  const verificationData = await getRedis(redisKey);

  if (!verificationData) {
    throw new ApiError(
      400,
      "Registration session expired. Please request a new verification OTP."
    );
  }

  const data = JSON.parse(verificationData);

  // Email already verified
  if (data.isVerified) {
    throw new ApiError(
      400,
      "This email has already been verified. Please request a new verification OTP to continue registration."
    );
  }

  // Maximum attempts reached
  if (data.attempts >= MAX_OTP_ATTEMPTS) {
    await deleteRedis(redisKey);

    throw new ApiError(
      429,
      "Maximum verification attempts exceeded. Please request a new verification OTP."
    );
  }

  // Verify OTP
  const isOtpValid = await verifyOtp(otp, data.hashedOtp);

  if (!isOtpValid) {
    data.attempts += 1;

    // Delete session after final failed attempt
    if (data.attempts >= MAX_OTP_ATTEMPTS) {
      await deleteRedis(redisKey);

      throw new ApiError(
        429,
        "Maximum verification attempts exceeded. Please request a new verification OTP."
      );
    }

    const remainingTTL = await getRedisTTL(redisKey);

    await setRedis(
      redisKey,
      JSON.stringify(data),
      remainingTTL
    );

    throw new ApiError(400, "Invalid OTP.");
  }

  // OTP verified successfully
  data.isVerified = true;
  data.verifiedAt = new Date().toISOString();
  data.attempts = 0;

  // Generate registration token
  const registrationToken = generateRegistrationToken({
    email: data.email,
    type: "registration",
  });

  // Keep Redis session alive for the same duration as the registration token
  await setRedis(
    redisKey,
    JSON.stringify(data),
    EMAIL_VERIFICATION_TTL
  );

  return {
    message: "Email verified successfully.",
    registrationToken,
    data: {
      name: data.name,
      email: data.email,
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

  const { email } = verifyRegistrationToken(registrationToken);

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
    $or: [
      { email },
      { phoneNumber },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      existingUser.email === email
        ? "User already exists."
        : "Phone number is already registered."
    );
  }

  const user = new User({
    name: data.name,
    email,
    phoneNumber,
    dateOfBirth,
    gender,
    password,
  });

  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = await hashRefreshToken(refreshToken);
  await user.save();

  await deleteRedis(redisKey);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Check account lock
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const retryAfter = Math.ceil(
      (user.lockUntil.getTime() - Date.now()) / 1000
    );

    throw new ApiError(
      423,
      "Account temporarily locked. Please try again later.",
      { retryAfter }
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION);
    }

    await user.save({ validateBeforeSave: false });

    throw new ApiError(401, "Invalid email or password.");
  }

  // Successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = await hashRefreshToken(refreshToken);

  await user.save({ validateBeforeSave: false });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const logoutService = async (refreshToken) => {
  // User may already have no refresh token cookie.
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId)
      .select("+refreshToken");

    if (!user || !user.refreshToken) {
      return;
    }

    const isValid = await verifyRefreshTokenHash(
      refreshToken,
      user.refreshToken
    );

    if (!isValid) {
      return;
    }

    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

  } catch {
    // Ignore invalid/expired refresh tokens.
    // The client is logging out anyway.
    return;
  }
};

export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized.");
  }

  // Verify JWT signature & expiry
  const payload = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(payload.userId)
    .select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // Ensure user hasn't logged out
  const isRefreshTokenValid = await verifyRefreshTokenHash(
    refreshToken,
    user.refreshToken
  );

  if (!isRefreshTokenValid) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // Refresh Token Rotation
  const newAccessToken = generateAccessToken(user._id);

  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = await hashRefreshToken(
    newRefreshToken
  );

  await user.save({ validateBeforeSave: false });

  return {
    message: "Access token refreshed successfully.",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    data: null,
  };
};