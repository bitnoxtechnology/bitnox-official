import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./async-handler";
import { ForbiddenException } from "../lib/errors/catch-errors";
import { ErrorName } from "../lib/enums/error-names";
import UserModel, { UserRole } from "../database/models/user.model";

const requireRole = (...roles: UserRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req.userId).select("role isActive");
    if (!user) {
      throw new ForbiddenException("User not found", ErrorName.ACCESS_FORBIDDEN);
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(
        "You do not have permission to perform this action",
        ErrorName.ACCESS_FORBIDDEN
      );
    }
    next();
  });

export default requireRole;
