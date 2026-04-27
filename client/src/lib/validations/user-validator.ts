import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Provide a valid email address"),
  role: z.enum(["super_admin", "admin"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  role: z.enum(["super_admin", "admin"]).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
