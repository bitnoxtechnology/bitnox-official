import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  signupSchema,
  verifyLoginOTPSchema,
} from "../../lib/validation/auth.validation";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";
import { UnauthorizedException } from "../../lib/errors/catch-errors";
import { ErrorName } from "../../lib/enums/error-names";

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

  public login = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = loginSchema.parse({
        ...req.body,
      });
      const { user } = await this.authService.login(body);
      return res.status(HTTPSTATUSCODE.OK).json({
        message: "Attempt to login successful. Check your email for OTP code",
        user,
      });
    }
  );

  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const authHeader = req.headers["authorization"];
      if (!authHeader || typeof authHeader !== "string") {
        throw new UnauthorizedException(
          "Invalid authorization format",
          ErrorName.AUTH_FORMAT_INVALID
        );
      }

      const accessToken = authHeader.split(" ")[1];
      await this.authService.logout(accessToken);

      return res.status(HTTPSTATUSCODE.OK).json({
        message: "Logout successful",
      });
    }
  );

  public verifyLoginOTP = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = verifyLoginOTPSchema.parse({
        ...req.body,
      });

      const { user, accessToken, refreshToken } =
        await this.authService.verifyLoginOTP(body);

      return res.status(HTTPSTATUSCODE.OK).json({
        message: "Login successful",
        user,
        token: {
          accessToken,
          refreshToken,
        },
      });
    }
  );

  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new UnauthorizedException(
          "Refresh token is required",
          ErrorName.AUTH_TOKEN_NOT_FOUND
        );
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      res.status(HTTPSTATUSCODE.OK).json({
        message: "Refresh token successful",
        token: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    }
  );
}

export const authController = new AuthController(new AuthService());
