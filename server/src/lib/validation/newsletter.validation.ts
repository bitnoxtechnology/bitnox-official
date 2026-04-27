import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const updateSubscriberStatusSchema = z.object({
  isActive: z.boolean(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UpdateSubscriberStatusInput = z.infer<
  typeof updateSubscriberStatusSchema
>;
