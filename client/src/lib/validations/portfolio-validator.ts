import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  coverImage: z.url().optional(),
  images: z.array(z.url()).optional(),
  link: z.url("Must be a valid URL").optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
  isPublished: z.boolean().default(false),
});

export const updateProjectSchema = projectSchema.partial();

export type CreateProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
