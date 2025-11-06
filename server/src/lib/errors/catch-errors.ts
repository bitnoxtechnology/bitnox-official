import {
  HTTPSTATUSCODE,
  HttpStatusCodeType,
} from "../../config/status-codes.config";
import { ErrorName } from "../enums/error-names";
import { AppError } from "./app-errors";

export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorName?: ErrorName) {
    super(
      message,
      HTTPSTATUSCODE.NOT_FOUND,
      errorName || ErrorName.RESOURCE_NOT_FOUND
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorName?: ErrorName) {
    super(message, HTTPSTATUSCODE.BAD_REQUEST, errorName);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorName?: ErrorName) {
    super(
      message,
      HTTPSTATUSCODE.UNAUTHORIZED,
      errorName || ErrorName.ACCESS_UNAUTHORIZED
    );
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Access Forbidden", errorName?: ErrorName) {
    super(
      message,
      HTTPSTATUSCODE.FORBIDDEN,
      errorName || ErrorName.ACCESS_FORBIDDEN
    );
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error", errorName?: ErrorName) {
    super(
      message,
      HTTPSTATUSCODE.INTERNAL_SERVER_ERROR,
      errorName || ErrorName.INTERNAL_SERVER_ERROR
    );
  }
}

export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorName?: ErrorName
  ) {
    super(message, statusCode, errorName);
  }
}
