import { KB } from "./kb";
import { vi } from "@/lib/ziwei/i18n";
import { patternVi } from "./clean";
import type { ChartResult, Palace, SihuaItem } from "@/lib/ziwei/types";

const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const CORE_ORDER = ["命宫", "官禄", "财帛", "夫妻", "迁移", "福德", "兄弟", "子女", "疾厄", "交友", "田宅", "父母"];
const LAYER = { natal: "sinh niên", decadal: "đại hạn", yearly: "lưu niên" } as const;
type Layer = keyof typeof LAYER;

const term = (han: string) => (vi(han) === han ? han : `${vi(han)} (${han})`);
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
const kbGet = <T,>(obj: Record<string, T>, key: string): T | undefined => obj[key];

export interface PatternHit { name: string; status: "thành cách" | "gần thành cách"; why: string }

class ChartView {
  byBranch = new Map<number, Palace>();
  layers: Record<Layer, SihuaItem[]>;
  constructor(public r: ChartResult) {
    for (const p of r.chart.palaces) this.byBranch.set(BRANCHES.indexOf(p.branch), p);
    this.layers = {
      natal: r.chart.year_sihua,
      decadal: r.horoscope?.decadal?.sihua ?? [],
      yearly: r.horoscope?.yearly?.sihua ?? [],
    };
  }
  at = (b: number) => this.byBranch.get(((b % 12) + 12) % 12)!;
  idx = (p: Palace) => BRANCHES.indexOf(p.branch);
  named = (name: string) => this.r.chart.palaces.find((p) => p.name === name)!;
  sanfang = (p: Palace) => [0, 6, 4, 8].map((d) => this.at(this.idx(p) + d));
  stars = (p: Palace) => [...p.major_stars.map((s) => s.name), ...p.minor_stars.map((s) => s.name), ...p.adjective_stars];
  has = (p: Palace, star: string) => this.stars(p).includes(star);
  where = (star: string) => this.r.chart.palaces.find((p) => this.has(p, star));
  inGroup = (ps: Palace[], star: string) => ps.some((p) => this.has(p, star));
  sihuaIn = (p: Palace, layer: Layer) => this.layers[layer].filter((s) => s.branch === p.branch);
}

function starLabel(s: { name: string; brightness?: string; sihua?: string | null }) {
  return [term(s.name), s.brightness && vi(s.brightness), s.sihua && `${vi(s.sihua)} sinh niên`].filter(Boolean).join(" ");
}

function palaceLine(v: ChartView, p: Palace) {
  const major = p.major_stars.map(starLabel).join(", ") || "vô chính diệu";
  return `${term(p.name)} ${vi(p.ganzhi)}: ${major}${p.minor_stars.length ? `; ${p.minor_stars.map(starLabel).join(", ")}` : ""}`;
}

