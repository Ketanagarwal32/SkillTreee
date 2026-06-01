import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGeminiMonthlyAggregation } from "../../utils/gemini";

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
   */
  async generateMonthlySummary(userId: string, year: number, month: number) {
    // Determine start and end dates of the target month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch all session memories created within this month
    const sessionMemories = await prisma.memory.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        // Avoid aggregating existing monthly memories (where period spans more than 1 day)
        NOT: {
          periodStart: {
            lt: prisma.memory.fields.periodEnd // Represents standard session memory if start == end
          }
        }
      }
    });

    // Filtering logic to extract session summaries (where periodStart and periodEnd are identical)
    const filteredSessions = sessionMemories.filter(
      (m) => m.periodStart.getTime() === m.periodEnd.getTime()
    );

    if (filteredSessions.length === 0) {
      throw new AppError("No session memories found for the specified month to aggregate.", 404);
    }

    // Extract active growth arcs to provide pattern context
    const activeArcs = await prisma.arc.findMany({
      where: {
        userId,
        isActive: true
      },
      select: {
        title: true,
        description: true
      }
    });

    const memoryTexts = filteredSessions.map((m) => m.summary);
    const arcTexts = activeArcs.map((a) => `${a.title}: ${a.description || "no description"}`);

    // Call Gemini API to compile and aggregate session nodes
    const monthlySummaryText = await triggerGeminiMonthlyAggregation(memoryTexts, arcTexts);

    // Check if a monthly summary for this period already exists.
    // If it does, we will overwrite/update it. Otherwise, create new.
    const existingMonthlySummary = await prisma.memory.findFirst({
      where: {
        userId,
        periodStart: startOfMonth,
        periodEnd: endOfMonth
      }
    });

    let monthlyMemory;

    if (existingMonthlySummary) {
      monthlyMemory = await prisma.memory.update({
        where: { id: existingMonthlySummary.id },
        data: {
          summary: monthlySummaryText
        }
      });
    } else {
      monthlyMemory = await prisma.memory.create({
        data: {
          userId,
          summary: monthlySummaryText,
          periodStart: startOfMonth,
          periodEnd: endOfMonth
        }
      });
    }

    return monthlyMemory;
  }
}
