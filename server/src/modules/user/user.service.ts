import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../lib/errors/catch-errors";
import { ErrorName } from "../../lib/enums/error-names";
import {
  CreateUserType,
  UpdateUserType,
} from "../../lib/validation/user.validation";

const USER_SELECT = "name email role isActive accountId createdAt updatedAt";

export class UserService {
  public async getAllUsers() {
    const users = await UserModel.find()
      .select(USER_SELECT)
      .sort({ createdAt: -1 });
    return { users };
  }

  public async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select(USER_SELECT);
    if (!user) {
      throw new NotFoundException("User not found", ErrorName.AUTH_USER_NOT_FOUND);
    }
    return { user };
  }

  public async createUser(data: CreateUserType) {
    const { name, email, role } = data;

    const exists = await UserModel.exists({ email });
    if (exists) {
      throw new BadRequestException(
        "User with this email already exists",
        ErrorName.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const user = await UserModel.create({ name, email, role });
    return { user };
  }

  public async updateUser(
    userId: string,
    data: UpdateUserType,
    requestingUserId: string
  ) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found", ErrorName.AUTH_USER_NOT_FOUND);
    }

    if (data.isActive === false && userId === requestingUserId) {
      throw new BadRequestException("You cannot deactivate your own account");
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) {
      user.isActive = data.isActive;
      if (!data.isActive) {
        await SessionModel.deleteMany({ userId: user._id });
      }
    }

    await user.save();
    return { user };
  }

  public async deleteUser(userId: string, requestingUserId: string) {
    if (userId === requestingUserId) {
      throw new BadRequestException("You cannot delete your own account");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found", ErrorName.AUTH_USER_NOT_FOUND);
    }

    await SessionModel.deleteMany({ userId: user._id });
    await user.deleteOne();

    return { message: "User deleted successfully" };
  }
}
