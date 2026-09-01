import { Schema, type Model, type Types } from "mongoose";
import mongoose from "mongoose";

/**
 * Pieces every model shares.
 */

/**
 * An image is an object, never a URL string.
 *
 * `alt` is required. Image SEO and screen readers both depend on it, and a bare string field
 * has nowhere to put it, which is how the legacy `images: string[]` fields ended up with none.
 */
export interface SiteImage {
  url: string;
  alt: string;
  caption?: string;
  sortOrder: number;
}

export const imageSchema = new Schema<SiteImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    caption: { type: String, trim: true, maxlength: 500 },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

/** Tiptap's document JSON. The editor owns the shape, so it is stored as given. */
export type TiptapDoc = Record<string, unknown>;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Register a model once.
 *
 * Next.js re-evaluates modules on hot reload, and calling `mongoose.model()` twice for the
 * same name throws `OverwriteModelError`. Every model in this folder goes through here.
 */
export function registerModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema);
}

export type ObjectId = Types.ObjectId;
