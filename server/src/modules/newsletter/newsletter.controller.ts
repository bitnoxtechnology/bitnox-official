import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";
import {
  subscribeSchema,
  updateSubscriberStatusSchema,
} from "../../lib/validation/newsletter.validation";
import { NewsletterService } from "./newsletter.service";

export class NewsletterController {
  private newsletterService: NewsletterService;

  constructor(newsletterService: NewsletterService) {
    this.newsletterService = newsletterService;
  }

  public subscribe = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const validatedBody = subscribeSchema.parse(req.body);
      const subscriber = await this.newsletterService.subscribe(validatedBody);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        success: true,
        message: "Successfully subscribed to our newsletter!",
        data: { subscriber },
      });
    }
  );

  public getAllSubscribers = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { page, limit, active, q } = req.query;
      const isActive =
        active === "true" ? true : active === "false" ? false : undefined;

      const data = await this.newsletterService.getAllSubscribers(
        Number(page) || 1,
        Number(limit) || 20,
        isActive,
        q as string
      );

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data,
      });
    }
  );

  public updateSubscriberStatus = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { subscriberId } = req.params;
      const validatedBody = updateSubscriberStatusSchema.parse(req.body);

      const subscriber = await this.newsletterService.updateSubscriberStatus(
        subscriberId,
        validatedBody
      );

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: `Subscriber ${validatedBody.isActive ? "activated" : "deactivated"} successfully`,
        data: { subscriber },
      });
    }
  );

  public deleteSubscriber = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { subscriberId } = req.params;
      const result = await this.newsletterService.deleteSubscriber(subscriberId);

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        data: { result },
      });
    }
  );
}

export const newsletterController = new NewsletterController(
  new NewsletterService()
);
