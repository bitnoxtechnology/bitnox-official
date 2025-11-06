import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { EmailService } from "./email.service";

export class EmailController {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }
}
