"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, X } from "lucide-react";
import type { ChartResult, Palace, StarRef } from "@/lib/ziwei/types";
import { SIHUA_SHORT, vi, viHan } from "@/lib/ziwei/i18n";
import { PALACE_MEANING } from "@/lib/ziwei/palaces";
import { entryByHan, wikiPath } from "@/lib/wiki/catalog";

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
  return <span className={`ml-1 rounded px-1 text-[10px] font-medium text-white ${SIHUA_COLOR[s]}`}>{SIHUA_SHORT[s]}</span>;
}

function MajorStar({ star }: { star: StarRef }) {
  return (
    <div className="leading-tight">
      <span className="font-bold text-ink">{vi(star.name)}</span>
      <span className="ml-1 hidden text-[11px] text-ink/60 sm:inline">{star.name}</span>
      {star.brightness && <span className="ml-1 text-[10px] text-stone-500">({BRIGHT_SHORT[star.brightness]})</span>}
      <Sihua s={star.sihua} />
    </div>
  );
}

interface CellFlags { isMing: boolean; isDecadal: boolean; isYearly: boolean }

function PalaceCell({ palace, flags, onSelect }: { palace: Palace; flags: CellFlags; onSelect: () => void }) {
  const pos = GRID_POS[palace.branch];
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ gridRow: pos.row, gridColumn: pos.col }}
      aria-label={`Cung ${vi(palace.name)}, xem chi tiết`}
      className={`flex min-h-28 cursor-pointer flex-col border border-line p-1 text-left text-[11px] transition-colors hover:bg-gold/15 sm:min-h-44 sm:p-1.5 sm:text-xs ${flags.isMing ? "bg-gold/20" : "bg-paper"}`}
      data-testid={`palace-${palace.branch}`}
    >
      <div className="flex-1 space-y-0.5">
        {palace.major_stars.length === 0 && <div className="italic text-stone-400">Vô chính diệu</div>}
        {palace.major_stars.map((s) => <MajorStar key={s.name} star={s} />)}
        <div className="hidden pt-0.5 text-[11px] leading-snug text-stone-700 sm:block">
          {palace.minor_stars.map((s) => (
            <span key={s.name} className="mr-1.5 inline-block">{vi(s.name)}<Sihua s={s.sihua} /></span>
          ))}
        </div>
        <div className="hidden text-[10px] leading-snug text-stone-500 sm:block">
          {palace.adjective_stars.map((s) => vi(s)).join(" · ")}
        </div>
      </div>
      <div className="mt-1 border-t border-line pt-1 sm:flex sm:items-end sm:justify-between">
        <span className="hidden text-[10px] text-stone-500 sm:inline">{vi(palace.stem)} {vi(palace.branch)}</span>
        <span className="block text-center">
          <span className="block font-bold uppercase tracking-wide text-ink">
            {vi(palace.name)}{palace.is_shen_gong && <span className="ml-1 text-[10px] text-gold-deep">(Thân)</span>}
          </span>
          <span className="hidden text-[10px] text-stone-500 sm:inline">{palace.name}</span>
        </span>
        <span className="block text-center text-[10px] text-stone-600 sm:text-right">
          {palace.decadal.start_age}-{palace.decadal.end_age}
          {flags.isDecadal && <span className="block font-semibold text-emerald-800">Đại hạn</span>}
          {flags.isYearly && <span className="block font-semibold text-sky-800">Lưu niên</span>}
        </span>
      </div>
    </button>
  );
}

function StarName({ han }: { han: string }) {
  const entry = entryByHan(han);
  if (!entry) return <span className="font-semibold text-ink">{vi(han)}</span>;
  return (
    <Link href={wikiPath(entry)} className="font-semibold text-ink underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep">
      {vi(han)}
    </Link>
  );
}

function StarLine({ star }: { star: StarRef }) {
  return (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <span>
        <StarName han={star.name} /> <span className="text-stone-500">{star.name}</span>
        <Sihua s={star.sihua} />
      </span>
      {star.brightness && <span className="text-sm text-stone-600">{vi(star.brightness)}</span>}
    </li>
  );
}

