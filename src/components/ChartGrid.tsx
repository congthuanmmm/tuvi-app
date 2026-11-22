import type { ChartResult, Palace, StarRef } from "@/lib/ziwei/types";
import { SIHUA_SHORT, vi, viHan } from "@/lib/ziwei/i18n";

// Vị trí 12 cung trên lưới 4x4 (theo địa chi), bố cục lá số truyền thống
const GRID_POS: Record<string, { row: number; col: number }> = {
  巳: { row: 1, col: 1 }, 午: { row: 1, col: 2 }, 未: { row: 1, col: 3 }, 申: { row: 1, col: 4 },
  辰: { row: 2, col: 1 }, 酉: { row: 2, col: 4 },
  卯: { row: 3, col: 1 }, 戌: { row: 3, col: 4 },
  寅: { row: 4, col: 1 }, 丑: { row: 4, col: 2 }, 子: { row: 4, col: 3 }, 亥: { row: 4, col: 4 },
};

const BRIGHT_SHORT: Record<string, string> = { 庙: "M", 旺: "V", 得地: "Đ", 利: "L", 平: "B", 不得地: "BĐ", 落陷: "H" };

const SIHUA_COLOR: Record<string, string> = {
  化禄: "bg-emerald-700", 化权: "bg-purple-700", 化科: "bg-sky-700", 化忌: "bg-stone-800",
};

function Sihua({ s }: { s?: string | null }) {
  if (!s) return null;
  return <span className={`ml-1 rounded px-1 text-[10px] text-white ${SIHUA_COLOR[s]}`}>{SIHUA_SHORT[s]}</span>;
}

function MajorStar({ star }: { star: StarRef }) {
  return (
    <div className="leading-tight">
      <span className="font-bold text-red-800">{vi(star.name)}</span>
      <span className="ml-1 text-[11px] text-red-900/70">{star.name}</span>
      {star.brightness && <span className="ml-1 text-[10px] text-stone-500">({BRIGHT_SHORT[star.brightness]})</span>}
      <Sihua s={star.sihua} />
    </div>
  );
}

function PalaceCell({ palace, isMing, isDecadal, isYearly }: {
  palace: Palace; isMing: boolean; isDecadal: boolean; isYearly: boolean;
}) {
  const pos = GRID_POS[palace.branch];
  return (
    <div
      style={{ gridRow: pos.row, gridColumn: pos.col }}
      className={`flex min-h-36 flex-col border border-amber-900/40 p-1.5 text-xs sm:min-h-44 ${isMing ? "bg-amber-100" : "bg-amber-50"}`}
      data-testid={`palace-${palace.branch}`}
    >
      <div className="flex-1 space-y-0.5">
        {palace.major_stars.length === 0 && <div className="text-stone-400 italic">Vô chính diệu</div>}
        {palace.major_stars.map((s) => <MajorStar key={s.name} star={s} />)}
        <div className="pt-0.5 text-[11px] leading-snug text-stone-700">
          {palace.minor_stars.map((s) => (
            <span key={s.name} className="mr-1.5 inline-block">
              {vi(s.name)}<Sihua s={s.sihua} />
            </span>
          ))}
        </div>
        <div className="text-[10px] leading-snug text-stone-500">
          {palace.adjective_stars.map((s) => vi(s)).join(" · ")}
        </div>
      </div>
      <div className="mt-1 flex items-end justify-between border-t border-amber-900/20 pt-1">
        <span className="text-[10px] text-stone-500">{vi(palace.stem)} {vi(palace.branch)}</span>
        <span className="text-center">
          <span className="block font-bold uppercase tracking-wide text-red-900">
            {vi(palace.name)}{palace.is_shen_gong && <span className="ml-1 text-[10px] text-amber-700">(Thân)</span>}
          </span>
          <span className="text-[10px] text-stone-500">{palace.name}</span>
        </span>
        <span className="text-right text-[10px] text-stone-600">
          {palace.decadal.start_age}-{palace.decadal.end_age}
          {isDecadal && <span className="block font-semibold text-emerald-800">Đại hạn</span>}
          {isYearly && <span className="block font-semibold text-sky-800">Lưu niên</span>}
        </span>
      </div>
    </div>
  );
}

export default function ChartGrid({ result, name }: { result: ChartResult; name?: string }) {
  const { chart, calendar, normalized_input: input, horoscope } = result;
  return (
    <div className="grid grid-cols-4 grid-rows-4 overflow-hidden rounded-lg border-2 border-red-900 bg-amber-50 shadow-lg">
      {chart.palaces.map((p) => (
        <PalaceCell key={p.branch} palace={p} isMing={p.name === "命宫"}
          isDecadal={horoscope?.decadal?.branch === p.branch} isYearly={horoscope?.yearly.ming_branch === p.branch} />
      ))}
      <div style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}
        className="flex flex-col items-center justify-center gap-1 border border-amber-900/40 bg-gradient-to-b from-red-900 to-red-950 p-3 text-center text-amber-50">
        <div className="text-lg font-bold tracking-wider text-amber-300">LÁ SỐ TỬ VI 紫微斗数</div>
        {name && <div className="text-base font-semibold">{name}</div>}
        <div className="text-xs sm:text-sm">
          {vi(input.gender)} · {vi(calendar.year_yinyang)} {vi(input.gender)} · Năm {vi(calendar.year_ganzhi)}
        </div>
        <div className="text-xs sm:text-sm">Dương lịch: {input.civil_solar_datetime}</div>
        <div className="text-xs sm:text-sm">
          Âm lịch: ngày {calendar.lunar_day} tháng {calendar.is_leap_month ? "nhuận " : ""}{calendar.lunar_month} năm {calendar.lunar_year} · giờ {vi(calendar.hour_branch)}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-left text-xs sm:text-sm">
          <span>Mệnh: {vi(chart.ming_gong.ganzhi)}</span>
          <span>Thân cư: {vi(chart.shen_gong.palace)}</span>
          <span>Cục: {viHan(chart.wuxing_ju.name)}</span>
          <span>Đại hạn: {vi(chart.decadal_direction)}</span>
          <span>Mệnh chủ: {vi(chart.ming_zhu)}</span>
          <span>Thân chủ: {vi(chart.shen_zhu)}</span>
        </div>
        <div className="mt-1 text-xs text-amber-200">
          Tứ hóa năm sinh: {chart.year_sihua.map((s) => `${vi(s.star)} ${SIHUA_SHORT[s.type]}`).join(" · ")}
        </div>
        {horoscope && (
          <div className="text-xs text-amber-200">
            Năm {horoscope.query_lunar_year} ({vi(horoscope.yearly.ganzhi)}), {horoscope.nominal_age} tuổi âm
          </div>
        )}
      </div>
    </div>
  );
}
