import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGroqPrompt } from "../../utils/groq";

function parseArcResponse(rawText: string): { title: string; description: string } {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      title: typeof parsed.title === "string" && parsed.title.trim() ? parsed.title.trim() : "Unmarked Period",
      description: typeof parsed.description === "string" ? parsed.description.trim() : ""
    };
  } catch {
    return { title: "Unmarked Period", description: "" };
  }
}

export async function checkArcGeneration(userId: string) {
  const unassignedMemories = await prisma.memory.findMany({
    where: { userId, arcId: null },
    orderBy: { createdAt: "asc" }
  });

  if (unassignedMemories.length < 7) return;

  const batch = unassignedMemories.slice(0, 7);
  const combinedSummaries = batch.map((memory) => memory.summary).join("\n\n");

  const prompt = `You are a quiet reflective archive. Based on the following memory summaries from someone's recent life period, generate a life arc. Title: 3-5 words, restrained and emotionally grounded. Description: 2-3 sentences, observational, not motivational. Avoid dramatic excess. Return JSON only with fields: title, description.

Memories:
${combinedSummaries}`;

  const parsed = parseArcResponse(await triggerGroqPrompt(prompt));

  await prisma.arc.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false, endDate: new Date() }
  });

  const arc = await prisma.arc.create({
    data: {
      userId,
      title: parsed.title,
      description: parsed.description,
      startDate: batch[0].periodStart,
      endDate: batch[batch.length - 1].periodEnd,
      isActive: true
    }
  });

  await prisma.memory.updateMany({
    where: { id: { in: batch.map((memory) => memory.id) } },
    data: { arcId: arc.id }
  });
}

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
        orderBy: { createdAt: "desc" },
        include: {
          memories: {
            orderBy: { createdAt: "asc" }
          }
        }
      });
    }

  async checkArcGeneration(userId: string): Promise<void> {
    await checkArcGeneration(userId);
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
