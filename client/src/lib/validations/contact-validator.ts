import zod from "zod";

export const contactSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters long"),
  email: zod.email("Invalid email address"),
  message: zod.string().min(10, "Message must be at least 50 characters long"),
});

export type ContactFormType = zod.infer<typeof contactSchema>;
