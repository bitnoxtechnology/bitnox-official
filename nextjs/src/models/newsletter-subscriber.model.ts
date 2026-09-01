import { Schema, type Types } from "mongoose";

import { SUBSCRIBER_STATUSES, type SubscriberStatus } from "@/lib/constants";
import { registerModel, type Timestamped } from "@/models/shared";

/**
 * Newsletter list.
 */

export interface INewsletterSubscriber extends Timestamped {
  _id: Types.ObjectId;
  email: string;
  status: SubscriberStatus;
  /** Which page drove the signup: `footer`, `blog-post`, `event-space` and so on. */
  source?: string;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  unsubscribeToken: string;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // A status, not the legacy `isActive` boolean, so an unsubscribe is recorded rather than
    // looking the same as a row that was never confirmed.
    status: {
      type: String,
      enum: SUBSCRIBER_STATUSES,
      default: "subscribed",
      required: true,
    },
    source: { type: String, trim: true, maxlength: 80 },
    confirmedAt: { type: Date },
    unsubscribedAt: { type: Date },
    // Backs the one-click unsubscribe link that bulk senders increasingly require.
    unsubscribeToken: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

newsletterSubscriberSchema.index({ status: 1, createdAt: -1 });

export const NewsletterSubscriber = registerModel<INewsletterSubscriber>(
  "NewsletterSubscriber",
  newsletterSubscriberSchema,
);
