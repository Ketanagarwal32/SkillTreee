import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGroqPrompt } from "../../utils/groq";

const REFLECTION_LIMIT_PER_SESSION = 3;

export class ReflectionService {
  async requestReflection(userId: string, sessionId: string) {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
      include: { entries: true }
    });

    if (!session) throw new AppError("Session not found.", 404);

    if (session.entries.length === 0) {
      throw new AppError("No entries in this session to reflect on.", 400);
    }

    if (session.reflectionCount >= REFLECTION_LIMIT_PER_SESSION) {
      return {
        silenced: true,
        message: "The observer has nothing further to add to this session."
      };
    }

    const combinedEntries = session.entries.map((entry) => entry.rawText).join("\n\n");

    const recentMemories = await prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { summary: true }
    });

    const activeArc = await prisma.arc.findFirst({
      where: { userId, isActive: true },
      select: { title: true, description: true }
    });

    const memoryContext = recentMemories.length > 0
      ? "Recent patterns:\n" + recentMemories.map((memory) => memory.summary).join("\n")
      : "";

    const arcContext = activeArc
      ? `Current life arc: ${activeArc.title}. ${activeArc.description || ""}`
      : "";

    const prompt = `You are a quiet, restrained observer. You have been watching someone's reflective writing over time.

${arcContext}
${memoryContext}

Today's entries:
${combinedEntries}

Offer one brief observation - 2-4 sentences. Do not explain this person to themselves with confidence. Do not coach or motivate. Do not offer solutions. Notice something that appears present without claiming to know what it means. Remain uncertain. Remain grounded. Do not begin with "I" or "You". Avoid therapeutic language.`;

    const content = await triggerGroqPrompt(prompt);

    await prisma.session.update({
      where: { id: sessionId },
      data: { reflectionCount: { increment: 1 } }
    });

    const reflection = await prisma.reflection.create({
      data: { userId, sessionId, content }
    });

    return { silenced: false, reflection };
  }

  async getReflections(userId: string) {
    return prisma.reflection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        session: {
          select: { date: true, entries: { select: { rawText: true } } }
        }
      }
    });
  }
}
