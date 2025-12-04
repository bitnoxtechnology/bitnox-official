import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters long"),
  contentHtml: z.string().min(20, "Content must be at least 20 characters long"),
  coverImage: z.string().url("Invalid URL format").optional(),
  images: z.array(z.string().url("Invalid URL format")).optional(),
  videos: z.array(z.string().url("Invalid URL format")).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const updateBlogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").optional(),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters long").optional(),
  contentHtml: z.string().min(20, "Content must be at least 20 characters long").optional(),
  coverImage: z.string().url("Invalid URL format").optional(),
  images: z.array(z.string().url("Invalid URL format")).optional(),
  videos: z.array(z.string().url("Invalid URL format")).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
