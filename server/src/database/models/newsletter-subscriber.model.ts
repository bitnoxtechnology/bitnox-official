import mongoose, { Document, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const NewsletterSubscriberModel = mongoose.model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);

export default NewsletterSubscriberModel;
