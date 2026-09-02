import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { toTestimonial, type TestimonialDTO } from "@/lib/dto";
import { Testimonial, type ITestimonial } from "@/models";

/** Published testimonials, featured first, then in the order the admin arranged them. */
export async function getPublishedTestimonials(limit?: number): Promise<TestimonialDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.testimonials);
  cacheLife("max");

  await connectToDatabase();

  const query = Testimonial.find({ status: "published" }).sort({ featured: -1, sortOrder: 1 });

  if (limit) query.limit(limit);

  const testimonials = await query.lean<ITestimonial[]>().exec();

  return testimonials.map(toTestimonial);
}
