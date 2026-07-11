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
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),

      otp: z
        .string()
        .trim()
        .length(6, "OTP must be exactly 6 digits.")
        .regex(/^\d{6}$/, "OTP must contain only digits."),
    })
    .strict(),

  params: z.object({}),

  query: z.object({}),
});

export const registerSchema = z
  .object({
    body: z
      .object({
        phoneNumber: z
          .string()
          .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

        dateOfBirth: z.coerce.date(),

        gender: z.enum(["male", "female", "other"]),

        password: z
          .string()
          .min(8)
          .max(64)
          .regex(/[A-Z]/, "One uppercase letter is required")
          .regex(/[a-z]/, "One lowercase letter is required")
          .regex(/[0-9]/, "One digit is required")
          .regex(/[^A-Za-z0-9]/, "One special character is required"),

        confirmPassword: z.string(),
      })
      .strict(),
  })
  .refine(
    ({ body }) => body.password === body.confirmPassword,
    {
      path: ["body", "confirmPassword"],
      message: "Passwords do not match",
    }
  );

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address")
      .max(254, "Email is too long"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must not exceed 64 characters"),
  }).strict(),
})