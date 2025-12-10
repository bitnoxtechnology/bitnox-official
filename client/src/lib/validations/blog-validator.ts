import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters long"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters long"),
  contentHtml: z
    .string()
    .min(100, "Content must be at least 100 characters long"),
  coverImage: z.url().optional(),
  images: z.array(z.url()).optional(),
  videos: z.array(z.url()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

export const updateBlogSchema = blogSchema.partial();

export type CreateBlogInput = z.infer<typeof blogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
