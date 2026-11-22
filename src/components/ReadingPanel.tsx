"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { vnToday } from "@/lib/hooks/useSession";
import Reveal from "@/components/Reveal";

const LIMIT = 3;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Section { id: string; title: string; body: string }

function splitSections(md: string): { intro: string; sections: Section[] } {
  const parts = md.split(/^##\s+/m);
  const intro = parts[0].trim();
  const sections = parts.slice(1).map((p, i) => {
    const nl = p.indexOf("\n");
    const title = (nl === -1 ? p : p.slice(0, nl)).trim();
    return { id: `muc-${i + 1}`, title, body: nl === -1 ? "" : p.slice(nl + 1).trim() };
  });
  return { intro, sections };
}

function Reading({ content }: { content: string }) {
  const { intro, sections } = splitSections(content);
  if (!sections.length) {
    return <article className="prose-reading rounded-2xl border border-line bg-paper p-5 leading-relaxed"><ReactMarkdown>{content}</ReactMarkdown></article>;
  }
  return (
    <div className="space-y-4">
      <nav aria-label="Mục lục luận giải" className="sticky top-16 z-10 -mx-4 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur">
        <ul className="flex gap-2 whitespace-nowrap">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="inline-flex min-h-9 items-center rounded-full border border-line bg-paper px-3 text-sm text-ink transition-colors hover:bg-gold/30">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {intro && <div className="prose-reading leading-relaxed text-stone-700"><ReactMarkdown>{intro}</ReactMarkdown></div>}
      {sections.map((s) => (
        <Reveal as="section" key={s.id} className="scroll-mt-32 rounded-2xl border border-line bg-paper p-5">
          <span id={s.id} className="block scroll-mt-32" aria-hidden="true" />
          <h3 className="font-serif text-xl font-bold text-ink">{s.title}</h3>
          <div className="prose-reading mt-2 text-[15px] leading-relaxed"><ReactMarkdown>{s.body}</ReactMarkdown></div>
        </Reveal>
      ))}
    </div>
  );
}

export default function ReadingPanel({ session, chartId }: { session: Session; chartId: string }) {
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [used, setUsed] = useState(0);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("messages").select("role, content").eq("chart_id", chartId).order("id")
      .then(({ data }) => setMessages((data as Msg[]) ?? []));
    supabase
      .from("ai_usage").select("count").eq("user_id", session.user.id).eq("day", vnToday()).maybeSingle()
      .then(({ data }) => setUsed(data?.count ?? 0));
  }, [session.user.id, chartId]);

  useEffect(() => {
    if (messages && messages.length > 1) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function ask(q?: string) {
    setBusy(true);
    setError("");
    if (q) setMessages((m) => [...(m ?? []), { role: "user", content: q }]);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ chart_id: chartId, question: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
      setMessages((m) => [...(m ?? []), { role: "assistant", content: data.answer }]);
      setUsed(data.used);
      setQuestion("");
    } catch (e) {
      if (q) setMessages((m) => (m ?? []).slice(0, -1));
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  const left = Math.max(LIMIT - used, 0);
  const [first, ...chat] = messages ?? [];

  return (
    <section aria-labelledby="reading-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="reading-title" className="font-serif text-2xl font-bold text-ink">Luận giải AI</h2>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-sm text-stone-700">Còn {left}/{LIMIT} lượt hôm nay</span>
      </div>

      {messages === null && <div className="h-32 animate-pulse rounded-2xl bg-paper" aria-label="Đang tải" />}

      {messages?.length === 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 text-center">
          <Sparkles className="mx-auto text-gold-deep" size={28} aria-hidden="true" />
          <p className="mt-2 text-stone-700">AI sẽ phân tích tổng quan, tính cách, sự nghiệp, tình cảm, tài lộc và đại hạn hiện tại.</p>
          <button
            className="mt-4 h-12 cursor-pointer rounded-xl bg-ink px-6 font-semibold text-gold transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy || left === 0}
            onClick={() => ask()}
          >
            {busy ? "Đang luận giải, khoảng 20-40 giây..." : "Luận giải lá số (1 lượt)"}
          </button>
          {busy && <p className="mt-3 text-sm text-stone-500" role="status">Vui lòng không đóng trang.</p>}
        </div>
      )}

      {first && <Reading content={first.content} />}

      {first && (
        <div className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
          <h3 className="font-semibold text-ink">Hỏi thêm về lá số</h3>
          <div className="mt-3 space-y-3" aria-live="polite">
            {chat.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2 text-white">{m.content}</p>
              ) : (
                <div key={i} className="prose-reading max-w-[95%] rounded-2xl rounded-bl-sm bg-background/70 px-4 py-2 text-[15px] leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ),
            )}
            {busy && <p className="w-fit animate-pulse rounded-2xl bg-background/70 px-4 py-2 text-stone-500" role="status">Đang trả lời...</p>}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) ask(question.trim());
            }}
          >
            <label htmlFor="ask-input" className="sr-only">Câu hỏi</label>
            <input
              id="ask-input"
              className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-base focus:border-ink focus:outline-none focus:ring-2 focus:ring-gold/60"
              placeholder="Ví dụ: năm nay có nên đổi việc?"
              maxLength={500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={busy}
            />
            <button aria-label="Gửi câu hỏi (1 lượt)" title="Gửi (1 lượt)"
              className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-xl bg-ink text-gold transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || left === 0 || !question.trim()}>
              <Send size={20} />
            </button>
          </form>
          <p className="mt-2 text-xs text-stone-500">Mỗi câu hỏi dùng 1 lượt.</p>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div ref={bottomRef} />
    </section>
  );
}
