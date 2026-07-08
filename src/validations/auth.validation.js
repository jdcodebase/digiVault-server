import { z } from "zod";

export const sendEmailVerificationOtpSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "name must be at least 2 characters.")
        .max(60, "name cannot exceed 60 characters."),

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

export const registerSchema = z
    .object({
        body: z.object({
            phoneNumber: z
                .string()
                .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

            dateOfBirth: z.coerce.date(),

            password: z
                .string()
                .min(8)
                .max(64)
                .regex(/[A-Z]/, "One uppercase required")
                .regex(/[a-z]/, "One lowercase required")
                .regex(/[0-9]/, "One digit required")
                .regex(/[^A-Za-z0-9]/, "One special character required"),

            confirmPassword: z.string(),
        }),
    })
    .refine(
        (data) => data.body.password === data.body.confirmPassword,
        {
            path: ["body", "confirmPassword"],
            message: "Passwords do not match",
        }
    );