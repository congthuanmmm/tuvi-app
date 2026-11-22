import "server-only";
import { GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export async function generate(contents: Content[]): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Gemini trả về rỗng");
  return text;
}
