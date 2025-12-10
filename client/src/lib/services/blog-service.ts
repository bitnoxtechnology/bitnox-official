import API from "./axios-client";
import type {
  CreateBlogInput,
  UpdateBlogInput,
} from "../validations/blog-validator";

type BlogResponse = {
  success: boolean;
  message: string;
  data?: {
    blog: IBlog;
  };
};

type GetAllBlogsParams = {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  q?: string;
};

type BlogsResponse = {
  success: boolean;
  message: string;
  data?: {
    blogs: IBlog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const blogService = {
  createBlog: async (payload: CreateBlogInput): Promise<BlogResponse> => {
    const response = await API.post("/blog", payload);
    return response.data;
  },

  getAllBlogs: async ({
    page = 1,
    limit = 10,
    isPublished,
    q,
  }: GetAllBlogsParams): Promise<BlogsResponse> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (q) {
      params.append("q", q);
    }
    if (isPublished !== undefined) {
      params.append("published", String(isPublished));
    }
    const response = await API.get(`/blog?${params.toString()}`);
    return response.data;
  },

  getBlogBySlug: async (slug: string): Promise<BlogResponse> => {
    const response = await API.get(`/blog/${slug}`);
    return response.data;
  },

  updateBlog: async (
    blogId: string,
    payload: UpdateBlogInput
  ): Promise<BlogResponse> => {
    const response = await API.patch(`/blog/${blogId}`, payload);
    return response.data;
  },

  deleteBlog: async (blogId: string): Promise<{ message: string }> => {
    const response = await API.delete(`/blog/${blogId}`);
    return response.data;
  },
};
