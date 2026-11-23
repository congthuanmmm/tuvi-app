import "server-only";
import { GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt";
import { cleanReading } from "./clean";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 150_000 } });
export const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export async function generate(contents: Content[]): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.6, maxOutputTokens: 16384, thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Gemini trả về rỗng");
  return cleanReading(text);
}
