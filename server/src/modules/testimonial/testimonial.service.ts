import TestimonialModel, {
  ITestimonial,
} from "../../database/models/testimonial.model";
import {
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "../../lib/validation/testimonial.validation";
import { NotFoundException } from "../../lib/errors/catch-errors";

export class TestimonialService {
  public async createTestimonial(
    input: CreateTestimonialInput
  ): Promise<ITestimonial> {
    const testimonial = new TestimonialModel({ ...input });
    await testimonial.save();
    return testimonial;
  }

  public async getAllTestimonials(
    page: number = 1,
    limit: number = 50,
    featured?: boolean
  ) {
    const skip = (page - 1) * limit;
    const filter: { featured?: boolean } = {};

    if (featured !== undefined) {
      filter.featured = featured;
    }

    const testimonials = await TestimonialModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TestimonialModel.countDocuments(filter);

    return {
      testimonials,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async getTestimonialById(
    testimonialId: string
  ): Promise<ITestimonial> {
    const testimonial = await TestimonialModel.findById(testimonialId);
    if (!testimonial) {
      throw new NotFoundException("Testimonial not found");
    }
    return testimonial;
  }

  public async updateTestimonial(
    testimonialId: string,
    input: UpdateTestimonialInput
  ): Promise<ITestimonial> {
    const testimonial = await TestimonialModel.findById(testimonialId);
    if (!testimonial) {
      throw new NotFoundException("Testimonial not found");
    }
    Object.assign(testimonial, input);
    await testimonial.save();
    return testimonial;
  }

  public async deleteTestimonial(
    testimonialId: string
  ): Promise<{ message: string }> {
    const result = await TestimonialModel.findByIdAndDelete(testimonialId);
    if (!result) {
      throw new NotFoundException("Testimonial not found");
    }
    return { message: "Testimonial deleted successfully" };
  }
}
