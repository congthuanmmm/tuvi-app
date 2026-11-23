import { vi } from "@/lib/ziwei/i18n";

const HAN = /[\u3400-\u9fff]+/g;
const NAME_FIXES: [RegExp, string][] = [
  [/Tả Phụ(?!\p{L})/gu, "Tả Phù"],
  [/Hữu Bậc(?!\p{L})/gu, "Hữu Bật"],
  [/Bất Đắc Địa(?!\p{L})/gu, "Bất Đắc"],
  [/Bất Địa(?!\p{L})/gu, "Bất Đắc"],
];
const SIHUA: Record<string, string> = { 禄: "Lộc", 权: "Quyền", 科: "Khoa", 忌: "Kỵ" };

function toVi(han: string, before: string): string {
  if (/Hóa\s$/.test(before) && SIHUA[han]) return SIHUA[han];
  for (const h of [han, han.replace(/[星宫]$/, "")]) {
    const v = vi(h);
    if (v !== h) return v;
  }
  return han;
}

function replaceHan(text: string): string {
  return text.replace(HAN, (m, offset: number, all: string) => {
    const before = all.slice(0, offset);
    const v = toVi(m, before.slice(-5));
    if (v === m) return "";
    return before.trimEnd().endsWith(v) ? "" : v;
  });
}

// Từ Hán lạ ngoài ngoặc bị bỏ (giữ phần chú thích tiếng Việt nếu có). Giữ ngoặc chỉ chứa chữ Hán, ví dụ "Thái Dương (太阳)"; chuyển chữ Hán đứng ngoài ngoặc sang tiếng Việt.
export function cleanReading(md: string): string {
  let out = md.replace(/[\u3400-\u9fff]+\s*\(([^()\u3400-\u9fff]+)\)/g, (m, gloss: string) => {
    const han = m.match(HAN)![0];
    return vi(han) === han ? ` ${gloss}` : ` ${vi(han)} (${gloss})`;
  });
  out = out.replace(/\(([^()]*)\)|[^()]+/g, (seg, inner?: string) => {
    if (inner === undefined) return replaceHan(seg);
    if (/^[\u3400-\u9fff\s,，、/·-]+$/.test(inner)) return seg;
    return `(${replaceHan(inner)})`;
  });
  for (const [re, to] of NAME_FIXES) out = out.replace(re, to);
  return out
    .replace(/([\p{L}][\p{L} ]{1,30}) \(\1\)/gu, "$1")
    .replace(/ +([,.;:)])/g, "$1")
    .replace(/\( +/g, "(")
    .replace(/[^\S\n]{2,}/g, " ");
}

export function tidyFirstReading(md: string): string {
  const start = md.search(/^## /m);
  return (start > 0 ? md.slice(start) : md).replace(/^\s*-{3,}\s*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}
