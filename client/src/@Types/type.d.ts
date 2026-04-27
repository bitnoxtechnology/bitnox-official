type UserRole = "super_admin" | "admin";

type UserType = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface IAdminUser {
  _id: string;
  accountId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errorName?: string;
}

interface IBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  tags?: string[];
  author: UserType;
  publishedAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IProject {
  _id: string;
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

interface ITestimonial {
  _id: string;
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
