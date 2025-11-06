import express from "express";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";

const emailRouter = express.Router();
const emailService = new EmailService();
const emailController = new EmailController(emailService);

emailRouter.post("/contact-us", emailController.sendContactUsEmail);

export { emailRouter };
