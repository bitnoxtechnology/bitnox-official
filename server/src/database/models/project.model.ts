import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  coverImage?: string;
  images?: string[];
  link?: string;
  tags?: string[];
  featured: boolean;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    coverImage: { type: String },
    images: [{ type: String }],
    link: { type: String },
    tags: [{ type: String, lowercase: true, trim: true }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model<IProject>("Project", projectSchema);

export default ProjectModel;
