import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { AuthService } from "./auth.service";
import { signupSchema } from "../../lib/validation/auth.validation";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signup = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = signupSchema.parse({
        ...req.body,
      });
      const { user } = await this.authService.signup(body);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        message: "User signup successfully",
        user,
      });
    }
  );
}

export const authController = new AuthController(new AuthService());
