import API from "./axios-client";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "../validations/testimonial-validator";

type TestimonialResponse = {
  success: boolean;
  message: string;
  data?: {
    testimonial: ITestimonial;
  };
};

type TestimonialsResponse = {
  success: boolean;
  message: string;
  data?: {
    testimonials: ITestimonial[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type GetAllTestimonialsParams = {
  page?: number;
  limit?: number;
  featured?: boolean;
};

export const testimonialService = {
  getAllTestimonials: async ({
    page = 1,
    limit = 50,
    featured,
  }: GetAllTestimonialsParams = {}): Promise<TestimonialsResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (featured !== undefined) {
      params.append("featured", String(featured));
    }
    const response = await API.get(`/testimonial?${params.toString()}`);
    return response.data;
  },

  getTestimonialById: async (
    testimonialId: string
  ): Promise<TestimonialResponse> => {
    const response = await API.get(`/testimonial/${testimonialId}`);
    return response.data;
  },

  createTestimonial: async (
    payload: CreateTestimonialInput
  ): Promise<TestimonialResponse> => {
    const response = await API.post("/testimonial", payload);
    return response.data;
  },

  updateTestimonial: async (
    testimonialId: string,
    payload: UpdateTestimonialInput
  ): Promise<TestimonialResponse> => {
    const response = await API.patch(`/testimonial/${testimonialId}`, payload);
    return response.data;
  },

  deleteTestimonial: async (
    testimonialId: string
  ): Promise<{ message: string }> => {
    const response = await API.delete(`/testimonial/${testimonialId}`);
    return response.data;
  },
};
