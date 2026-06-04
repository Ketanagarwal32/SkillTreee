import prisma from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { triggerGroqPrompt } from "../../utils/groq";

type SessionWithEntries = {
  id: string;
  userId: string;
  entries: { rawText: string }[];
};

type AttributeDelta = {
  name: string;
  delta: number;
};

function parseAttributeDeltas(rawText: string): AttributeDelta[] {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((change) => ({
        name: typeof change.name === "string" ? change.name.trim() : "",
        delta: typeof change.delta === "number" ? Math.max(-2, Math.min(2, Math.trunc(change.delta))) : 0
      }))
      .filter((change) => change.name.length > 0 && change.delta !== 0)
      .slice(0, 4);
  } catch {
    return [];
  }
}

export async function evolveSessionAttributes(session: SessionWithEntries) {
  const combinedText = session.entries.map((entry) => entry.rawText).join("\n\n");

  const prompt = `You are an observational pattern-detection system. Based on the following journal entries from a single reflective period, identify behavioral and emotional tendencies that appeared. Return a JSON array of attribute changes. Each item: name (2-3 word psychological tendency, e.g. "Technical Resilience", "Avoidant Withdrawal"), delta (integer -2 to 2). Only include attributes with clear evidence. Maximum 4 attributes. Return JSON only, no explanation.

Entries:
${combinedText}`;

  const aiResponse = await triggerGroqPrompt(prompt);
  const parsed = parseAttributeDeltas(aiResponse);

  for (const change of parsed) {
    const { name, delta } = change;
    if (!name || delta === 0) continue;

    const attribute = await prisma.attribute.upsert({
      where: { userId_name: { userId: session.userId, name } },
      create: { userId: session.userId, name, value: Math.max(0, delta) },
      update: { value: { increment: delta } }
    });

    await prisma.attributeHistory.create({
      data: {
        attributeId: attribute.id,
        sessionId: session.id,
        delta
      }
    });
  }
}

export class AttributesService {
  async getAttributes(userId: string) {
    const attributes = await prisma.attribute.findMany({
      where: { userId },
      orderBy: { value: "desc" },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    const primaryAttribute = attributes.length > 0 ? attributes[0] : null;

    return {
      attributes,
      primaryAttribute: primaryAttribute ? { name: primaryAttribute.name, value: primaryAttribute.value } : null
    };
  }

  async getAttributeHistory(userId: string, attributeId: string) {
    const attribute = await prisma.attribute.findFirst({
      where: { id: attributeId, userId },
      include: {
        history: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!attribute) {
      throw new AppError("Attribute not found.", 404);
    }

    return attribute;
  }
}
