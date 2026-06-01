import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

export class MemoryService {
  /**
   * Retrieves all memories for a user, sorted by date (newest first).
   */
  async getMemories(userId: string) {
    return prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Generates a monthly summary by aggregating all session memory summaries within the specified calendar month.
   * Compresses them into a single high-level 3-4 line memory, mapping across the full month period.
   * NOTE: This feature is currently disabled.
   */
  async generateMonthlySummary(userId: string, year: number, month: number) {
    throw new AppError("Monthly aggregation system is disabled.", 501);
  }
}
