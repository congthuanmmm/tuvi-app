"use client";

import { useState } from "react";
import BirthForm from "@/components/BirthForm";
import ChartGrid from "@/components/ChartGrid";
import { translateWarning, vi } from "@/lib/ziwei/i18n";
import type { BirthInput, ChartResult } from "@/lib/ziwei/types";

export default function Home() {
  const [result, setResult] = useState<ChartResult | null>(null);
  const [input, setInput] = useState<BirthInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(birth: BirthInput) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birth),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lập được lá số");
      setResult(data);
      setInput(birth);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  const decadal = result?.horoscope?.decadal;

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-red-900 sm:text-4xl">Tử Vi Đẩu Số <span className="text-2xl">紫微斗数</span></h1>
        <p className="mt-1 text-stone-600">Lập lá số theo phái Tam Hợp, luận giải bằng AI</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <BirthForm onSubmit={handleSubmit} loading={loading} />
          {error && <p className="mt-3 rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</p>}
        </aside>

        <section>
          {result ? (
            <div className="space-y-3">
              <ChartGrid result={result} name={input?.name} />
              {decadal && (
                <p className="text-sm text-stone-700">
                  Đại hạn hiện tại: cung <b>{vi(decadal.natal_palace)}</b> ({decadal.start_age}-{decadal.end_age} tuổi), tứ hóa đại hạn:{" "}
                  {decadal.sihua.map((s) => `${vi(s.star)} ${vi(s.type)}`).join(", ")}.
                </p>
              )}
              {result.warnings.map((w) => (
                <p key={w} className="rounded-md border border-amber-400 bg-amber-100 p-2 text-sm text-amber-900">
                  {translateWarning(w)}
                </p>
              ))}
              <p className="text-xs text-stone-500">
                Ký hiệu độ sáng: M Miếu · V Vượng · Đ Đắc · L Lợi · B Bình · BĐ Bất Đắc · H Hãm. Tuổi đại hạn tính theo tuổi âm.
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-xl border-2 border-dashed border-amber-900/30 p-8 text-center text-stone-500">
              Nhập thông tin ngày giờ sinh để lập lá số.
            </div>
          )}
        </section>
      </div>

      <footer className="mt-10 text-center text-xs text-stone-500">
        Lá số chỉ mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.
      </footer>
    </main>
  );
}
