import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import env from "../config/env.js"
import { registerService, sendEmailVerificationOtpService, verifyEmailOtpService } from "../services/auth.service.js";
import { accessCookieOptions, refreshCookieOptions } from "../constants/cookieOptions.js";

export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const result = await sendEmailVerificationOtpService({
    name,
    email,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const result = await verifyEmailOtpService(req.body);

  res.cookie("registrationToken", result.registrationToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, 
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );
});

export const register = asyncHandler(async (req, res) => {
    const result = await registerService({
        registrationToken: req.cookies.registrationToken,
        ...req.body,
    });

    res
        .status(201)
        .cookie("accessToken", result.accessToken, accessCookieOptions)
        .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
        .clearCookie("registrationToken")
        .json(
            new ApiResponse(
                201,
                "Registration completed successfully.",
                result.user
            )
        );
});