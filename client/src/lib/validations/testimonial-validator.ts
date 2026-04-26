import { z } from "zod";

export const testimonialSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters long"),
  position: z.string().min(2, "Position must be at least 2 characters long"),
  company: z.string().min(2, "Company must be at least 2 characters long"),
  testimonialText: z
    .string()
    .min(10, "Testimonial must be at least 10 characters long"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  image: z.url().optional(),
  featured: z.boolean().default(false),
});

export const updateTestimonialSchema = testimonialSchema.partial();

export type CreateTestimonialInput = z.infer<typeof testimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
