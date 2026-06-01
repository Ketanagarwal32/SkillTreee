import { Response } from "express";

export interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

/**
 * Send standard success response.
 */
export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send standard error response.
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : error || undefined,
  });
};
