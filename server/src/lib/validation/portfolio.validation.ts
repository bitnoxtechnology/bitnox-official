import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  coverImage: z.string().url("Invalid URL format").optional(),
  images: z.array(z.string().url("Invalid URL format")).optional(),
  link: z.string().url("Invalid URL format").optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .optional(),
  coverImage: z.string().url("Invalid URL format").optional(),
  images: z.array(z.string().url("Invalid URL format")).optional(),
  link: z.string().url("Invalid URL format").optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
