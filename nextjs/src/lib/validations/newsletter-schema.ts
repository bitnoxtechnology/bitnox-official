import { z } from "zod";

import { emailField, sourceField } from "@/lib/validations/fields";

/**
 * Newsletter signup.
 *
 * One field, which is the point. Every extra box on a footer form costs subscribers, and a
 * name is not needed to send a post to an address.
 */

export const subscribeSchema = z.object({
  email: emailField,
  /** Which page the signup came from. Set by the form, not typed by anyone. */
  source: sourceField,
});

/**
 * The input side, which is what the form holds.
 *
 * `source` carries a transform that turns an empty string into `undefined`, so the input and
 * output types are not the same object and a form typed against the output would be asking
 * for a field the person never fills in.
 */
export type SubscribeInput = z.input<typeof subscribeSchema>;

/** The output side, after trimming and normalisation. What the action receives. */
export type SubscribeData = z.output<typeof subscribeSchema>;

/** The one-click link in every newsletter email. The token is the whole credential. */
export const unsubscribeSchema = z.object({
  token: z.string().trim().min(16, "This unsubscribe link is not complete"),
});

export type UnsubscribeInput = z.input<typeof unsubscribeSchema>;
