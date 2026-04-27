import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler";
import { UserService } from "./user.service";
import {
  createUserSchema,
  updateUserSchema,
} from "../../lib/validation/user.validation";
import { HTTPSTATUSCODE } from "../../config/status-codes.config";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public getAll = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { users } = await this.userService.getAllUsers();
      return res.status(HTTPSTATUSCODE.OK).json({ success: true, data: { users } });
    }
  );

  public getOne = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { userId } = req.params;
      const { user } = await this.userService.getUserById(userId);
      return res.status(HTTPSTATUSCODE.OK).json({ success: true, data: { user } });
    }
  );

  public create = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const body = createUserSchema.parse(req.body);
      const { user } = await this.userService.createUser(body);
      return res.status(HTTPSTATUSCODE.CREATED).json({
        success: true,
        message: "User created successfully",
        data: { user },
      });
    }
  );

  public update = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { userId } = req.params;
      const body = updateUserSchema.parse(req.body);
      const requestingUserId = req.userId as string;
      const { user } = await this.userService.updateUser(
        userId,
        body,
        requestingUserId
      );
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: "User updated successfully",
        data: { user },
      });
    }
  );

  public remove = asyncHandler(
    async (req: Request, res: Response): Promise<any> => {
      const { userId } = req.params;
      const requestingUserId = req.userId as string;
      const result = await this.userService.deleteUser(userId, requestingUserId);
      return res.status(HTTPSTATUSCODE.OK).json({
        success: true,
        message: result.message,
      });
    }
  );
}

export const userController = new UserController(new UserService());
