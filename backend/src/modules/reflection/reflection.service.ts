import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGeminiReflection } from "../../utils/gemini";
import { triggerGroqAnalysis, triggerGroqReflectionParagraph } from "../../utils/groq";
import { ArcsService } from "../arcs/arcs.service";

export class ReflectionService {

  async getReflections(userId: string) {
    return prisma.reflection.findMany({
      where: { entry: { userId } },
      orderBy: { createdAt: "desc" },
      include: { entry: { select: { rawText: true, createdAt: true } } }
    });
  }

  async getReflectionById(userId: string, reflectionId: string) {
    const reflection = await prisma.reflection.findFirst({
      where: { id: reflectionId, entry: { userId } },
      include: { entry: { select: { rawText: true, createdAt: true } } }
    });

    if (!reflection) throw new AppError("Reflection not found.", 404);
    return reflection;
  }

  async createReflection(userId: string, text: string) {

    // 1. SAVE JOURNAL ENTRY
    const entry = await prisma.journalEntry.create({
      data: { userId, rawText: text }
    });

    // 2. GET USER CONTEXT
    const existingAttributes = await prisma.attribute.findMany({
      where: { userId },
      select: { name: true, points: true, status: true }
    });

    const recentMemories = await prisma.memory.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { summary: true }
    });

    // 3. GEMINI + GROQ IN PARALLEL
    const [geminiResult, groqResult] = await Promise.allSettled([
      triggerGeminiReflection(text),
      triggerGroqAnalysis(text, existingAttributes, recentMemories)
    ]);

    const buddhaReflection =
      geminiResult.status === "fulfilled"
        ? geminiResult.value.reflection
        : "The mind moves, the observer records.";

    const groqData =
      groqResult.status === "fulfilled"
        ? groqResult.value
        : {
            emotional_theme: "stillness",
            memory_summary: "A quiet entry, stored without analysis.",
            attribute_changes: []
          };

    if (geminiResult.status === "rejected") console.error("Gemini failed:", geminiResult.reason);
    if (groqResult.status === "rejected") console.error("Groq failed:", groqResult.reason);

    // 4. SAVE REFLECTION
    const reflection = await prisma.reflection.create({
      data: {
        entryId: entry.id,
        aiResponse: buddhaReflection,
        emotionalTheme: groqData.emotional_theme
      }
    });

    // 4b. GENERATE REFLECTION PARAGRAPH
    const reflectionParagraph = await triggerGroqReflectionParagraph(
      text,
      groqData.emotional_theme,
      groqData.attribute_changes
    );

    // Update reflection with paragraph
    await prisma.reflection.update({
      where: { id: reflection.id },
      data: { reflectionParagraph }
    });

    // 5. SAVE MEMORY SUMMARY
    await prisma.memory.create({
      data: {
        userId,
        summary: groqData.memory_summary,
        periodStart: new Date(),
        periodEnd: new Date()
      }
    });
    const arcsService = new ArcsService();
    await arcsService.checkAndGenerateArc(userId);

    // 6. APPLY ATTRIBUTE CHANGES
    for (const change of groqData.attribute_changes) {
      const existingAttribute = await prisma.attribute.findFirst({
        where: { userId, name: change.name }
      });

      if (existingAttribute) {
        await prisma.attribute.update({
          where: { id: existingAttribute.id },
          data: { points: { increment: change.delta } }
        });
        await prisma.attributeHistory.create({
          data: { attributeId: existingAttribute.id, delta: change.delta, reason: change.reason }
        });
      } else {
        const createdAttribute = await prisma.attribute.create({
          data: { userId, name: change.name, points: Math.max(change.delta, 1) }
        });
        await prisma.attributeHistory.create({
          data: { attributeId: createdAttribute.id, delta: change.delta, reason: change.reason }
        });
      }
    }

    // 7. RETURN EVERYTHING
    return {
      entry,
      reflection,
      ai: {
        reflection: buddhaReflection,
        emotional_theme: groqData.emotional_theme,
        memory_summary: groqData.memory_summary,
        attribute_changes: groqData.attribute_changes
      }
    };
  }
}