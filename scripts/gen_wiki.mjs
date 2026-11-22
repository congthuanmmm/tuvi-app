// Sinh nội dung Wiki tử vi bằng Gemini từ tài liệu của Numerologist_skills.
// Dùng: GEMINI_API_KEY=... node scripts/gen_wiki.mjs [type/slug ...] [--force]
// Kết quả lưu ở content/wiki/<type>/<slug>.json, chạy một lần rồi commit.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GoogleGenAI, Type } from "@google/genai";

const SRC = process.env.SKILLS_DIR || join(process.env.HOME, "repos/Numerologist_skills/ziwei-doushu");
const read = (f) => readFileSync(join(SRC, f), "utf8");
const catalogSrc = readFileSync("src/lib/wiki/catalog.ts", "utf8");
const ENTRIES = [...catalogSrc.matchAll(/e\("([a-z-]+)", "([^"]+)", \[([\s\S]*?)\]\),/g)].flatMap(([, type, group, body]) =>
  [...body.matchAll(/\["([^"]+)", "([^"]+)", "([^"]+)"\]/g)].map(([, slug, name, han]) => ({ type, group, slug, name, han })));

const skill = read("SKILL.md");
const SOURCES = {
  sao: () => read("references/stars.md") + "\n\n" + read("references/sihua.md").slice(0, 3000),
  cung: () => skill.slice(skill.indexOf("### 第四步"), skill.indexOf("## 回应风格")) + "\n\n" + read("references/sihua.md"),
  "tu-hoa": () => read("references/sihua.md"),
  "cach-cuc": () => read("references/patterns.md") + "\n\n" + read("references/stars.md"),
};

const SYSTEM = `Bạn là biên tập viên nội dung về Tử Vi Đẩu Số cho website Lá Số Việt, viết cho người Việt không chuyên.
Quy tắc:
- Viết hoàn toàn bằng tiếng Việt tự nhiên, rõ ràng, giọng trung tính và tôn trọng. Không dùng từ tiếng Anh.
- Chữ Hán chỉ đặt trong ngoặc ngay sau thuật ngữ ở lần nhắc đầu, ví dụ Thiên Cơ (天机). Dùng tên Việt chuẩn: Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh, Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng, Thiên Lương, Thất Sát, Phá Quân, Văn Xương, Văn Khúc, Tả Phù, Hữu Bật, Thiên Khôi, Thiên Việt, Lộc Tồn, Thiên Mã, Kình Dương, Đà La, Hỏa Tinh, Linh Tinh, Địa Không, Địa Kiếp; cung Mệnh, Huynh Đệ, Phu Thê, Tử Tức, Tài Bạch, Tật Ách, Thiên Di, Nô Bộc, Quan Lộc, Điền Trạch, Phúc Đức, Phụ Mẫu; Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ; miếu, vượng, đắc, lợi, bình, hãm.
- Dựa trên tài liệu tham khảo (tiếng Trung) được cung cấp và kiến thức Tử Vi phái Tam Hợp phổ biến. Không bịa số liệu, không khẳng định chắc chắn về vận mệnh. Nhấn mạnh lá số cho thấy xu hướng, cần xem tổng thể tam phương tứ chính, độ sáng, tứ hóa.
- Khi nhắc nhóm sao, gọi là chòm Tử Vi (gồm Tử Vi, Thiên Cơ, Thái Dương, Vũ Khúc, Thiên Đồng, Liêm Trinh) và chòm Thiên Phủ (các chính tinh còn lại); không gán sao vào Bắc Đẩu hay Nam Đẩu.
- Không để sót chữ Hán đơn lẻ ngoài ngoặc.
- Sức khỏe, pháp lý, tài chính: chỉ nói ở mức xu hướng và khuyên hỏi chuyên gia.
- Độ dài phần sections tổng cộng 700-1000 chữ (tối thiểu 700 chữ, mỗi mục ít nhất 2 đoạn). summary 2-3 câu, trả lời trực tiếp "X là gì / nói về điều gì" để công cụ AI trích dẫn được.
- sections: 4-6 mục, heading ngắn (không đánh số), body là Markdown (đoạn văn, danh sách gạch đầu dòng, chữ đậm). Không dùng tiêu đề Markdown (#) trong body.
- faq: 3-4 câu hỏi người dùng hay tìm trên Google, câu trả lời 2-4 câu.
- related: 3-6 slug liên quan, chỉ chọn trong danh sách được cung cấp, dạng "type/slug".`;

const schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, body: { type: Type.STRING } }, required: ["heading", "body"] } },
    faq: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { q: { type: Type.STRING }, a: { type: Type.STRING } }, required: ["q", "a"] } },
    related: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "sections", "faq", "related"],
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const OPENAI_BASE = process.env.LLM_BASE_URL;

const SHAPE = `{"summary": string, "sections": [{"heading": string, "body": string}], "faq": [{"q": string, "a": string}], "related": string[]}`;

