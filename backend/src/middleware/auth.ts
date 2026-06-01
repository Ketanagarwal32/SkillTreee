import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Middleware to authenticate requests using JWT tokens.
 */
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Access denied. No token provided.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "supersecret";
    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};
