import express from "express";
import { authController } from "./auth.controller";
import requireAuth from "../../middlewares/authentication";

const authRouter = express.Router();

authRouter.post("/signup", authController.signup);
authRouter.post("/login", authController.login);
authRouter.post("/resend-login-otp", authController.resendOTP);
authRouter.post("/verify-login-otp", authController.verifyLoginOTP);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.post("/refresh-token", authController.refreshToken);

export { authRouter };
