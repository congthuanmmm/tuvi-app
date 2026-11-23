import "server-only";
import { GoogleGenAI, ThinkingLevel, type Content } from "@google/genai";
import { SYSTEM_PROMPT } from "./prompt";
import { cleanReading } from "./clean";

export const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2, process.env.GEMINI_API_KEY_3].filter((k): k is string => Boolean(k));
const clients = KEYS.map((apiKey) => new GoogleGenAI({ apiKey, httpOptions: { timeout: 150_000 } }));
const exhaustedUntil = new Array<number>(KEYS.length).fill(0);
const EXHAUSTED_MS = 60 * 60 * 1000;

function isQuotaError(e: unknown) {
  const status = (e as { status?: number })?.status;
  return status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(String(e));
}

export async function generate(contents: Content[]): Promise<string> {
  if (!clients.length) throw new Error("Thiếu GEMINI_API_KEY");
  const now = Date.now();
  const order = clients.map((_, i) => i).sort((a, b) => Number(exhaustedUntil[a] > now) - Number(exhaustedUntil[b] > now));
  let lastError: unknown;
  for (const i of order) {
    try {
      const res = await clients[i].models.generateContent({
        model: MODEL,
        contents,
        config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.6, maxOutputTokens: 16384, thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } },
      });
      const text = res.text?.trim();
      if (!text) throw new Error("Gemini trả về rỗng");
      exhaustedUntil[i] = 0;
      return cleanReading(text);
    } catch (e) {
      lastError = e;
      if (!isQuotaError(e)) throw e;
      exhaustedUntil[i] = Date.now() + EXHAUSTED_MS;
      console.warn(`gemini key #${i + 1} hết hạn mức, chuyển key khác`);
    }
  }
  throw lastError;
}
