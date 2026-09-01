import { Schema, type Types } from "mongoose";

import {
  PUBLISH_STATUSES,
  SERVICE_SLUGS,
  type PublishStatus,
  type ServiceSlug,
} from "@/lib/constants";
import { imageSchema, registerModel, type SiteImage, type Timestamped } from "@/models/shared";

/**
 * Client testimonials.
 *
 * `position` and `company` are optional. The legacy model required both, which meant a real
 * quote from an individual client could not be entered at all.
 */

export interface ITestimonial extends Timestamped {
  _id: Types.ObjectId;
  clientName: string;
  position?: string;
  company?: string;
  testimonialText: string;
  rating?: number;
  image?: SiteImage;
  /** Lets the quote appear on the project it is about. */
  relatedProject?: Types.ObjectId;
  /** Lets the quote appear on the matching service page. */
  service?: ServiceSlug;
  status: PublishStatus;
  featured: boolean;
  sortOrder: number;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true, trim: true, maxlength: 160 },
    position: { type: String, trim: true, maxlength: 160 },
    company: { type: String, trim: true, maxlength: 160 },
    testimonialText: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    image: { type: imageSchema },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project" },
    service: { type: String, enum: SERVICE_SLUGS },
    // Only draft and published get used in practice. Sharing the enum with Blog and Project
    // means one status filter component and one mental model across the whole admin.
    status: { type: String, enum: PUBLISH_STATUSES, default: "draft", required: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

testimonialSchema.index({ status: 1, sortOrder: 1 });
testimonialSchema.index({ status: 1, featured: -1, sortOrder: 1 });
testimonialSchema.index({ service: 1, status: 1 });

export const Testimonial = registerModel<ITestimonial>("Testimonial", testimonialSchema);
