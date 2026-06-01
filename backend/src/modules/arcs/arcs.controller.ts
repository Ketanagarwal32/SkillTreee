import { Response, NextFunction } from "express";
import { ArcsService } from "./arcs.service";
import { successResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

const arcsService = new ArcsService();

export class ArcsController {
  /**
   * Create a new thematic life arc.
   */
  async createArc(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, description, startDate, endDate } = req.body;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      if (!title || typeof title !== "string" || title.trim().length === 0) {
        throw new AppError("A non-empty title is required.", 400);
      }

      const result = await arcsService.createArc(userId, title, description, startDate, endDate);
      successResponse(res, "Arc created successfully.", result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch all user life arcs.
   */
  async getArcs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const result = await arcsService.getArcs(userId);
      successResponse(res, "Arcs retrieved successfully.", result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle the active status of a specific arc.
   */
  async toggleArc(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const result = await arcsService.toggleArc(userId, id);
      successResponse(res, "Arc status toggled successfully.", result, 200);
    } catch (error) {
      next(error);
    }
  }
}
