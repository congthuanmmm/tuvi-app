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
- Độ dài phần sections tổng cộng 600-1000 chữ. summary 2-3 câu, trả lời trực tiếp "X là gì / nói về điều gì" để công cụ AI trích dẫn được.
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
const allSlugs = ENTRIES.map((x) => `${x.type}/${x.slug} (${x.name})`).join(", ");

async function gen(entry) {
  const out = join("content/wiki", entry.type, `${entry.slug}.json`);
  if (existsSync(out) && !process.argv.includes("--force")) return console.log("skip", out);
  const prompt = `Viết bài Wiki cho mục: "${entry.name}" (${entry.han}), thuộc nhóm "${entry.group}".
Danh sách slug hợp lệ cho related: ${allSlugs}

Tài liệu tham khảo:
${SOURCES[entry.type]()}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { systemInstruction: SYSTEM, temperature: 0.6, responseMimeType: "application/json", responseSchema: schema },
      });
      const data = JSON.parse(res.text);
      const valid = new Set(ENTRIES.map((x) => `${x.type}/${x.slug}`));
      data.related = data.related.filter((r) => valid.has(r) && r !== `${entry.type}/${entry.slug}`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, JSON.stringify({ ...data, generatedBy: MODEL }, null, 2) + "\n");
      const words = data.sections.map((s) => s.body).join(" ").split(/\s+/).length;
      return console.log("ok", out, `${words} words`);
    } catch (err) {
      console.error("retry", entry.slug, attempt, err.message?.slice(0, 120));
    }
  }
  throw new Error(`failed ${entry.slug}`);
}

const picks = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const todo = picks.length ? ENTRIES.filter((x) => picks.includes(`${x.type}/${x.slug}`)) : ENTRIES;
const CONCURRENCY = 4;
for (let i = 0; i < todo.length; i += CONCURRENCY) await Promise.all(todo.slice(i, i + CONCURRENCY).map(gen));
console.log("entries", ENTRIES.length, "done", todo.length);
