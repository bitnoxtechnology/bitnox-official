import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { AuthService } from "./auth.service";
import {
  loginSchema,
  signupSchema,
  verifyLoginOTPSchema,
} from "../../lib/validation/auth.validation";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";
import {
  NotFoundException,
  UnauthorizedException,
} from "../../lib/errors/catch-errors";
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
        success: true,
        message: "User signup successfully",
        data: {
          user,
        },
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
        success: true,
        message: "Attempt to login successful. Check your email for OTP code",
        data: {
          user,
        },
      });
    }
  );

  public resendOTP = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = loginSchema.parse({
        ...req.body,
      });
      const { user } = await this.authService.resendOTP(body);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: "OTP resent successfully. Check your email for OTP code",
        data: {
          user,
        },
      });
    }
  );

  /**
   * Verify Login OTP endpoint
   * Body: { email, otp, deviceFingerprint }  // deviceFingerprint = hashed fingerprint from client
   */
  public verifyLoginOTP = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const userAgent = req.headers["user-agent"] || "";
      const ip = req.ip;
      const body = verifyLoginOTPSchema.parse({
        ...req.body,
        userAgent,
        ip,
      });

      const { user, accessToken, sessionId } =
        await this.authService.verifyLoginOTP(body);

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          accessToken,
          sessionId,
        },
      });
    }
  );

  /**
   * Refresh endpoint
   * Header: x-session-id
   * Header: x-device-fp  (hashed fingerprint)
   */
  public refreshToken = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = (req.headers["x-session-id"] as string) || "";
      const deviceFp = (req.headers["x-device-fp"] as string) || "";

      if (!sessionId || !deviceFp) {
        throw new UnauthorizedException(
          "Missing session ID or device fingerprint",
          ErrorName.AUTH_MISSING_SESSION_OR_DEVICE_FP
        );
      }

      const { accessToken, user } = await this.authService.refreshToken(
        sessionId,
        deviceFp
      );

      res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: "Refresh token successful",
        data: {
          user,
          accessToken,
        },
      });
    }
  );

  /**
   * Logout: invalidates session
   */
  public logout = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const sessionId = req.sessionId as string;
      if (!sessionId) {
        throw new NotFoundException(
          "Session not found.",
          ErrorName.AUTH_SESSION_NOT_FOUND
        );
      }

      await this.authService.logout(sessionId);

      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: "Logout successful",
      });
    }
  );
}

export const authController = new AuthController(new AuthService());
