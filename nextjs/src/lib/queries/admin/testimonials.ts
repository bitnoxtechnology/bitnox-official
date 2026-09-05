import "server-only";

import {
  ADMIN_PER_PAGE,
  connectForRequest,
  paginate,
  searchPattern,
  type Paginated,
} from "@/lib/queries/admin/shared";
import { toTestimonial, type TestimonialDTO } from "@/lib/dto";
import type { ListQuery } from "@/lib/validations/admin-schema";
import { Testimonial, type ITestimonial } from "@/models";
// Registers Project on the connection, so populating the related case study does not throw.
import "@/models";

export async function listTestimonials(query: ListQuery): Promise<Paginated<TestimonialDTO>> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;

  if (query.q) {
    const pattern = searchPattern(query.q);
    filter.$or = [{ clientName: pattern }, { company: pattern }, { testimonialText: pattern }];
  }

  const total = await Testimonial.countDocuments(filter).exec();
  const { page, pageCount, skip, limit } = paginate(total, query.page);

  const testimonials = await Testimonial.find(filter)
    .sort({ featured: -1, sortOrder: 1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("relatedProject", "slug title")
    .lean<ITestimonial[]>()
    .exec();

  return {
    rows: testimonials.map(toTestimonial),
    total,
    page,
    pageCount,
    perPage: ADMIN_PER_PAGE,
  };
}

export async function getTestimonial(id: string): Promise<TestimonialDTO | null> {
  await connectForRequest();

  const testimonial = await Testimonial.findById(id).lean<ITestimonial | null>().exec();

  return testimonial ? toTestimonial(testimonial) : null;
}
