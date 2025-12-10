import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../../lib/validation/blog.validation";
import { asyncHandler } from "../../middlewares/async-handler";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

export class BlogController {
  private blogService: BlogService;

  constructor(blogService: BlogService) {
    this.blogService = blogService;
  }

  public createBlog = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userId = req.userId as string;
      const validatedBody = createBlogSchema.parse(req.body);

      const blog = await this.blogService.createBlog(userId, validatedBody);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        success: true,
        message: "Blog created successfully",
        data: {
          blog,
        },
      });
    }
  );

  public getAllBlogs = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { page, limit, published, q } = req.query;
      const isPublished =
        published === "true" ? true : published === "false" ? false : undefined;

      const data = await this.blogService.getAllBlogs(
        Number(page) || 1,
        Number(limit) || 10,
        isPublished,
        q as string
      );

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data,
      });
    }
  );

  public getBlogBySlug = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { slug } = req.params;
      const blog = await this.blogService.getBlogBySlug(slug);

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { blog },
      });
    }
  );

  public updateBlog = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { blogId } = req.params;
      const validatedBody = updateBlogSchema.parse(req.body);

      const blog = await this.blogService.updateBlog(blogId, validatedBody);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { blog },
      });
    }
  );

  public deleteBlog = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { blogId } = req.params;
      const result = await this.blogService.deleteBlog(blogId);

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { result },
      });
    }
  );
}

export const blogController = new BlogController(new BlogService());
