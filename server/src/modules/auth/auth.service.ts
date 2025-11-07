import { SignupType } from "../../lib/validation/auth.validation";
import UserModel from "../../database/models/user.model";
import { BadRequestException } from "../../lib/errors/catch-errors";
import { ErrorName } from "../../lib/enums/error-names";

export class AuthService {
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
  }
}
