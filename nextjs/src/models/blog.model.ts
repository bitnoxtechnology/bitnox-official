import { Schema, type Model, type Types } from "mongoose";

import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";
import { estimateReadingMinutes, generateUniqueSlug, slugify } from "@/lib/slug";
import {
  imageSchema,
  registerModel,
  type SiteImage,
  type TiptapDoc,
  type Timestamped,
} from "@/models/shared";

/**
 * Blog posts.
 *
 * `contentJson` is the source of truth, written by Tiptap. `contentHtml` is a snapshot
 * rendered at save time and read by the public page, so a reader never downloads the editor
 * to see a paragraph of text.
 */

export interface IBlog extends Timestamped {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  contentJson: TiptapDoc;
  contentHtml: string;
  coverImage?: SiteImage;
  status: PublishStatus;
  publishedAt?: Date;
  scheduledFor?: Date;
  tags: string[];
  category?: string;
  author: Types.ObjectId;
  readingMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SiteImage;
  canonicalUrl?: string;
  featured: boolean;
  viewCount: number;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    contentJson: { type: Schema.Types.Mixed, required: true, default: () => ({}) },
    contentHtml: { type: String, required: true, default: "" },
    // The cover carries its own alt text, so the alt cannot go missing when the image changes.
    coverImage: { type: imageSchema },
    status: { type: String, enum: PUBLISH_STATUSES, default: "draft", required: true },
    publishedAt: { type: Date },
    scheduledFor: { type: Date },
    tags: [{ type: String, lowercase: true, trim: true, maxlength: 60 }],
    category: { type: String, trim: true, maxlength: 80 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readingMinutes: { type: Number, default: 1, min: 1 },
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoDescription: { type: String, trim: true, maxlength: 180 },
    ogImage: { type: imageSchema },
    canonicalUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

blogSchema.pre("validate", async function (next) {
  try {
    // The slug is derived from the title exactly once, when the post is created. After that
    // it only changes if an admin edits the slug field on purpose, because a published URL
    // that shifts under a corrected heading costs a redirect and a re-crawl.
    if (this.isNew && !this.slug && this.title) {
      this.slug = await generateUniqueSlug(
        Blog as unknown as Model<Record<string, unknown>>,
        this.title,
      );
    } else if (!this.isNew && this.isModified("slug") && this.slug) {
      this.slug = await generateUniqueSlug(
        Blog as unknown as Model<Record<string, unknown>>,
        slugify(this.slug),
        this._id,
      );
    }

    if (this.isModified("contentHtml")) {
      this.readingMinutes = estimateReadingMinutes(this.contentHtml);
    }

    // A post that reaches `published` without a date would sort as if it were never written.
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// The public list is always "published, newest first". This index serves it directly.
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1, featured: -1, publishedAt: -1 });
// The scheduled-publish cron reads exactly this shape.
blogSchema.index({ status: 1, scheduledFor: 1 });

export const Blog = registerModel<IBlog>("Blog", blogSchema);
