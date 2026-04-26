import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  clientName: string;
  position: string;
  company: string;
  testimonialText: string;
  rating: number;
  image?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    clientName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    testimonialText: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    image: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TestimonialModel = mongoose.model<ITestimonial>(
  "Testimonial",
  testimonialSchema
);

export default TestimonialModel;
