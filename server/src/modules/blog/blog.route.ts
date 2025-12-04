import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import requireAuth from "../../middlewares/authentication";
import { blogController } from "./blog.controller";

const blogRouter = Router();

// Public routes
blogRouter.get("/", asyncHandler(blogController.getAllBlogs));
blogRouter.get("/:slug", asyncHandler(blogController.getBlogBySlug));

// Protected routes (require authentication)
blogRouter.post("/", requireAuth, asyncHandler(blogController.createBlog));
blogRouter.patch(
  "/:blogId",
  requireAuth,
  asyncHandler(blogController.updateBlog)
);
blogRouter.delete(
  "/:blogId",
  requireAuth,
  asyncHandler(blogController.deleteBlog)
);

export default blogRouter;
