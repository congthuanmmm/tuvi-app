import { vi } from "@/lib/ziwei/i18n";

const HAN = /[\u3400-\u9fff]+/g;
const NAME_FIXES: [RegExp, string][] = [
  [/Tả Phụ(?!\p{L})/gu, "Tả Phù"],
  [/Hữu Bậc(?!\p{L})/gu, "Hữu Bật"],
  [/Bất Đắc Địa(?!\p{L})/gu, "Bất Đắc"],
  [/Bất Địa(?!\p{L})/gu, "Bất Đắc"],
];
export const PATTERN_VI: Record<string, string> = {
  紫府同宫: "Tử Phủ đồng cung", 紫杀同宫: "Tử Sát đồng cung", 武府同宫: "Vũ Phủ đồng cung", 日月并明: "Nhật Nguyệt tịnh minh",
  日照雷门: "Nhật chiếu Lôi Môn", 阳梁昌禄: "Dương Lương Xương Lộc", 机月同梁: "Cơ Nguyệt Đồng Lương", 火贪格: "Hỏa Tham", 铃贪格: "Linh Tham",
  禄马交驰: "Lộc Mã giao trì", 三奇加会: "Tam Kỳ gia hội", 双禄朝垣: "Song Lộc triều viên", 命无正曜: "Mệnh vô chính diệu",
  羊陀夹命: "Kình Đà giáp Mệnh", 空劫夹命: "Không Kiếp giáp Mệnh", 巨机化忌: "Cự Cơ Hóa Kỵ", 廉贞七杀: "Liêm Trinh Thất Sát",
  刑忌夹印: "Hình Kỵ giáp Ấn", 杀破狼: "Sát Phá Tham",
};
export const patternVi = (han: string) => han.split(/\s*\/\s*/).map((h) => PATTERN_VI[h] ?? h).join(" / ");
const SIHUA: Record<string, string> = { 禄: "Lộc", 权: "Quyền", 科: "Khoa", 忌: "Kỵ" };

function toVi(han: string, before: string): string {
  if (/Hóa\s$/.test(before) && SIHUA[han]) return SIHUA[han];
  if (PATTERN_VI[han]) return PATTERN_VI[han];
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
