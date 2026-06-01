import prisma from "../../config/db";
import { triggerGeminiReflection } from "../../utils/gemini";
import { AppError } from "../../middleware/errorHandler";
import { AttributesService } from "../attributes/attributes.service";

const attributesService = new AttributesService();

export class JournalService {
  /**
   * Submits a journal entry and runs the full AI reflection and attribute update pipeline.
   */
  async createEntry(userId: string, rawText: string) {
    if (!rawText || rawText.trim().length === 0) {
      throw new AppError("Journal entry text cannot be empty.", 400);
    }

    // 1. Run dynamic stagnant check on existing attributes before updating them
    await attributesService.checkStagnantStatus(userId);

    // 2. Fetch User Historical Context for Gemini
    const existingAttributes = await prisma.attribute.findMany({
      where: { userId },
      select: { name: true, points: true, status: true }
    });

    const recentMemories = await prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { summary: true, createdAt: true }
    });

    const activeArcs = await prisma.arc.findMany({
      where: { userId, isActive: true },
      select: { title: true, description: true }
    });

    // 3. Save Raw Entry to Database
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId,
        rawText
      }
    });

    // 4. Trigger Gemini AI Pipeline
    const aiResponse = await triggerGeminiReflection(
      rawText,
      existingAttributes,
      recentMemories,
      activeArcs
    );

    // 5. Save Reflection Summary
    const reflection = await prisma.reflection.create({
      data: {
        entryId: journalEntry.id,
        aiResponse: aiResponse.reflection,
        emotionalTheme: aiResponse.emotional_theme
      }
    });

    // 6. Save Session Memory Summary
    const memory = await prisma.memory.create({
      data: {
        userId,
        summary: aiResponse.memory_summary,
        periodStart: journalEntry.createdAt,
        periodEnd: journalEntry.createdAt
      }
    });

    // 7. Update or Create Attributes dynamically
    const processedAttributeChanges = [];
    for (const change of aiResponse.attribute_changes) {
      const { name, delta, reason } = change;

      // Skip invalid changes or zero changes
      if (!name || delta === 0) continue;

      // Upsert the Attribute
      let attribute = await prisma.attribute.findUnique({
        where: {
          userId_name: {
            userId,
            name
          }
        }
      });

      if (!attribute) {
        // Create new attribute
        attribute = await prisma.attribute.create({
          data: {
            userId,
            name,
            points: Math.max(0, delta), // Capped at 0 minimum
            status: "ACTIVE"
          }
        });
      } else {
        // Update existing attribute (reactivate if stagnant)
        attribute = await prisma.attribute.update({
          where: { id: attribute.id },
          data: {
            points: Math.max(0, attribute.points + delta),
            status: "ACTIVE" // Back to active as it has dynamic update
          }
        });
      }

      // Record Attribute History
      await prisma.attributeHistory.create({
        data: {
          attributeId: attribute.id,
          delta,
          reason
        }
      });

      processedAttributeChanges.push({
        name: attribute.name,
        points: attribute.points,
        delta,
        reason
      });
    }

    return {
      journalEntry,
      reflection,
      memory,
      attributeChanges: processedAttributeChanges
    };
  }

  /**
   * Retrieves all journal entries for a user, sorted newest first, with reflections.
   */
  async getEntries(userId: string) {
    return prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        reflection: true
      }
    });
  }

  /**
   * Retrieves a single journal entry by ID.
   */
  async getEntryById(userId: string, entryId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
      include: {
        reflection: true
      }
    });

    if (!entry) {
      throw new AppError("Journal entry not found.", 404);
    }

    return entry;
  }
}