function PalaceSheet({ palace, flags, onClose }: { palace: Palace | null; flags: CellFlags | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (palace && !d.open) d.showModal();
    if (!palace && d.open) d.close();
  }, [palace]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="palace-title"
      className="mx-auto mb-0 mt-auto max-h-[85vh] w-full max-w-lg rounded-t-2xl bg-paper p-0 text-foreground shadow-2xl sm:m-auto sm:rounded-2xl"
    >
      {palace && flags && (
        <div className="p-5">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stone-300 sm:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="palace-title" className="font-serif text-2xl font-bold text-ink">
                Cung {vi(palace.name)} <span className="text-lg font-normal text-stone-500">{palace.name}</span>
              </h2>
              <p className="mt-0.5 text-sm text-stone-600">{PALACE_MEANING[palace.name]}</p>
              {entryByHan(palace.name) && (
                <Link href={wikiPath(entryByHan(palace.name)!)}
                  className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline decoration-gold-deep/50 underline-offset-4 hover:decoration-gold-deep">
                  <BookOpen size={16} aria-hidden="true" /> Ý nghĩa cung {vi(palace.name)} trong Wiki tử vi
                </Link>
              )}
            </div>
            <button onClick={onClose} aria-label="Đóng"
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-200/60">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-ink/5 px-2.5 py-1">{vi(palace.stem)} {vi(palace.branch)} ({palace.ganzhi})</span>
            <span className="rounded-full bg-ink/5 px-2.5 py-1">Đại hạn {palace.decadal.start_age}-{palace.decadal.end_age} tuổi</span>
            {palace.is_shen_gong && <span className="rounded-full bg-gold/30 px-2.5 py-1">Thân cư</span>}
            {flags.isDecadal && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-900">Đại hạn hiện tại</span>}
            {flags.isYearly && <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-900">Lưu niên năm nay</span>}
          </div>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gold-deep">Chính tinh</h3>
          {palace.major_stars.length ? (
            <ul className="divide-y divide-line">{palace.major_stars.map((s) => <StarLine key={s.name} star={s} />)}</ul>
          ) : (
            <p className="py-1.5 text-stone-600">Vô chính diệu (không có chính tinh)</p>
          )}
          {palace.minor_stars.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-gold-deep">Phụ tinh</h3>
              <ul className="divide-y divide-line">{palace.minor_stars.map((s) => <StarLine key={s.name} star={s} />)}</ul>
            </>
          )}
          {palace.adjective_stars.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-gold-deep">Tạp diệu</h3>
              <p className="py-1.5 text-stone-700">{palace.adjective_stars.map((s) => viHan(s)).join(" · ")}</p>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

export default function ChartGrid({ result, name }: { result: ChartResult; name?: string }) {
  const { chart, calendar, normalized_input: input, horoscope } = result;
  const [selected, setSelected] = useState<string | null>(null);
  const flagsOf = (p: Palace): CellFlags => ({
    isMing: p.name === "命宫",
    isDecadal: horoscope?.decadal?.branch === p.branch,
    isYearly: horoscope?.yearly.ming_branch === p.branch,
  });
  const selectedPalace = chart.palaces.find((p) => p.branch === selected) ?? null;

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-4 overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-xl">
        {chart.palaces.map((p) => (
          <PalaceCell key={p.branch} palace={p} flags={flagsOf(p)} onSelect={() => setSelected(p.branch)} />
        ))}
        <div style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}
          className="flex flex-col items-center justify-center gap-0.5 border border-line bg-ink p-2 text-center text-[11px] text-stone-200 sm:gap-1 sm:p-4 sm:text-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={36} height={36} className="hidden rounded-md sm:block" />
          <div className="font-serif text-sm font-bold tracking-wider text-gold sm:text-lg">LÁ SỐ TỬ VI</div>
          {name && <div className="text-xs font-semibold text-white sm:text-base">{name}</div>}
          <div>{vi(calendar.year_yinyang)} {vi(input.gender)} · {vi(calendar.year_ganzhi)}</div>
          <div className="hidden sm:block">Dương lịch: {input.civil_solar_datetime}</div>
          <div>
            Âm lịch: {calendar.lunar_day}/{calendar.is_leap_month ? "nhuận " : ""}{calendar.lunar_month}/{calendar.lunar_year} · giờ {vi(calendar.hour_branch)}
          </div>
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-0.5 text-left sm:grid-cols-2">
            <span>Mệnh: {vi(chart.ming_gong.ganzhi)}</span>
            <span>Cục: {viHan(chart.wuxing_ju.name)}</span>
            <span className="hidden sm:inline">Thân cư: {vi(chart.shen_gong.palace)}</span>
            <span className="hidden sm:inline">Đại hạn: {vi(chart.decadal_direction)}</span>
            <span className="hidden sm:inline">Mệnh chủ: {vi(chart.ming_zhu)}</span>
            <span className="hidden sm:inline">Thân chủ: {vi(chart.shen_zhu)}</span>
          </div>
          <div className="mt-1 hidden text-gold/90 sm:block">
            Tứ hóa: {chart.year_sihua.map((s) => `${vi(s.star)} ${SIHUA_SHORT[s.type]}`).join(" · ")}
          </div>
        </div>
      </div>
      <PalaceSheet palace={selectedPalace} flags={selectedPalace && flagsOf(selectedPalace)} onClose={() => setSelected(null)} />
    </>
  );
}
