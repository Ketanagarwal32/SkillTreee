import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

export class ArcsService {

  async createArc(userId: string, title: string, description?: string, startDate?: Date, endDate?: Date) {
    if (!title || title.trim().length === 0) {
      throw new AppError("Arc title is required.", 400);
    }

    return prisma.arc.create({
      data: {
        userId,
        title,
        description: description || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      }
    });
  }

  async getArcs(userId: string) {
    return prisma.arc.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  async checkAndGenerateArc(userId: string): Promise<void> {
    const entryCount = await prisma.journalEntry.count({ where: { userId } });
    console.log(`Arc check — entry count: ${entryCount}`);

    // Trigger on every 7th entry
    if (entryCount % 7 !== 0 || entryCount === 0) return;

    // Get available memories — don't require exactly 7
    const memories = await prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 7,
      select: { summary: true }
    });

    console.log(`Arc check — memories found: ${memories.length}`);

    // Need at least 3 memories to generate a meaningful arc
    if (memories.length < 3) return;

    // Deactivate current active arc
    await prisma.arc.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, endDate: new Date() }
    });

    // Generate new arc from Groq
    const { triggerGroqArcGeneration } = await import("../../utils/groq");
    const arcData = await triggerGroqArcGeneration(memories.map(m => m.summary));

    await prisma.arc.create({
      data: {
        userId,
        title: arcData.title,
        description: arcData.description,
        startDate: new Date(),
        isActive: true
      }
    });

    console.log(`New arc generated: ${arcData.title}`);
  }

  async toggleArc(userId: string, arcId: string) {
    const arc = await prisma.arc.findFirst({ where: { id: arcId, userId } });
    if (!arc) throw new AppError("Arc not found.", 404);

    return prisma.arc.update({
      where: { id: arcId },
      data: { isActive: !arc.isActive }
    });
  }

  async deleteArc(userId: string, arcId: string) {
    const arc = await prisma.arc.findFirst({ where: { id: arcId, userId } });
    if (!arc) throw new AppError("Arc not found.", 404);

    await prisma.arc.delete({ where: { id: arcId } });
    return { id: arcId };
  }
}