import { Response, NextFunction } from "express";
import { ReflectionService } from "./reflection.service";
import { successResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import prisma from "../../config/db";

const reflectionService = new ReflectionService();

export class ReflectionController {

  /**
   * Create a new reflection from a journal entry.
   */
  async createReflection(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {

      const userId = req.user?.id;
      const { text } = req.body;

      // Authentication check
      if (!userId) {
        throw new AppError(
          "Authentication required.",
          401
        );
      }

      // Validation
      if (!text || typeof text !== "string") {
        throw new AppError(
          "Journal text is required.",
          400
        );
      }

      // Optional length validation
      if (text.trim().length < 3) {
        throw new AppError(
          "Journal entry is too short.",
          400
        );
      }

      // Create reflection pipeline
      const reflection =
        await reflectionService.createReflection(
          userId,
          text
        );

      successResponse(
        res,
        "Reflection created successfully.",
        reflection,
        201
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reflections for the authenticated user.
   */
  async getReflections(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {

      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          "Authentication required.",
          401
        );
      }

      const reflections =
        await reflectionService.getReflections(
          userId
        );

      successResponse(
        res,
        "Reflections retrieved successfully.",
        reflections,
        200
      );

    } catch (error) {
      next(error);
    }
  }
  async getLatestReflection(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Authentication required.", 401);

    const latest = await prisma.reflection.findFirst({
      where: { entry: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        reflectionParagraph: true,
        emotionalTheme: true,
        createdAt: true
      }
    });

    successResponse(res, "Latest reflection retrieved.", latest, 200);
  } catch (error) {
    next(error);
  }
}
  /**
   * Get a single reflection by ID.
   */
  async getReflectionById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {

    try {

      const userId = req.user?.id;
      const id = req.params.id as string;
      if (!userId) {
        throw new AppError(
          "Authentication required.",
          401
        );
      }

      if (!id) {
        throw new AppError(
          "Reflection ID is required.",
          400
        );
      }

      const reflection =
        await reflectionService.getReflectionById(
          userId,
          id
        );

      successResponse(
        res,
        "Reflection retrieved successfully.",
        reflection,
        200
      );

    } catch (error) {
      next(error);
    }
  }
}
