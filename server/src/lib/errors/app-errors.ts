import {
  HTTPSTATUSCODE,
  HttpStatusCodeType,
} from "../../config/status-codes.config";
import { ErrorName } from "../enums/error-names";

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorName?: ErrorName;

  constructor(
    message: string,
    statusCode = HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
    errorName?: ErrorName
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorName = errorName;
    Error.captureStackTrace(this, this.constructor);
  }
}
