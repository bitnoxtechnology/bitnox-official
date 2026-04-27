import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(5, "Name cannot be less than 5 characters")
  .max(50, "Name cannot be greater than 50 characters");

const emailSchema = z
  .email({ message: "Provide a valid email" })
  .max(50, "Email cannot be more than 50 characters");

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.enum(["super_admin", "admin"]).default("admin"),
});

export type CreateUserType = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  role: z.enum(["super_admin", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;
