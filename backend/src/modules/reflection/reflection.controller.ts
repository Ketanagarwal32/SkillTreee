import { Response, NextFunction } from "express";
import { ReflectionService } from "./reflection.service";
import { successResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

const reflectionService = new ReflectionService();

export class ReflectionController {
  async requestReflection(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.body;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
        throw new AppError("Session ID is required.", 400);
      }

      const reflection = await reflectionService.requestReflection(userId, sessionId);

      successResponse(res, "Reflection generated successfully.", reflection, 201);
    } catch (error) {
      next(error);
    }
  }

  async getReflections(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const reflections = await reflectionService.getReflections(userId);

      successResponse(res, "Reflections retrieved successfully.", reflections, 200);
    } catch (error) {
      next(error);
    }
  }
}