async function generate({ contents, config }) {
  if (!OPENAI_BASE) return ai.models.generateContent({ model: MODEL, contents, config });
  const messages = [
    ...(config.systemInstruction ? [{ role: "system", content: config.systemInstruction }] : []),
    { role: "user", content: `${contents}\n\nChỉ trả về một đối tượng JSON đúng cấu trúc: ${SHAPE}` },
  ];
  const r = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: config.temperature, max_tokens: 32000, response_format: { type: "json_object" } }),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${body.slice(0, 200)}`);
  return { text: JSON.parse(body).choices[0].message.content };
}
const allSlugs = ENTRIES.map((x) => `${x.type}/${x.slug} (${x.name})`).join(", ");

const strayHan = (d) => JSON.stringify(d).replace(/（[^）]*）|\([^)]*\)/g, "").match(/[\u4e00-\u9fff]+/g);

const wordCount = (d) => d.sections.map((s) => s.body).join(" ").split(/\s+/).length;

async function expand(data, entry) {
  const res = await generate({
    model: MODEL,
    contents: `Bài viết Wiki tử vi về "${entry.name}" dưới đây mới có ${wordCount(data)} chữ, cần 750-950 chữ ở phần sections.
Viết mở rộng từng mục: thêm giải thích, ví dụ cách luận và lưu ý thực tế, dựa trên đúng nội dung đã có, không bịa số liệu. Giữ nguyên summary, faq, related và văn phong. Chữ Hán chỉ đặt trong ngoặc. Trả về đúng cấu trúc JSON.

${JSON.stringify(data)}`,
    config: { systemInstruction: SYSTEM, temperature: 0.4, responseMimeType: "application/json", responseSchema: schema },
  });
  return JSON.parse(res.text);
}

async function repairHan(data) {
  const res = await generate({
    model: MODEL,
    contents: `Trong JSON dưới đây có các cụm chữ Hán nằm ngoài ngoặc: ${strayHan(data).join(", ")}.
Thay mỗi cụm đó bằng từ tiếng Việt tương đương cho câu văn trôi chảy. Không thêm chữ Hán mới ngoài ngoặc. Giữ nguyên mọi nội dung khác, trả về đúng cấu trúc JSON.

${JSON.stringify(data)}`,
    config: { temperature: 0, responseMimeType: "application/json", responseSchema: schema },
  });
  return JSON.parse(res.text);
}

async function gen(entry) {
  const out = join("content/wiki", entry.type, `${entry.slug}.json`);
  if (existsSync(out) && !process.argv.includes("--force")) return console.log("skip", out);
  const prompt = `Viết bài Wiki cho mục: "${entry.name}" (${entry.han}), thuộc nhóm "${entry.group}".
Danh sách slug hợp lệ cho related: ${allSlugs}

Tài liệu tham khảo:
${SOURCES[entry.type]()}`;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await generate({
        model: MODEL,
        contents: prompt,
        config: { systemInstruction: SYSTEM, temperature: Number(process.env.WIKI_TEMPERATURE || 0.6), responseMimeType: "application/json", responseSchema: schema },
      });
      let data = JSON.parse(res.text);
      for (let i = 0; i < 2 && wordCount(data) < 650; i++) data = await expand(data, entry);
      if (strayHan(data)) data = await repairHan(data);
      if (!data.summary.includes(`(${entry.han})`) && data.summary.includes(entry.name))
        data.summary = data.summary.replace(entry.name, `${entry.name} (${entry.han})`);
      const stray = strayHan(data);
      if (stray) throw new Error(`stray han ${stray.join(",")}`);
      const all = JSON.stringify(data);
      const total = wordCount(data);
      if (total < 600) throw new Error(`too short ${total}`);
      if (/Bắc Đẩu|Nam Đẩu/.test(all)) throw new Error("dau wording");
      if (!entry.han.split(/\s*\/\s*/).every((h) => data.summary.includes(h))) throw new Error("missing han in summary");
      if (data.sections.length < 4 || data.faq.length < 3) throw new Error("structure");
      const valid = new Set(ENTRIES.map((x) => `${x.type}/${x.slug}`));
      data.related = data.related.filter((r) => valid.has(r) && r !== `${entry.type}/${entry.slug}`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, JSON.stringify({ ...data, generatedBy: MODEL }, null, 2) + "\n");
      const words = data.sections.map((s) => s.body).join(" ").split(/\s+/).length;
      return console.log("ok", out, `${words} words`);
    } catch (err) {
      console.error("retry", entry.slug, attempt, err.message?.slice(0, 120));
      const wait = Number(err.message?.match(/retry in ([\d.]+)s/)?.[1] ?? 10 * attempt);
      await new Promise((r) => setTimeout(r, (wait + 2) * 1000));
    }
  }
  console.error("FAILED", entry.type + "/" + entry.slug);
  process.exitCode = 1;
}

const picks = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const todo = picks.length ? ENTRIES.filter((x) => picks.includes(`${x.type}/${x.slug}`)) : ENTRIES;
const CONCURRENCY = Number(process.env.WIKI_CONCURRENCY || 2);
for (let i = 0; i < todo.length; i += CONCURRENCY) await Promise.all(todo.slice(i, i + CONCURRENCY).map(gen));
console.log("entries", ENTRIES.length, "done", todo.length);
