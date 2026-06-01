import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttributeChange {
  name: string;
  delta: number;
  reason: string;
}

export interface GroqAttributeResponse {
  emotional_theme: string;
  memory_summary: string;
  attribute_changes: AttributeChange[];
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const GROQ_SYSTEM_PROMPT = `You are a behavioral pattern analyst for a quiet self-reflection system.
Your job is to analyze journal entries and return structured data only.
Never give advice. Never motivate. Never judge.
Infer attributes dynamically from behavior — never use predefined categories.
Attributes should feel personal and emergent. Examples: "Solitary Recovery", "Culinary Warmth", "Narrative Curiosity".
A productive day may gain Focus but lose Physical Wellbeing.
Doomscrolling may gain Emotional Fatigue but lose Creative Energy.
Be honest and multidimensional — growth always has tradeoffs.
Always respond in valid JSON only. No markdown. No preamble.`;

// ─── JSON Parser ──────────────────────────────────────────────────────────────

function parseGroqResponse(rawText: string): GroqAttributeResponse {
  let cleaned = rawText.trim();

  if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length - 3);
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      emotional_theme: typeof parsed.emotional_theme === "string"
        ? parsed.emotional_theme
        : "reflection",
      memory_summary: typeof parsed.memory_summary === "string"
        ? parsed.memory_summary
        : "Moments captured, dissolving into memory.",
      attribute_changes: Array.isArray(parsed.attribute_changes)
        ? parsed.attribute_changes.map((c: any) => ({
            name: typeof c.name === "string" ? c.name : "Unrecognized Balance",
            delta: typeof c.delta === "number" ? c.delta : 0,
            reason: typeof c.reason === "string" ? c.reason : "unspecified"
          }))
        : []
    };
  } catch {
    // Regex fallback for JSON block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const fallback = JSON.parse(jsonMatch[0]);
        return {
          emotional_theme: fallback.emotional_theme ?? "stillness",
          memory_summary: fallback.memory_summary ?? "A quiet moment, stored but unreflected.",
          attribute_changes: Array.isArray(fallback.attribute_changes)
            ? fallback.attribute_changes
            : []
        };
      } catch {}
    }

    return {
      emotional_theme: "stillness",
      memory_summary: "The emotional essence of this entry dissolved before it could be transcribed.",
      attribute_changes: []
    };
  }
}

// ─── Groq API Call ────────────────────────────────────────────────────────────

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: GROQ_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    },
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 15000
    }
  );

  return response.data?.choices?.[0]?.message?.content ?? "";
}

// ─── Main Functions ───────────────────────────────────────────────────────────

/**
 * Groq handles attribute generation + memory summarization.
 * Called once per journal entry submission.
 */
export async function triggerGroqAnalysis(
  rawText: string,
  existingAttributes: { name: string; points: number; status: string }[],
  recentMemories: { summary: string }[]
): Promise<GroqAttributeResponse> {
  const prompt = `EXISTING USER ATTRIBUTES:
${JSON.stringify(existingAttributes)}

RECENT MEMORY SUMMARIES:
${JSON.stringify(recentMemories.map(m => m.summary))}

NEW JOURNAL ENTRY:
"${rawText}"

Analyze this entry and return a JSON object with this exact structure:
{
  "emotional_theme": "single word or short phrase",
  "memory_summary": "3-4 lines capturing emotional essence, not literal events",
  "attribute_changes": [
    { "name": "Attribute Name", "delta": integer, "reason": "brief reason" }
  ]
}

Rules:
- 2 to 4 attribute changes per entry
- delta range: -5 to +5
- attribute names must be emergent and personal, not generic
- memory_summary must capture feeling, not facts`;

  try {
    const raw = await callGroq(prompt);
    return parseGroqResponse(raw);
  } catch (error: any) {
    console.error("Groq analysis failed:", error.response?.data || error.message);
    return {
      emotional_theme: "stillness",
      memory_summary: "A quiet entry, stored without analysis.",
      attribute_changes: []
    };
  }
}

/**
 * Groq aggregates multiple session summaries into a monthly arc summary.
 */
export async function triggerGroqMonthlyAggregation(
  memories: string[],
  activeArcs: string[]
): Promise<string> {
  const prompt = `SESSION SUMMARIES FROM THIS MONTH:
${JSON.stringify(memories)}

ACTIVE LIFE ARCS:
${JSON.stringify(activeArcs)}

Distill these into a single 3-4 line monthly summary.
Capture emotional and growth essence — not a list of events.
Honest, calm, reflective prose. No advice. No positivity inflation.
Return plain text only. No JSON.`;

  try {
    const raw = await callGroq(prompt);
    return raw.trim() || "A month passes like mist, leaving quiet footprints.";
  } catch (error: any) {
    console.error("Groq monthly aggregation failed:", error.message);
    return "The month dissolves into standard silence. The patterns remain, unwritten.";
  }
}