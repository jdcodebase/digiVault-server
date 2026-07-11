import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import env from "../config/env.js"
import { loginService, logoutService, registerService, sendEmailVerificationOtpService, verifyEmailOtpService } from "../services/auth.service.js";
import { accessCookieOptions, clearAccessCookieOptions, clearRefreshCookieOptions, clearRegistrationCookieOptions, refreshCookieOptions, registrationCookieOptions } from "../constants/cookieOptions.js";

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

  res
    .status(200)
    .cookie("registrationToken", result.registrationToken, registrationCookieOptions)
    .json(
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
        .clearCookie("registrationToken", clearRegistrationCookieOptions)
        .json(
            new ApiResponse(
                201,
                "Registration completed successfully.",
                result.user
            )
        );
});

export const login = asyncHandler(async(req,res)=>{
  const result = await loginService(req.body)

  res
      .status(200)
      .cookie("accessToken", result.accessToken, accessCookieOptions)
      .cookie("refreshToken", result.refreshToken, refreshCookieOptions)
      .json(
            new ApiResponse(
                200,
                "Logged in successfully.",
                result.user
            )
        );
})

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.cookies.refreshToken);

  res
    .status(200)
    .clearCookie("accessToken", clearAccessCookieOptions)
    .clearCookie("refreshToken", clearRefreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        "Logged out successfully."
      )
    );
});