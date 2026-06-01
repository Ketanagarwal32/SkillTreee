  import { Response, NextFunction } from "express";
  import { MemoryService } from "./memory.service";
  import { successResponse } from "../../utils/apiResponse";
  import { AuthenticatedRequest } from "../../middleware/auth";
  import { AppError } from "../../middleware/errorHandler";

  const memoryService = new MemoryService();

  export class MemoryController {
    /**
     * Get all memory logs of the user.
     */
    async getMemories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const userId = req.user?.id;

        if (!userId) {
          throw new AppError("Authentication required.", 401);
        }

        const memories = await memoryService.getMemories(userId);
        successResponse(res, "Memories retrieved successfully.", memories, 200);
      } catch (error) {
        next(error);
      }
    }

    /**
     * Trigger monthly reflection aggregation.
     */
    async generateMonthlySummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
      try {
        const userId = req.user?.id;
        const { year, month } = req.body;

        if (!userId) {
          throw new AppError("Authentication required.", 401);
        }

        if (!year || !month) {
          throw new AppError("Both year and month are required to generate a summary.", 400);
        }

        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          throw new AppError("Invalid calendar year or month provided.", 400);
        }

        const result = await memoryService.generateMonthlySummary(userId, yearNum, monthNum);
        successResponse(res, "Monthly summary compiled and archived successfully.", result, 200);
      } catch (error) {
        next(error);
      }
    }
  }
