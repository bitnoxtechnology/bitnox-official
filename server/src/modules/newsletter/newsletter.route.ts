import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import requireAuth from "../../middlewares/authentication";
import requireRole from "../../middlewares/require-role";
import { newsletterController } from "./newsletter.controller";

const newsletterRouter = Router();

// Public
newsletterRouter.post(
  "/subscribe",
  asyncHandler(newsletterController.subscribe)
);

// Super admin only
newsletterRouter.get(
  "/",
  requireAuth,
  requireRole("super_admin"),
  asyncHandler(newsletterController.getAllSubscribers)
);

newsletterRouter.patch(
  "/:subscriberId/status",
  requireAuth,
  requireRole("super_admin"),
  asyncHandler(newsletterController.updateSubscriberStatus)
);

newsletterRouter.delete(
  "/:subscriberId",
  requireAuth,
  requireRole("super_admin"),
  asyncHandler(newsletterController.deleteSubscriber)
);

export default newsletterRouter;
