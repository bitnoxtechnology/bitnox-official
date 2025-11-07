import express from "express";
import { emailController } from "./email.controller";

const emailRouter = express.Router();

emailRouter.post("/contact-us", emailController.sendContactUsEmail);

export { emailRouter };
