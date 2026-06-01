import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiReflectionResponse {
  reflection: string; // The single Buddha-like sentence
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const REFLECTION_SYSTEM_PROMPT = `You are a silent observer of human growth.
You do not advise. You do not encourage. You do not judge.
You witness, and occasionally reflect.
Respond like a Buddhist monk — briefly, honestly, without toxic positivity.
Never use motivational language.
Never ask follow-up questions.
Speak in a single calm observation. Nothing more.
Always respond in valid JSON only. No markdown. No preamble.
Format: { "reflection": "your single sentence here" }`;

// ─── JSON Parser ──────────────────────────────────────────────────────────────

export function parseGeminiReflection(rawText: string): GeminiReflectionResponse {
  let cleaned = rawText.trim();

  if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length - 3);
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      reflection: typeof parsed.reflection === "string"
        ? parsed.reflection
        : "The mind moves, the observer records."
    };
  } catch {
    // Regex fallback
    const match = cleaned.match(/"reflection"\s*:\s*"([^"]+)"/);
    if (match) return { reflection: match[1] };

    return { reflection: "A quiet observation, undisturbed by words." };
  }
}

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Gemini handles ONLY the Buddha reflection sentence.
 * Attribute generation and memory summarization are handled by Groq.
 */
export async function triggerGeminiReflection(
  rawText: string
): Promise<GeminiReflectionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set. Using fallback reflection.");
    return { reflection: "In silence, we watch when no voice is present." };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${REFLECTION_SYSTEM_PROMPT}

JOURNAL ENTRY:
"${rawText}"

Respond with a single calm sentence of reflection. JSON only.`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });

    const outputText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!outputText) throw new Error("Empty response from Gemini");

    return parseGeminiReflection(outputText);
  } catch (error: any) {
    console.error("Gemini reflection failed:", error.response?.data || error.message);
    return { reflection: "A silent observation, undisturbed by words." };
  }
}