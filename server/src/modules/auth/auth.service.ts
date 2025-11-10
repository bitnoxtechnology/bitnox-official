import {
  LoginType,
  SignupType,
  VerifyLoginOTPType,
} from "../../lib/validation/auth.validation";
import UserModel from "../../database/models/user.model";
import {
  BadRequestException,
  UnauthorizedException,
} from "../../lib/errors/catch-errors";
import { ErrorName } from "../../lib/enums/error-names";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../lib/enums/verification-names";
import { minutesFromNow } from "../../lib/utils";
import { sendEmail } from "../../lib/email/send";
import { otpEmailTemplate } from "../../lib/email/templates/auth";
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwt,
  verifyJwt,
} from "../../lib/jwt";
import redis from "../../database/redis";

export class AuthService {
  static async blacklistToken(token: string, exp: number) {
    await redis.set(token, "blacklisted", { expiration: "KEEPTTL" });
  }

  static async isTokenBlacklisted(token: string) {
    const result = await redis.get(token);
    return result === "blacklisted";
  }

  private async sendOTPEmail(email: string, userId: string) {
    // Create OTP code
    const otpCode = await VerificationCodeModel.create({
      userId,
      type: VerificationEnum.OTP,
      expiresAt: minutesFromNow(10),
    });

    const emailContent = otpEmailTemplate({
      name: "User",
      email,
      otp: otpCode.code,
      expiresInMinutes: 10,
    });
    const sendResult = await sendEmail({ ...emailContent });
    // treat missing result or an error flag as failure
    if (!sendResult || (sendResult as any).error) {
      throw new BadRequestException("Failed to send email");
    }
  }

  public async signup(signupData: SignupType) {
    const { name, email } = signupData;

    const userExist = await UserModel.exists({ email });

    if (userExist) {
      throw new BadRequestException(
        "User with this email already exists",
        ErrorName.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await UserModel.create({
      name,
      email,
    });

    await this.sendOTPEmail(email, newUser._id.toString());

    return {
      user: newUser,
    };
  }

  public async login(loginData: LoginType) {
    const { email } = loginData;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(
        "User with this email does not exist",
        ErrorName.AUTH_EMAIL_NOT_FOUND
      );
    }

    await this.sendOTPEmail(email, user._id.toString());

    return {
      user,
    };
  }

  public async logout(accessToken: string) {
    // For JWT, logout can be handled on the client side by deleting the token.
    // Optionally, you can implement token blacklisting on the server side.
    await AuthService.blacklistToken(accessToken, 0);
  }

  public async verifyLoginOTP(verifyLoginData: VerifyLoginOTPType) {
    const { email, code } = verifyLoginData;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(
        "User not found",
        ErrorName.AUTH_USER_NOT_FOUND
      );
    }

    const userId = user._id.toString();
    const otpRecord = await VerificationCodeModel.findOne({
      userId,
      type: VerificationEnum.OTP,
      code,
      expiresAt: { $gt: new Date() }, // Ensure OTP is not expired
    });

    if (!otpRecord) {
      throw new BadRequestException(
        "Invalid OTP code",
        ErrorName.AUTH_OTP_INVALID
      );
    }

    const accessToken = signJwt({ userId: otpRecord.userId });
    const refreshToken = signJwt(
      { userId: otpRecord.userId },
      refreshTokenSignOptions
    );

    // Optionally, delete all user' otp records
    await VerificationCodeModel.deleteMany({ userId: otpRecord.userId });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public async refreshToken(refreshToken: string) {
    // Implement token refresh logic here, typically by generating a new JWT
    // using a refresh token mechanism.
    const { payload } = verifyJwt<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });
    if (!payload) {
      throw new UnauthorizedException(
        "Invalid refresh token",
        ErrorName.AUTH_INVALID_TOKEN
      );
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException(
        "User not found",
        ErrorName.AUTH_USER_NOT_FOUND
      );
    }

    const accessToken = signJwt({ userId: user._id });
    const newRefreshToken = signJwt(
      { userId: user._id },
      refreshTokenSignOptions
    );
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