export function detectPatterns(r: ChartResult): PatternHit[] {
  const v = new ChartView(r);
  const ming = v.named("命宫");
  const sf = v.sanfang(ming);
  const hits: PatternHit[] = [];
  const add = (name: string, ok: boolean, why: string, full = true) => ok && hits.push({ name, status: full ? "thành cách" : "gần thành cách", why });
  const natal = (type: string) => v.layers.natal.find((s) => s.type === type);
  const strong = (star: string) => {
    const p = v.where(star);
    const b = p?.major_stars.find((s) => s.name === star)?.brightness;
    return b === "庙" || b === "旺";
  };
  const samePalace = (a: string, b: string) => r.chart.palaces.find((p) => v.has(p, a) && v.has(p, b));
  const sfNames = sf.map((p) => vi(p.name)).join(", ");

  for (const [name, a, b] of [["紫府同宫", "紫微", "天府"], ["紫杀同宫", "紫微", "七杀"], ["武府同宫", "武曲", "天府"]] as const) {
    const p = samePalace(a, b);
    if (p) add(name, true, `${vi(a)} và ${vi(b)} cùng ở cung ${vi(p.name)}${sf.includes(p) ? " (thuộc tam phương tứ chính Mệnh)" : ""}`, sf.includes(p));
  }
  const both = v.inGroup(sf, "太阳") && v.inGroup(sf, "太阴");
  add("日月并明", both && strong("太阳") && strong("太阴"), `Thái Dương và Thái Âm đều miếu/vượng và hội vào tam phương tứ chính Mệnh (${sfNames})`);
  const ry = samePalace("太阳", "巨门");
  if (ry) add("日照雷门", true, `Thái Dương và Cự Môn đồng cung tại ${vi(ry.name)}, Thái Dương ${strong("太阳") ? "đắc thế" : "chưa đắc thế"}`, strong("太阳"));
  const chang = v.inGroup(sf, "文昌") || sf.some((p) => v.sihuaIn(p, "natal").some((s) => s.type === "化科"));
  const lu = v.inGroup(sf, "禄存") || sf.some((p) => v.sihuaIn(p, "natal").some((s) => s.type === "化禄"));
  add("阳梁昌禄", v.inGroup(sf, "太阳") && v.inGroup(sf, "天梁") && chang && lu, "Thái Dương, Thiên Lương, Văn Xương/Hóa Khoa, Lộc Tồn/Hóa Lộc cùng hội tam phương tứ chính Mệnh");
  add("机月同梁", ["天机", "太阴", "天同", "天梁"].every((s) => v.inGroup(sf, s)), `Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương phân bố trong ${sfNames}`);
  for (const fire of ["火星", "铃星"]) {
    const t = v.where("贪狼");
    if (!t) continue;
    const [, opp, tri1, tri2] = v.sanfang(t);
    const same = v.has(t, fire);
    const how = same ? "đồng cung" : v.has(opp, fire) ? "xung chiếu" : v.has(tri1, fire) || v.has(tri2, fire) ? "tam hợp chiếu" : "";
    if (how) add(fire === "火星" ? "火贪格" : "铃贪格", true, `Tham Lang tại ${vi(t.name)} ${how} với ${vi(fire)}`, same || sf.includes(t));
  }
  const lucun = v.where("禄存");
  const ma = v.where("天马");
  if (lucun && ma) add("禄马交驰", lucun === ma || (sf.includes(lucun) && sf.includes(ma)), `Lộc Tồn tại ${vi(lucun.name)}, Thiên Mã tại ${vi(ma.name)}`, lucun === ma ? sf.includes(lucun) : true);
  const tri = ["化禄", "化权", "化科"].every((t) => sf.some((p) => p.branch === natal(t)?.branch));
  add("三奇加会", tri, "Hóa Lộc, Hóa Quyền, Hóa Khoa sinh niên đều nằm trong tam phương tứ chính Mệnh");
  add("双禄朝垣", v.inGroup(sf, "禄存") && sf.some((p) => p.branch === natal("化禄")?.branch), "Lộc Tồn và Hóa Lộc sinh niên cùng hội tam phương tứ chính Mệnh");
  if (!ming.major_stars.length) {
    const opp = v.at(v.idx(ming) + 6);
    add("命无正曜", true, `Mệnh vô chính diệu, mượn chính tinh cung Thiên Di: ${opp.major_stars.map((s) => vi(s.name)).join(", ") || "không có"}`);
  }
  const nb = [v.at(v.idx(ming) - 1), v.at(v.idx(ming) + 1)];
  const flank = (a: string, b: string) => (v.has(nb[0], a) && v.has(nb[1], b)) || (v.has(nb[0], b) && v.has(nb[1], a));
  add("羊陀夹命", flank("擎羊", "陀罗"), "Kình Dương và Đà La ở hai cung kẹp Mệnh");
  const kongjie = flank("地空", "地劫");
  const kjSf = v.inGroup(sf, "地空") && v.inGroup(sf, "地劫");
  add("空劫夹命", kongjie || kjSf, kongjie ? "Địa Không và Địa Kiếp kẹp Mệnh" : "Địa Không và Địa Kiếp không kẹp Mệnh mà cùng hội tam phương tứ chính Mệnh, nên chưa đủ điều kiện thành cách, chỉ mang một phần tính chất", kongjie);
  const ji = natal("化忌");
  if (ji && (ji.star === "巨门" || ji.star === "天机")) {
    const p = v.at(BRANCHES.indexOf(ji.branch));
    add("巨机化忌", sf.includes(p), `${vi(ji.star)} Hóa Kỵ sinh niên tại ${vi(p.name)}`, p.name === "命宫" || p.name === "官禄");
  }
  add("廉贞七杀", v.inGroup(sf, "廉贞") && v.inGroup(sf, "七杀"), `Liêm Trinh và Thất Sát cùng hội ${sfNames}`, Boolean(samePalace("廉贞", "七杀")));
  const xiang = v.where("天相");
  if (xiang) {
    const sides = [v.at(v.idx(xiang) - 1), v.at(v.idx(xiang) + 1)];
    const xing = (p: Palace) => v.has(p, "擎羊") || v.has(p, "天刑");
    const hasJi = (p: Palace) => p.branch === ji?.branch;
    add("刑忌夹印", (xing(sides[0]) && hasJi(sides[1])) || (xing(sides[1]) && hasJi(sides[0])), `Thiên Tướng tại ${vi(xiang.name)} bị Kình Dương/Thiên Hình và Hóa Kỵ kẹp hai bên`);
  }
  const spl = ["七杀", "破军", "贪狼"];
  add("杀破狼", spl.every((s) => v.inGroup(sf, s)), `Thất Sát, Phá Quân, Tham Lang phân bố trong ${sfNames}`, spl.some((s) => v.has(ming, s)));
  return hits;
}

