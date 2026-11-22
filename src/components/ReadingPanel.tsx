"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { vnToday } from "@/lib/hooks/useSession";

const LIMIT = 3;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function ReadingPanel({ session, chartId }: { session: Session | null; chartId: string | null }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [used, setUsed] = useState(0);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setError("");
    if (!session || !chartId) return;
    supabase
      .from("messages").select("role, content").eq("chart_id", chartId).order("id")
      .then(({ data }) => setMessages((data as Msg[]) ?? []));
  }, [session, chartId]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("ai_usage").select("count").eq("user_id", session.user.id).eq("day", vnToday()).maybeSingle()
      .then(({ data }) => setUsed(data?.count ?? 0));
  }, [session, chartId]);

  useEffect(() => {
    if (messages.length > 1) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!session) {
    return (
      <div className="rounded-xl border border-amber-900/30 bg-amber-50/90 p-4 text-sm shadow-md">
        <b>Luận giải bằng AI:</b> đăng nhập để được {LIMIT} lượt miễn phí mỗi ngày.
      </div>
    );
  }
  if (!chartId) return null;

  async function ask(q?: string) {
    setBusy(true);
    setError("");
    if (q) setMessages((m) => [...m, { role: "user", content: q }]);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session!.access_token}` },
        body: JSON.stringify({ chart_id: chartId, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");
      setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
      setUsed(data.used);
      setQuestion("");
    } catch (e) {
      if (q) setMessages((m) => m.slice(0, -1));
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setBusy(false);
    }
  }

  const left = Math.max(LIMIT - used, 0);

  return (
    <div className="space-y-3 rounded-xl border border-amber-900/30 bg-amber-50/90 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-red-900">Luận giải AI</h2>
        <span className="text-sm text-stone-600">Còn {left}/{LIMIT} lượt hôm nay</span>
      </div>

      {messages.length === 0 && (
        <button
          className="rounded-md bg-red-800 px-4 py-2 font-medium text-white hover:bg-red-900 disabled:opacity-50"
          disabled={busy || left === 0}
          onClick={() => ask()}
        >
          {busy ? "Đang luận giải (khoảng 20-40 giây)..." : "Luận giải lá số (1 lượt)"}
        </button>
      )}

      {messages.map((m, i) =>
        m.role === "assistant" ? (
          <article key={i} className="prose-reading text-[15px] leading-relaxed">
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </article>
        ) : (
          <p key={i} className="ml-auto max-w-[85%] rounded-lg bg-red-800/90 px-3 py-2 text-white">
            {m.content}
          </p>
        ),
      )}

      {messages.length > 0 && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) ask(question.trim());
          }}
        >
          <input
            className="min-w-0 flex-1 rounded-md border border-amber-900/30 bg-white px-3 py-2"
            placeholder="Hỏi thêm về lá số, ví dụ: năm nay có nên đổi việc?"
            maxLength={500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={busy}
          />
          <button className="rounded-md bg-red-800 px-3 py-2 text-white hover:bg-red-900 disabled:opacity-50" disabled={busy || left === 0 || !question.trim()}>
            {busy ? "..." : "Hỏi (1 lượt)"}
          </button>
        </form>
      )}
      {error && <p className="rounded-md bg-red-100 p-2 text-sm text-red-800">{error}</p>}
      <div ref={bottomRef} />
    </div>
  );
}
