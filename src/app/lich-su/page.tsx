"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useLogin } from "@/components/LoginProvider";
import { useSession } from "@/lib/hooks/useSession";
import { supabase } from "@/lib/supabase/client";
import type { BirthInput } from "@/lib/ziwei/types";

interface Row { id: string; label: string | null; birth: BirthInput; created_at: string }

const pad = (n: number) => String(n).padStart(2, "0");

export default function HistoryPage() {
  const { session, ready } = useSession();
  const { openLogin } = useLogin();
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("charts").select("id, label, birth, created_at").order("created_at", { ascending: false }).limit(100);
    setRows((data as Row[]) ?? []);
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  async function remove(r: Row) {
    if (!confirm(`Xóa lá số "${r.label || "Không tên"}" và các luận giải đi kèm?`)) return;
    await supabase.from("charts").delete().eq("id", r.id);
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-ink">Lá số của tôi</h1>
        <Link href="/#lap-la-so" className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-gold hover:bg-ink-soft">
          <Plus size={18} aria-hidden="true" /> Lập lá số
        </Link>
      </div>

      {ready && !session && (
        <div className="mt-8 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="text-stone-700">Đăng nhập để xem các lá số đã lưu.</p>
          <button onClick={() => openLogin()} className="mt-4 cursor-pointer rounded-xl bg-ink px-5 py-3 font-semibold text-gold hover:bg-ink-soft">Đăng nhập</button>
        </div>
      )}

      {session && rows === null && <div className="mt-8 h-40 animate-pulse rounded-2xl bg-paper" aria-label="Đang tải" />}

      {session && rows?.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-paper p-8 text-center text-stone-700">
          Bạn chưa lưu lá số nào.
        </div>
      )}

      {session && rows && rows.length > 0 && (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
          {rows.map((r) => {
            const b = r.birth.birth_time;
            return (
              <li key={r.id} className="flex items-center">
                <Link href={`/la-so/${r.id}`} className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-gold/15">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-serif font-bold text-gold">
                    {(r.label || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{r.label || "Không tên"}</span>
                    <span className="block text-sm text-stone-600">
                      {pad(b.day)}/{pad(b.month)}/{b.year} {pad(b.hour)}:{pad(b.minute)}
                      {r.birth.calendar_type === "lunar" ? " (âm lịch)" : ""} · {r.birth.gender === "男" ? "Nam" : "Nữ"}
                    </span>
                  </span>
                  <ChevronRight size={18} className="text-stone-400" aria-hidden="true" />
                </Link>
                <button onClick={() => remove(r)} aria-label={`Xóa lá số ${r.label || "Không tên"}`}
                  className="mr-2 grid h-11 w-11 cursor-pointer place-items-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
