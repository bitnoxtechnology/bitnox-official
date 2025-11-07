import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { IUser } from "../database/models/user.model";
import { config } from "../config/app.config";

export type AccessTPayload = {
  userId: IUser["id"];
};

export type RefreshTPayload = {
  userId: IUser["_id"];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  secret: config.JWT.ACCESS_SECRET,
};

export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  secret: config.JWT.REFRESH_SECRET,
};

export const signJwt = (
  payload: AccessTPayload | RefreshTPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...opts,
    algorithm: "HS256",
  });
};

export const verifyJwt = <TPayload extends object = AccessTPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = config.JWT.ACCESS_SECRET, ...opts } = options || {};
    const payload = jwt.verify(token, secret, {
      ...opts,
    }) as TPayload;
    return { payload };
  } catch (err: any) {
    return {
      error: err.message,
      errorName: err.name,
    };
  }
};
