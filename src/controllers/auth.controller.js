import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { sendEmailVerificationOtpService, verifyEmailOtpService } from "../services/auth.service.js";

export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  const result = await sendEmailVerificationOtpService({
    fullName,
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

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      result.data
    )
  );
});