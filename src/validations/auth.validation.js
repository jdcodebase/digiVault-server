import { z } from "zod";

export const sendEmailVerificationOtpSchema = z.object({
  body: z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters.")
        .max(60, "Full name cannot exceed 60 characters."),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

export const verifyEmailOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address."),

    otp: z
      .string()
      .trim()
      .length(6, "OTP must be exactly 6 digits.")
      .regex(/^\d{6}$/, "OTP must contain only digits."),
  }),
});