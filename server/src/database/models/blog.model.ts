import mongoose, { Document, Schema } from "mongoose";
import { generateUniqueSlug } from "../../lib/utils";

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
  author: mongoose.Types.ObjectId;
  publishedAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true },
    excerpt: { type: String, required: true, trim: true },
    contentHtml: { type: String, required: true },
    coverImage: { type: String },
    images: [{ type: String }],
    videos: [{ type: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Middleware to generate slug before saving
blogSchema.pre<IBlog>("validate", async function (next) {
  if ((this.isModified("title") || this.isNew) && this.title) {
    this.slug = await generateUniqueSlug(this.title, BlogModel);
  }
  next();
});

const BlogModel = mongoose.model<IBlog>("Blog", blogSchema);

export default BlogModel;
