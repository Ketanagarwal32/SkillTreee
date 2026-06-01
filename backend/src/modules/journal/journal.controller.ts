import { Request, Response, NextFunction } from "express";
import { JournalService } from "./journal.service";
import { successResponse } from "../../utils/apiResponse";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";

const journalService = new JournalService();

export class JournalController {
  /**
   * Create new entry endpoint.
   */
  async createEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { rawText } = req.body;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        throw new AppError("A non-empty rawText journal entry is required.", 400);
      }

      const result = await journalService.createEntry(userId, rawText);
      successResponse(res, "Journal entry successfully processed and reflected upon.", result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all entries endpoint.
   */
  async getEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      const entries = await journalService.getEntries(userId);
      successResponse(res, "Journal entries retrieved successfully.", entries, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get entry by ID endpoint.
   */
  async getEntryById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const id = req.params.id as string;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      const entry = await journalService.getEntryById(userId, id);
      successResponse(res, "Journal entry retrieved successfully.", entry, 200);
    } catch (error) {
      next(error);
    }
  }
}
