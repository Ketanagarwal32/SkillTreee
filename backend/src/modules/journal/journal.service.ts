import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { getOrCreateSession } from "../session/session.service";

export class JournalService {
  async createEntry(userId: string, rawText: string) {
    if (!rawText || rawText.trim().length === 0) {
      throw new AppError("Journal entry text cannot be empty.", 400);
    }

    const session = await getOrCreateSession(userId);

    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId,
        sessionId: session.id,
        rawText
      }
    });

    return { journalEntry, sessionId: session.id };
  }

  async getEntries(userId: string) {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        entries: {
          orderBy: { createdAt: "asc" }
        },
        memories: true
      }
    });
  }

  async getEntryById(userId: string, entryId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
      include: {
        session: true
      }
    });

    if (!entry) {
      throw new AppError("Journal entry not found.", 404);
    }

    return entry;
  }
}