function palaceEvidence(v: ChartView, p: Palace): string {
  const out: string[] = [];
  const sf = v.sanfang(p).slice(1);
  const age = `đại hạn ${p.decadal.start_age}-${p.decadal.end_age} tuổi`;
  out.push(`### ${term(p.name)}, ${vi(p.ganzhi)}, ${age}${p.is_shen_gong ? ", Thân cư tại đây" : ""}`);
  out.push(`- Sao trong cung: ${palaceLine(v, p).split(": ").slice(1).join(": ")}${p.adjective_stars.length ? `; tạp diệu: ${p.adjective_stars.map(term).join(", ")}` : ""}`);
  out.push(`- Tam phương tứ chính: đối cung ${palaceLine(v, sf[0])}; tam hợp ${palaceLine(v, sf[1])}; ${palaceLine(v, sf[2])}`);
  if (!p.major_stars.length) out.push(`- Vô chính diệu: mượn chính tinh cung đối diện ${vi(sf[0].name)} (${sf[0].major_stars.map((s) => vi(s.name)).join(", ") || "cũng vô chính diệu"}).`);
  for (const layer of Object.keys(LAYER) as Layer[]) {
    for (const s of v.sihuaIn(p, layer)) {
      const meaning = kbGet<string>(KB.sihuaPalace[s.type as keyof typeof KB.sihuaPalace] as Record<string, string>, p.name);
      out.push(`- ${vi(s.star)} ${vi(s.type)} ${LAYER[layer]} nhập cung này. Tài liệu (${s.type}入${p.name}): ${meaning ?? "không có"}`);
    }
  }
  const natal = v.sihuaIn(p, "natal");
  for (const d of v.sihuaIn(p, "decadal")) {
    for (const n of natal) {
      const key = `本命${n.type} + 大限${d.type}`;
      const m = kbGet<string>(KB.sihuaNotes.stack as Record<string, string>, key);
      if (m) out.push(`- Chồng tứ hóa (${key}): ${m}`);
    }
  }
  const layersJi = (Object.keys(LAYER) as Layer[]).filter((l) => v.sihuaIn(p, l).some((s) => s.type === "化忌"));
  if (layersJi.length >= 2) out.push(`- Hóa Kỵ ${layersJi.map((l) => LAYER[l]).join(" + ")} cùng rơi vào cung này: đây là điểm áp lực trọng tâm.`);

  out.push(`Tài liệu gốc:`);
  const pw = kbGet(KB.wiki as Record<string, { summary: string }>, `cung:${p.name}`);
  if (pw) out.push(`- [Wiki cung ${vi(p.name)}] ${pw.summary}`);
  for (const s of p.major_stars) {
    out.push(`- [${s.name}] ${kbGet<string>(KB.majorStars, s.name) ?? ""}`);
    const w = kbGet(KB.wiki as Record<string, { summary: string; sections: string }>, `sao:${s.name}`);
    if (w) {
      const part = w.sections.split("#### ").find((x) => /cung|vị trí/i.test(x.split("\n")[0]) && !/độ sáng/i.test(x.split("\n")[0]));
      out.push(`- [Wiki ${vi(s.name)}] ${w.summary}${part ? `\n  ${clip(part.replace(/\n+/g, " "), 1500)}` : ""}`);
    }
  }
  for (const s of p.minor_stars) {
    const row = kbGet<string>(KB.minorStars, s.name);
    if (row) out.push(`- [${s.name}] ${row}`);
    const w = kbGet(KB.wiki as Record<string, { summary: string }>, `sao:${s.name}`);
    if (w) out.push(`- [Wiki ${vi(s.name)}] ${w.summary}`);
  }
  return out.join("\n");
}

