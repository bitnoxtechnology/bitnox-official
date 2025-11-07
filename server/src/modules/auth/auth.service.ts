import { SignupType } from "../../lib/validation/auth.validation";
import UserModel from "../../database/models/user.model";
import { BadRequestException } from "../../lib/errors/catch-errors";
import { ErrorName } from "../../lib/enums/error-names";
import VerificationCodeModel from "../../database/models/verification.model";
import { VerificationEnum } from "../../lib/enums/verification-names";
import { minutesFromNow } from "../../lib/utils";
import { sendEmail } from "../../lib/email/send";
import { otpEmailTemplate } from "../../lib/email/templates/auth";

export class AuthService {
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
}
