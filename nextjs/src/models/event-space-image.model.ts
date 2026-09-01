import { Schema, type Types } from "mongoose";

import { registerModel, type Timestamped } from "@/models/shared";

/**
 * The Event Space gallery.
 *
 * Its own collection rather than an array on SiteSettings, because the gallery has no fixed
 * length, the admin reorders it, and one image is marked as the cover used by the landing
 * page teaser and the Open Graph card.
 */

export interface IEventSpaceImage extends Timestamped {
  _id: Types.ObjectId;
  url: string;
  /** Required. A gallery of unlabelled photographs is invisible to search and to readers. */
  alt: string;
  caption?: string;
  sortOrder: number;
  isCover: boolean;
}

const eventSpaceImageSchema = new Schema<IEventSpaceImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 500 },
    sortOrder: { type: Number, default: 0 },
    isCover: { type: Boolean, default: false },
  },
  { timestamps: true },
);

eventSpaceImageSchema.index({ sortOrder: 1 });
eventSpaceImageSchema.index({ isCover: -1, sortOrder: 1 });

export const EventSpaceImage = registerModel<IEventSpaceImage>(
  "EventSpaceImage",
  eventSpaceImageSchema,
);
