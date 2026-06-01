import { Response, NextFunction } from "express";
import { AttributesService } from "./attributes.service";
import { successResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

const attributesService = new AttributesService();

export class AttributesController {
  /**
   * Get all user attributes (freshened via dynamic decay check).
   */
  async getAttributes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const result = await attributesService.getAttributes(userId);
      successResponse(res, "Attributes retrieved successfully.", result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed points delta history for a specific attribute.
   */
  async getAttributeHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const result = await attributesService.getAttributeHistory(userId, id);
      successResponse(res, "Attribute history retrieved successfully.", result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Manually trigger a check on stagnant attributes and execute points decay.
   */
  async triggerStagnantCheck(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      await attributesService.checkStagnantStatus(userId);
      successResponse(res, "Stagnation scans and decay applied successfully.", null, 200);
    } catch (error) {
      next(error);
    }
  }
}
