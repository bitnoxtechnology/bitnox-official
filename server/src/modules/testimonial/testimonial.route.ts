import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import requireAuth from "../../middlewares/authentication";
import { testimonialController } from "./testimonial.controller";

const testimonialRouter = Router();

// Public routes
testimonialRouter.get(
  "/",
  asyncHandler(testimonialController.getAllTestimonials)
);
testimonialRouter.get(
  "/:testimonialId",
  asyncHandler(testimonialController.getTestimonialById)
);

// Protected routes (require authentication)
testimonialRouter.post(
  "/",
  requireAuth,
  asyncHandler(testimonialController.createTestimonial)
);
testimonialRouter.patch(
  "/:testimonialId",
  requireAuth,
  asyncHandler(testimonialController.updateTestimonial)
);
testimonialRouter.delete(
  "/:testimonialId",
  requireAuth,
  asyncHandler(testimonialController.deleteTestimonial)
);

export default testimonialRouter;
