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
  "w-full rounded-md border border-amber-900/40 bg-white/80 px-3 py-2 text-stone-900 focus:border-amber-700 focus:outline-none";

export default function BirthForm({
  onSubmit,
  loading,
}: {
  onSubmit: (input: BirthInput) => void;
  loading: boolean;
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
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-amber-900/30 bg-amber-50/90 p-5 shadow-md">
      <div>
        <label className="mb-1 block text-sm font-medium">Họ tên (không bắt buộc)</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
      </div>

      <div>
        <div className="mb-1 flex items-center gap-4 text-sm font-medium">
          <span>Ngày sinh</span>
          {(["solar", "lunar"] as const).map((c) => (
            <label key={c} className="flex items-center gap-1 font-normal">
              <input type="radio" checked={calendar === c} onChange={() => setCalendar(c)} />
              {c === "solar" ? "Dương lịch" : "Âm lịch"}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input className={inputCls} inputMode="numeric" placeholder="Ngày" aria-label="Ngày" value={date.day}
            onChange={(e) => setDate({ ...date, day: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Tháng" aria-label="Tháng" value={date.month}
            onChange={(e) => setDate({ ...date, month: e.target.value })} />
          <input className={inputCls} inputMode="numeric" placeholder="Năm" aria-label="Năm" value={date.year}
            onChange={(e) => setDate({ ...date, year: e.target.value })} />
        </div>
        {calendar === "lunar" && (
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isLeap} onChange={(e) => setIsLeap(e.target.checked)} />
            Tháng nhuận
          </label>
        )}
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
          <span className="w-full">Giờ sinh</span>
          <label className="flex items-center gap-1 font-normal">
            <input type="radio" checked={timeMode === "exact"} onChange={() => setTimeMode("exact")} /> Giờ chính xác
          </label>
          <label className="flex items-center gap-1 font-normal">
            <input type="radio" checked={timeMode === "branch"} onChange={() => setTimeMode("branch")} /> Theo canh giờ
          </label>
        </div>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Giới tính</label>
          <select className={inputCls} aria-label="Giới tính" value={gender} onChange={(e) => setGender(e.target.value as "男" | "女")}>
            <option value="男">Nam</option>
            <option value="女">Nữ</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nơi sinh</label>
          <input className={inputCls} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="Hà Nội" />
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-amber-900">Tùy chọn nâng cao</summary>
        <div className="mt-2 space-y-1">
          <p className="font-medium">Sinh từ 23h đến 24h (giờ Tý muộn):</p>
          <label className="flex items-center gap-2">
            <input type="radio" checked={lateZi === "next_day"} onChange={() => setLateZi("next_day")} />
            Tính sang ngày hôm sau (mặc định)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={lateZi === "same_day"} onChange={() => setLateZi("same_day")} />
            Giữ ngày hiện tại
          </label>
        </div>
      </details>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full rounded-md bg-red-800 px-4 py-2.5 font-semibold text-amber-50 hover:bg-red-900 disabled:opacity-60">
        {loading ? "Đang lập lá số..." : "Lập lá số"}
      </button>
    </form>
  );
}
