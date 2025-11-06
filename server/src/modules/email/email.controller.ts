import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { EmailService } from "./email.service";
import { BadRequestException } from "../../lib/errors/catch-errors";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

export class EmailController {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  public sendContactUsEmail = asyncHandler(
    async (req: Request, res: Response) => {
      const { name, email, serviceType, message } = req.body;

      if (!name || !email || !serviceType || !message) {
        throw new BadRequestException("All fields are required");
      }

      await this.emailService.sendContactUsEmail({
        name,
        email,
        serviceType,
        message,
      });

      return res.status(HTTPSTATUSCODE.OK).json({
        message: "Your message has been sent successfully",
      });
    }
  );
}
