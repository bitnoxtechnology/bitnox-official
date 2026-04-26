import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import requireAuth from "../../middlewares/authentication";
import { portfolioController } from "./portfolio.controller";

const portfolioRouter = Router();

// Public routes
portfolioRouter.get("/", asyncHandler(portfolioController.getAllProjects));
portfolioRouter.get(
  "/:projectId",
  asyncHandler(portfolioController.getProjectById)
);

// Protected routes (require authentication)
portfolioRouter.post(
  "/",
  requireAuth,
  asyncHandler(portfolioController.createProject)
);
portfolioRouter.patch(
  "/:projectId",
  requireAuth,
  asyncHandler(portfolioController.updateProject)
);
portfolioRouter.delete(
  "/:projectId",
  requireAuth,
  asyncHandler(portfolioController.deleteProject)
);

export default portfolioRouter;
