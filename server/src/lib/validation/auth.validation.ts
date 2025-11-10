import { z } from "zod";

const nameSchema = z
  .string("Name is required")
  .trim()
  .min(5, "Name cannot be less than 5 characters")
  .max(50, "Name cannot be greater than 50 characters");
const emailSchema = z
  .email({ message: "Provide a valid email" })
  .max(50, "Email cannot be more than 50 characters");

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
});

export type SignupType = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
});

export type LoginType = z.infer<typeof loginSchema>;

export const verifyLoginOTPSchema = z.object({
  email: emailSchema,
  code: z.string("OTP code is required"),
});

export type VerifyLoginOTPType = z.infer<typeof verifyLoginOTPSchema>;
