import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import env from "../config/env.js"
import { sendEmailVerificationOtpService, verifyEmailOtpService } from "../services/auth.service.js";

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

export const registerController = asyncHandler(async (req, res) => {
    const result = await registerService({
        body: req.body,
        registrationToken: req.cookies.registrationToken,
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