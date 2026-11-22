"use client";

import { useState } from "react";
import type { BirthInput } from "@/lib/ziwei/types";

const HOURS = [
  { label: "Tý 子 (23h-1h)", hour: 0 },
  { label: "Sửu 丑 (1h-3h)", hour: 2 },
  { label: "Dần 寅 (3h-5h)", hour: 4 },
  { label: "Mão 卯 (5h-7h)", hour: 6 },
  { label: "Thìn 辰 (7h-9h)", hour: 8 },
  { label: "Tỵ 巳 (9h-11h)", hour: 10 },
  { label: "Ngọ 午 (11h-13h)", hour: 12 },
  { label: "Mùi 未 (13h-15h)", hour: 14 },
  { label: "Thân 申 (15h-17h)", hour: 16 },
  { label: "Dậu 酉 (17h-19h)", hour: 18 },
  { label: "Tuất 戌 (19h-21h)", hour: 20 },
  { label: "Hợi 亥 (21h-23h)", hour: 22 },
];

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-base text-stone-900 transition-colors placeholder:text-stone-400 focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/60";
const labelCls = "mb-1.5 block text-sm font-medium text-stone-800";

function Segmented<T extends string>({ name, value, options, onChange }: {
  name: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-ink/5 p-1">
      {options.map((o) => (
        <label key={o.value}
          className={`flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${value === o.value ? "bg-ink text-white shadow-sm" : "text-stone-700 hover:bg-white/70"}`}>
          <input type="radio" name={name} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export default function BirthForm({
  onSubmit,
  loading,
  serverError,
}: {
  onSubmit: (input: BirthInput) => void;
  loading: boolean;
  serverError?: string;
}) {
  const [name, setName] = useState("");
  const [calendar, setCalendar] = useState<"solar" | "lunar">("solar");
  const [date, setDate] = useState({ day: "", month: "", year: "" });
  const [isLeap, setIsLeap] = useState(false);
  const [timeMode, setTimeMode] = useState<"exact" | "branch">("exact");
  const [time, setTime] = useState("08:00");
  const [branchHour, setBranchHour] = useState(8);
  const [gender, setGender] = useState<"男" | "女">("男");
  const [birthplace, setBirthplace] = useState("");
  const [lateZi, setLateZi] = useState<"next_day" | "same_day">("next_day");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const year = Number(date.year), month = Number(date.month), day = Number(date.day);
    if (!year || !month || !day) {
      setError("Vui lòng nhập đủ ngày, tháng, năm sinh.");
      return;
    }
    let hour = branchHour, minute = 0;
    if (timeMode === "exact") {
      const [h, m] = time.split(":").map(Number);
      if (!time || Number.isNaN(h)) {
        setError("Vui lòng nhập giờ sinh.");
        return;
      }
      hour = h;
      minute = m || 0;
    }
    setError("");
    onSubmit({
      calendar_type: calendar,
      birth_time: { year, month, day, hour, minute, is_leap_month: calendar === "lunar" && isLeap },
      gender,
      late_zi_rule: lateZi,
      name: name.trim() || undefined,
      birthplace: birthplace.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor="bf-name" className={labelCls}>Họ tên <span className="font-normal text-stone-500">(không bắt buộc)</span></label>
        <input id="bf-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" />
      </div>

      <div>
        <span className={labelCls}>Lịch</span>
        <Segmented name="Loại lịch" value={calendar} onChange={setCalendar}
          options={[{ value: "solar", label: "Dương lịch" }, { value: "lunar", label: "Âm lịch" }]} />
      </div>

      <fieldset>
        <legend className={labelCls}>Ngày sinh</legend>
        <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
          <input className={inputCls} inputMode="numeric" placeholder="Ngày" aria-label="Ngày sinh" maxLength={2} value={date.day}
            onChange={(e) => setDate({ ...date, day: e.target.value.replace(/\D/g, "") })} />
          <input className={inputCls} inputMode="numeric" placeholder="Tháng" aria-label="Tháng sinh" maxLength={2} value={date.month}
            onChange={(e) => setDate({ ...date, month: e.target.value.replace(/\D/g, "") })} />
          <input className={inputCls} inputMode="numeric" placeholder="Năm" aria-label="Năm sinh" maxLength={4} value={date.year}
            onChange={(e) => setDate({ ...date, year: e.target.value.replace(/\D/g, "") })} />
        </div>
        {calendar === "lunar" && (
          <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={isLeap} onChange={(e) => setIsLeap(e.target.checked)} />
            Sinh vào tháng nhuận
          </label>
        )}
      </fieldset>

      <div>
        <span className={labelCls}>Giờ sinh</span>
        <Segmented name="Cách nhập giờ" value={timeMode} onChange={setTimeMode}
          options={[{ value: "exact", label: "Giờ chính xác" }, { value: "branch", label: "Theo canh giờ" }]} />
        <div className="mt-2">
          {timeMode === "exact" ? (
            <input type="time" className={inputCls} aria-label="Giờ sinh" value={time} onChange={(e) => setTime(e.target.value)} />
          ) : (
            <select className={inputCls} aria-label="Canh giờ" value={branchHour} onChange={(e) => setBranchHour(Number(e.target.value))}>
              {HOURS.map((h) => (
                <option key={h.hour} value={h.hour}>{h.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className={labelCls}>Giới tính</span>
          <Segmented name="Giới tính" value={gender} onChange={setGender}
            options={[{ value: "男", label: "Nam" }, { value: "女", label: "Nữ" }]} />
        </div>
        <div>
          <label htmlFor="bf-place" className={labelCls}>Nơi sinh</label>
          <input id="bf-place" className={`${inputCls} h-11`} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="Hà Nội" />
        </div>
      </div>

      <details className="group text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-medium text-gold-deep">Tùy chọn nâng cao</summary>
        <div className="space-y-1 rounded-lg bg-ink/5 p-3">
          <p className="font-medium">Sinh từ 23h đến 24h (giờ Tý muộn):</p>
          <label className="flex min-h-9 cursor-pointer items-center gap-2">
            <input type="radio" name="late-zi" className="accent-ink" checked={lateZi === "next_day"} onChange={() => setLateZi("next_day")} />
            Tính sang ngày hôm sau (mặc định)
          </label>
          <label className="flex min-h-9 cursor-pointer items-center gap-2">
            <input type="radio" name="late-zi" className="accent-ink" checked={lateZi === "same_day"} onChange={() => setLateZi("same_day")} />
            Giữ ngày hiện tại
          </label>
        </div>
      </details>

      {(error || serverError) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error || serverError}</p>}

      <button type="submit" disabled={loading}
        className="h-12 w-full cursor-pointer rounded-xl bg-ink px-4 text-base font-semibold text-gold shadow-md transition-colors hover:bg-ink-soft disabled:cursor-wait disabled:opacity-70">
        {loading ? "Đang lập lá số..." : "Lập lá số miễn phí"}
      </button>
    </form>
  );
}
