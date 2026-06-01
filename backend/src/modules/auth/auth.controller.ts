import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { successResponse } from "../../utils/apiResponse";
import { AppError } from "../../middleware/errorHandler";

const authService = new AuthService();

export class AuthController {
  /**
   * Register endpoint controller.
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        throw new AppError("Username, email, and password are required.", 400);
      }

      if (username.length < 3) {
        throw new AppError("Username must be at least 3 characters long.", 400);
      }

      if (password.length < 6) {
        throw new AppError("Password must be at least 6 characters long.", 400);
      }

      const result = await authService.register({ username, email, password });
      successResponse(res, "Registration successful", result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login endpoint controller.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required.", 400);
      }

      const result = await authService.login({ email, password });
      successResponse(res, "Login successful", result, 200);
    } catch (error) {
      next(error);
    }
  }
}