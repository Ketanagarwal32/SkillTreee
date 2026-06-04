import { Response, NextFunction } from "express";
import prisma from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";
import { AppError } from "../../middleware/errorHandler";
import { successResponse } from "../../utils/apiResponse";
import { getOrCreateSession } from "./session.service";

export class SessionController {
  async getCurrentSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Authentication required.", 401);
      }

      const session = await getOrCreateSession(userId);
      const sessionWithEntries = await prisma.session.findUnique({
        where: { id: session.id },
        include: {
          entries: {
            orderBy: { createdAt: "asc" }
          }
        }
      });

      successResponse(res, "Current session retrieved successfully.", sessionWithEntries, 200);
    } catch (error) {
      next(error);
    }
  }
}
