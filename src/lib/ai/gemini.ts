import "server-only";
import { GoogleGenAI, type Content } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const MODEL = "gemini-2.5-flash";

export async function generate(contents: Content[]): Promise<string> {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.7, thinkingConfig: { thinkingBudget: 1024 } },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Gemini trả về rỗng");
  return text;
}
