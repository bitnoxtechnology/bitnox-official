type UserType = {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

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
