import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGroqPrompt } from "../../utils/groq";

type SessionWithEntries = {
  id: string;
  userId: string;
  createdAt: Date;
  entries: { rawText: string }[];
};

export async function generateSessionMemory(session: SessionWithEntries) {
  const combinedText = session.entries.map((entry) => entry.rawText).join("\n\n");

  const prompt = `You are a quiet, observational system. Based on the following journal entries from a single reflective period, generate a memory - a compressed, grounded summary of what emotionally and behaviorally occurred. Write 3-4 sentences. Be observational and restrained. Avoid poetic abstraction. Avoid motivational language. Avoid explaining the person to themselves. Write as if recording what was present, not what it means.

Entries:
${combinedText}`;

  const aiResponse =
    (await triggerGroqPrompt(prompt)) ||
    "This session contained entries that could not be summarized by the archive.";

  return prisma.memory.create({
    data: {
      userId: session.userId,
      sessionId: session.id,
      summary: aiResponse,
      periodStart: session.createdAt,
      periodEnd: new Date()
    }
  });
}

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
