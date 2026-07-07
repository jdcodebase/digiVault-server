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