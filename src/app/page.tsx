"use client";

import { useCallback, useEffect, useState } from "react";
import AuthBar from "@/components/AuthBar";
import BirthForm from "@/components/BirthForm";
import ChartGrid from "@/components/ChartGrid";
import HistoryList, { type SavedChart } from "@/components/HistoryList";
import ReadingPanel from "@/components/ReadingPanel";
import { useSession } from "@/lib/hooks/useSession";
import { supabase } from "@/lib/supabase/client";
import { translateWarning, vi } from "@/lib/ziwei/i18n";
import type { BirthInput, ChartResult } from "@/lib/ziwei/types";

export default function Home() {
  const [result, setResult] = useState<ChartResult | null>(null);
  const [input, setInput] = useState<BirthInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { session } = useSession();
  const userId = session?.user.id;
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [chartId, setChartId] = useState<string | null>(null);

  const loadCharts = useCallback(async () => {
    if (!userId) return setCharts([]);
    const { data } = await supabase
      .from("charts").select("id, label, birth, created_at").order("created_at", { ascending: false }).limit(50);
    setCharts((data as SavedChart[]) ?? []);
  }, [userId]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  async function saveChart(birth: BirthInput, data: ChartResult): Promise<string | null> {
    if (!userId) return null;
    const { data: row, error } = await supabase
      .from("charts").insert({ user_id: userId, label: birth.name ?? null, birth, result: data }).select("id").single();
    if (error) {
      setError(`Không lưu được lá số: ${error.message}`);
      return null;
    }
    loadCharts();
    return row.id;
  }

  async function openChart(id: string) {
    const { data } = await supabase.from("charts").select("id, birth, result").eq("id", id).single();
    if (!data) return;
    setResult(data.result);
    setInput(data.birth);
    setChartId(data.id);
  }

  async function deleteChart(id: string) {
    if (!confirm("Xóa lá số này và các luận giải đi kèm?")) return;
    await supabase.from("charts").delete().eq("id", id);
    if (id === chartId) setChartId(null);
    loadCharts();
  }

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
      setChartId(await saveChart(birth, data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  const decadal = result?.horoscope?.decadal;

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6">
      <AuthBar session={session} />
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-red-900 sm:text-4xl">Tử Vi Đẩu Số <span className="text-2xl">紫微斗数</span></h1>
        <p className="mt-1 text-stone-600">Lập lá số theo phái Tam Hợp, luận giải bằng AI</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <BirthForm onSubmit={handleSubmit} loading={loading} />
          {error && <p className="mt-3 rounded-md bg-red-100 p-3 text-sm text-red-800">{error}</p>}
          <HistoryList charts={charts} activeId={chartId} onOpen={openChart} onDelete={deleteChart} />
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
              <ReadingPanel session={session} chartId={chartId} />
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
