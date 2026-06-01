import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/apiResponse";

/**
 * Custom application-wide operational error class.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express Error Handling Middleware.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "An unexpected error occurred";

  // Log server-side errors in detail
  if (statusCode === 500) {
    console.error("[Unhandled Error]:", err);
  }

  errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? err.stack : undefined
  );
};