export function buildEvidence(r: ChartResult): string {
  const v = new ChartView(r);
  const c = r.chart;
  const h = r.horoscope;
  const ming = v.named("命宫");
  const out: string[] = ["# HỒ SƠ CĂN CỨ (đã đối chiếu lá số với tài liệu, dùng làm cơ sở luận giải)", ""];
  out.push("## Thông tin chung");
  out.push(`- ${vi(r.calendar.year_yinyang)} ${vi(r.normalized_input.gender).toLowerCase()}, năm ${vi(r.calendar.year_ganzhi)}, ${vi(c.wuxing_ju.name)}, Mệnh chủ ${term(c.ming_zhu)}, Thân chủ ${term(c.shen_zhu)}, đại hạn ${vi(c.decadal_direction).toLowerCase()}.`);
  out.push(`- Mệnh tại ${vi(ming.ganzhi)}; Thân cư cung ${vi(c.shen_gong.palace)}.`);
  out.push(`- Tứ hóa sinh niên: ${c.year_sihua.map((s) => `${vi(s.star)} ${vi(s.type)} tại ${vi(s.palace)}`).join("; ")}.`);
  for (const t of ["化禄", "化权", "化科", "化忌"] as const) out.push(`- [${t}] ${KB.sihuaMeaning[t]}`);
  if (h?.decadal) {
    out.push(`- Đại hạn hiện tại (${h.nominal_age} tuổi mụ, năm âm lịch ${h.query_lunar_year}): ${h.decadal.start_age}-${h.decadal.end_age} tuổi, tại cung ${vi(h.decadal.natal_palace)} gốc (${vi(h.decadal.ganzhi)}). Tứ hóa đại hạn: ${h.decadal.sihua.map((s) => `${vi(s.star)} ${vi(s.type)} vào ${vi(s.palace)}`).join("; ")}.`);
    out.push(`- Tam phương tứ chính của cung đại hạn: ${v.sanfang(v.named(h.decadal.natal_palace)).map((p) => vi(p.name)).join(", ")}.`);
  }
  if (h?.yearly) out.push(`- Lưu niên ${vi(h.yearly.ganzhi)} (${h.query_lunar_year}): Mệnh lưu niên rơi vào cung ${vi(h.yearly.ming_on_natal_palace)} gốc. Tứ hóa lưu niên: ${h.yearly.sihua.map((s) => `${vi(s.star)} ${vi(s.type)} vào ${vi(s.palace)}`).join("; ")}.`);
  for (const layer of ["natal", "decadal"] as Layer[]) {
    const lu = v.layers[layer].find((s) => s.type === "化禄");
    const ji = v.layers[layer].find((s) => s.type === "化忌");
    if (lu && ji && (BRANCHES.indexOf(lu.branch) + 6) % 12 === BRANCHES.indexOf(ji.branch)) {
      out.push(`- Lộc Kỵ xung ${LAYER[layer]}: Hóa Lộc tại ${vi(lu.palace)}, Hóa Kỵ tại ${vi(ji.palace)}. Tài liệu: ${KB.sihuaNotes.luJiClash}`);
    }
  }
  out.push("", "## Cách cục phát hiện bằng thuật toán");
  const hits = detectPatterns(r);
  if (!hits.length) out.push("- Không có cách cục nào trong tài liệu khớp với lá số. Không được gán cách cục.");
  for (const p of hits) {
    out.push(`- ${patternVi(p.name)} (${p.name}) (${p.status}): ${p.why}.\n  Tài liệu: ${(KB.patterns as Record<string, string>)[Object.keys(KB.patterns).find((k) => k.split(" / ").includes(p.name))!].replace(/\n+/g, " ")}`);
    const w = kbGet(KB.wiki as Record<string, { summary: string; sections: string }>, `cach-cuc:${p.name}`);
    if (w) out.push(`  [Wiki] ${w.summary} ${clip(w.sections.replace(/\n+/g, " "), 1200)}`);
  }
  out.push("", "## 12 cung (thứ tự ưu tiên luận giải)");
  for (const name of CORE_ORDER) out.push(palaceEvidence(v, v.named(name)), "");
  out.push("## Ảnh hưởng của độ sáng (miếu vượng)", KB.brightness);
  return out.join("\n");
}
