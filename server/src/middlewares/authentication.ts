import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./async-handler";
import { UnauthorizedException } from "../lib/errors/catch-errors";
import { ErrorName } from "../lib/enums/error-names";
import { verifyJwt } from "../lib/jwt";
// import { AuthService } from "../modules/auth/auth.service";
import SessionModel from "../database/models/session.model";

const requireAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new UnauthorizedException(
        "No authorization header provided",
        ErrorName.AUTH_HEADER_NOT_FOUND
      );
    }

    const [bearer, accessToken] = authHeader.split(" ");

    if (bearer !== "Bearer" || !accessToken) {
      throw new UnauthorizedException(
        "Invalid authorization format",
        ErrorName.AUTH_FORMAT_INVALID
      );
    }

    // Check blacklist
    // if (await AuthService.isTokenBlacklisted(accessToken)) {
    //   throw new UnauthorizedException(
    //     "Token has been revoked",
    //     ErrorName.AUTH_TOKEN_REVOKED
    //   );
    // }

    const { payload, error, errorName } = verifyJwt(accessToken);
    if (error || !payload) {
      if (errorName === "TokenExpiredError") {
        throw new UnauthorizedException(
          "Access token expired",
          ErrorName.AUTH_TOKEN_EXPIRED
        );
      }

      throw new UnauthorizedException(
        "Invalid access token",
        ErrorName.AUTH_INVALID_TOKEN
      );
    }

    const session = await SessionModel.findOne({
      sessionId: payload.sessionId,
      valid: true,
      expiredAt: { $gt: new Date() },
    });
    if (!session) {
      throw new UnauthorizedException(
        "Invalid session",
        ErrorName.AUTH_INVALID_SESSION
      );
    }

    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    next();
  }
);

export default requireAuth;
