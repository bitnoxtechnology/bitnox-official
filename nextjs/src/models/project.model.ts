import { Schema, type Model, type Types } from "mongoose";

import {
  PUBLISH_STATUSES,
  SERVICE_SLUGS,
  type PublishStatus,
  type ServiceSlug,
} from "@/lib/constants";
import { generateUniqueSlug, slugify } from "@/lib/slug";
import {
  imageSchema,
  registerModel,
  type SiteImage,
  type TiptapDoc,
  type Timestamped,
} from "@/models/shared";

/**
 * Portfolio projects.
 *
 * The legacy model had no slug, no detail content and no client context, so a project could
 * only ever be a card on the landing page. Each one now gets an indexable URL of its own,
 * which is the point of having portfolio work at all.
 */

export interface IProject extends Timestamped {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  /** Card copy. Short, and never the first paragraph of `content`. */
  summary: string;
  contentJson: TiptapDoc;
  contentHtml: string;
  coverImage?: SiteImage;
  images: SiteImage[];
  client?: string;
  industry?: string;
  services: ServiceSlug[];
  techStack: string[];
  completedAt?: Date;
  liveUrl?: string;
  repoUrl?: string;
  tags: string[];
  status: PublishStatus;
  featured: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SiteImage;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, required: true, trim: true, maxlength: 400 },
    contentJson: { type: Schema.Types.Mixed, default: () => ({}) },
    contentHtml: { type: String, default: "" },
    coverImage: { type: imageSchema },
    // Objects rather than the legacy `string[]`, so every image carries alt text and the
    // admin can order the gallery without a second parallel array.
    images: { type: [imageSchema], default: [] },
    client: { type: String, trim: true, maxlength: 160 },
    industry: { type: String, trim: true, maxlength: 120 },
    // Constrained to the four service slugs so a project can be surfaced on the service page
    // it belongs to without a free-text match.
    services: [{ type: String, enum: SERVICE_SLUGS }],
    techStack: [{ type: String, trim: true, maxlength: 60 }],
    completedAt: { type: Date },
    // Two typed fields in place of the single untyped `link`, which could be either and was
    // rendered as both.
    liveUrl: { type: String, trim: true },
    repoUrl: { type: String, trim: true },
    tags: [{ type: String, lowercase: true, trim: true, maxlength: 60 }],
    status: { type: String, enum: PUBLISH_STATUSES, default: "draft", required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, trim: true, maxlength: 70 },
    seoDescription: { type: String, trim: true, maxlength: 180 },
    ogImage: { type: imageSchema },
  },
  { timestamps: true },
);

projectSchema.pre("validate", async function (next) {
  try {
    if (this.isNew && !this.slug && this.title) {
      this.slug = await generateUniqueSlug(
        Project as unknown as Model<Record<string, unknown>>,
        this.title,
      );
    } else if (!this.isNew && this.isModified("slug") && this.slug) {
      this.slug = await generateUniqueSlug(
        Project as unknown as Model<Record<string, unknown>>,
        slugify(this.slug),
        this._id,
      );
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

projectSchema.index({ status: 1, order: 1 });
projectSchema.index({ status: 1, featured: -1, order: 1 });
projectSchema.index({ services: 1, status: 1 });
projectSchema.index({ tags: 1 });

export const Project = registerModel<IProject>("Project", projectSchema);
