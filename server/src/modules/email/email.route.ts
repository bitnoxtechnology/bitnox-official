import { Request, Response } from "express";
import { EmailService } from "./email.service";

export class EmailController {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  public sendContactEmail = async (req: Request, res: Response) => {};
}
