"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import ChartGrid from "@/components/ChartGrid";
import ReadingPanel from "@/components/ReadingPanel";
import { useLogin } from "@/components/LoginProvider";
import { useSession } from "@/lib/hooks/useSession";
import { supabase } from "@/lib/supabase/client";
import { TEMP_KEY, type StoredChart, hasAutoRead, readTempChart, requestAutoRead, saveChart, takeAutoRead } from "@/lib/charts";
import { translateWarning, vi } from "@/lib/ziwei/i18n";

export default function ChartPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session, ready } = useSession();
  const { openLogin } = useLogin();
  const isTemp = id === "tam";
  const [chart, setChart] = useState<StoredChart | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing" | "login">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  const autoSaved = useRef(false);

  useEffect(() => {
    if (isTemp) {
      const c = readTempChart();
      setChart(c);
      setStatus(c ? "ok" : "missing");
      return;
    }
    if (!ready) return;
    if (!session) {
      setStatus("login");
      return;
    }
    supabase.from("charts").select("birth, result").eq("id", id).maybeSingle().then(({ data }) => {
      setChart(data as StoredChart | null);
      setStatus(data ? "ok" : "missing");
    });
  }, [id, isTemp, ready, session]);

  useEffect(() => {
    if (!isTemp && session && status === "ok") setAutoStart(takeAutoRead());
  }, [isTemp, session, status]);

  useEffect(() => {
    if (isTemp && session && chart && hasAutoRead() && !autoSaved.current) {
      autoSaved.current = true;
      save();
    }
  });

  async function save(autoRead = true) {
    if (!chart) return;
    if (autoRead) requestAutoRead();
    else takeAutoRead();
    if (!session) return openLogin(autoRead ? "Đăng nhập để AI luận giải lá số này." : "Đăng nhập để lưu lá số.");
    setSaving(true);
    setError("");
    try {
      const newId = await saveChart(session.user.id, chart);
      sessionStorage.removeItem(TEMP_KEY);
      router.replace(`/la-so/${newId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      setSaving(false);
    }
  }

  if (status === "loading") {
    return <main className="mx-auto max-w-5xl px-4 py-8"><div className="aspect-square animate-pulse rounded-2xl bg-paper sm:aspect-[4/3]" /></main>;
  }
  if (status !== "ok" || !chart) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-ink">
          {status === "login" ? "Đăng nhập để xem lá số này" : "Không tìm thấy lá số"}
        </h1>
        <p className="mt-2 text-stone-700">
          {status === "login" ? "Lá số đã lưu chỉ hiển thị với tài khoản của bạn." : "Lá số có thể đã bị xóa hoặc thuộc tài khoản khác."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {status === "login" && (
            <button onClick={() => openLogin()} className="cursor-pointer rounded-xl bg-ink px-5 py-3 font-semibold text-gold hover:bg-ink-soft">Đăng nhập</button>
          )}
          <Link href="/#lap-la-so" className="rounded-xl border border-line bg-paper px-5 py-3 font-semibold text-ink hover:bg-gold/20">Lập lá số mới</Link>
        </div>
      </main>
    );
  }

  const { birth, result } = chart;
  const decadal = result.horoscope?.decadal;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/#lap-la-so" className="inline-flex min-h-9 items-center gap-1 text-sm text-stone-600 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" /> Lập lá số khác
          </Link>
          <h1 className="font-serif text-3xl font-bold text-ink">{birth.name ? `Lá số của ${birth.name}` : "Lá số của bạn"}</h1>
        </div>
        {isTemp && (
          <button onClick={() => save(false)} disabled={saving}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-ink px-5 font-semibold text-gold transition-colors hover:bg-ink-soft disabled:opacity-60">
            <Save size={18} aria-hidden="true" /> {saving ? "Đang lưu..." : "Lưu lá số"}
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <ChartGrid result={result} name={birth.name} />
      <p className="text-xs text-stone-600">
        Bấm vào từng cung để xem chi tiết. Độ sáng: M Miếu · V Vượng · Đ Đắc · L Lợi · B Bình · BĐ Bất Đắc · H Hãm. Tuổi đại hạn tính theo tuổi âm.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {decadal && (
          <div className="rounded-2xl border border-line bg-paper p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gold-deep">Đại hạn hiện tại</h2>
            <p className="mt-1 text-stone-800">
              Cung <b>{vi(decadal.natal_palace)}</b>, {decadal.start_age}-{decadal.end_age} tuổi
            </p>
            <p className="mt-1 text-sm text-stone-600">Tứ hóa: {decadal.sihua.map((s) => `${vi(s.star)} ${vi(s.type)}`).join(", ")}</p>
          </div>
        )}
        {result.horoscope && (
          <div className="rounded-2xl border border-line bg-paper p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gold-deep">Lưu niên {result.horoscope.query_lunar_year}</h2>
            <p className="mt-1 text-stone-800">
              Năm {vi(result.horoscope.yearly.ganzhi)}, {result.horoscope.nominal_age} tuổi âm
            </p>
            <p className="mt-1 text-sm text-stone-600">Tứ hóa: {result.horoscope.yearly.sihua.map((s) => `${vi(s.star)} ${vi(s.type)}`).join(", ")}</p>
          </div>
        )}
      </div>

      {result.warnings.map((w) => (
        <p key={w} className="rounded-xl border border-gold bg-gold/15 p-3 text-sm text-stone-800">{translateWarning(w)}</p>
      ))}

      {!isTemp && session ? (
        <ReadingPanel session={session} chartId={id} autoStart={autoStart} />
      ) : (
        <div className="rounded-2xl bg-ink p-6 text-center text-stone-200 sm:p-8">
          <Sparkles className="mx-auto text-gold" size={28} aria-hidden="true" />
          <h2 className="mt-2 font-serif text-2xl font-bold text-gold">Luận giải lá số bằng AI</h2>
          <p className="mx-auto mt-2 max-w-md">
            {session ? "Lưu lá số để AI luận giải và hỏi thêm." : "Đăng nhập bằng Google để lưu lá số và nhận 3 lượt luận giải miễn phí mỗi ngày."}
          </p>
          <button onClick={() => save()} disabled={saving}
            className="mt-5 h-12 cursor-pointer rounded-xl bg-gold px-6 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60">
            {session ? (saving ? "Đang lưu..." : "Lưu và luận giải") : "Đăng nhập để luận giải"}
          </button>
        </div>
      )}
    </main>
  );
}
