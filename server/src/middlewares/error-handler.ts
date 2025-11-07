import { z } from "zod";
import { ErrorRequestHandler, Response } from "express";
import { HTTPSTATUSCODE } from "../config/status-codes.config";
import { ErrorName } from "../lib/enums/error-names";
import { AppError } from "../lib/errors/app-errors";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(HTTPSTATUSCODE.BAD_REQUEST).json({
    message: errors[0].message,
    errorName: ErrorName.VALIDATION_ERROR,
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): any => {
  console.error(`Error occured on PATH: ${req.path}`, error);

  // Handle Mongoose duplicate key error for unique slug
  if (
    (error as any).codeName === "DuplicateKey" &&
    (error as any).code === 11000 &&
    (error as any).keyPattern
  ) {
    if ((error as any).keyPattern.slug) {
      return res.status(HTTPSTATUSCODE.BAD_REQUEST).json({
        message: "Title already exist",
        errorName: "DUPLICATE_SLUG",
      });
    }

    return res.status(HTTPSTATUSCODE.BAD_REQUEST).json({
      message: "Duplicate entry",
      errorName: "DUPLICATE_KEY",
    });
  }

  if (error instanceof SyntaxError) {
    return res.status(HTTPSTATUSCODE.BAD_REQUEST).json({
      message: "Invalid JSON format, please check your request body",
      errorName: "INVALID_JSON",
    });
  }

  if (error instanceof z.ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof AppError) {
    if (error.errorName === "AUTH_TOKEN_EXPIRED") {
      //   clearAuthenticationCookies(res);
    }
    return res.status(error.statusCode).json({
      message: error.message,
      errorName: error.errorName,
    });
  }

  return res.status(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR).json({
    message: error?.message || "Unknown error occurred",
    errorName: "INTERNAL_SERVER_ERROR",
  });
};
