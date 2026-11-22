"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Download, Search } from "lucide-react";
import { useLogin } from "@/components/LoginProvider";
import { useSession, vnToday } from "@/lib/hooks/useSession";

interface UserRow {
  id: string;
  email: string | null;
  created_at: string;
  ai_used_total: number;
  ai_used_today: number;
  charts: number;
}

type SortKey = "created_at" | "ai_used_total";

const vnDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso));
const fmtDate = (iso: string) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
};

function downloadCsv(rows: UserRow[]) {
  const head = ["email", "ngay_dang_ky", "luot_ai_hom_nay", "tong_luot_ai", "so_la_so"];
  const lines = rows.map((r) => [r.email ?? "", r.created_at, r.ai_used_today, r.ai_used_total, r.charts]
    .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const blob = new Blob(["\uFEFF" + [head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `nguoi-dung-${vnToday()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AdminPage() {
  const { session, ready } = useSession();
  const { openLogin } = useLogin();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("created_at");

  useEffect(() => {
    if (!session) {
      setUsers(null);
      return;
    }
    fetch("/api/admin", { headers: { Authorization: `Bearer ${session.access_token}` } }).then(async (res) => {
      if (res.status === 404) return setDenied(true);
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Có lỗi xảy ra");
      setUsers(data.users);
    }).catch(() => setError("Không tải được dữ liệu, vui lòng thử lại"));
  }, [session]);

  const stats = useMemo(() => {
    if (!users) return null;
    const today = vnToday();
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return [
      { label: "Người dùng", value: users.length },
      { label: "Đăng ký hôm nay", value: users.filter((u) => vnDay(u.created_at) === today).length },
      { label: "Đăng ký 7 ngày", value: users.filter((u) => new Date(u.created_at).getTime() >= weekAgo).length },
      { label: "Lượt AI hôm nay", value: users.reduce((s, u) => s + u.ai_used_today, 0) },
      { label: "Tổng lượt AI", value: users.reduce((s, u) => s + u.ai_used_total, 0) },
      { label: "Lá số đã lưu", value: users.reduce((s, u) => s + Number(u.charts), 0) },
    ];
  }, [users]);

  const visible = session ? users : null;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => !q || (u.email ?? "").toLowerCase().includes(q))
      .sort((a, b) => sort === "created_at"
        ? b.created_at.localeCompare(a.created_at)
        : b.ai_used_total - a.ai_used_total);
  }, [users, query, sort]);

  if (denied) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-ink">Quản trị</h1>

      {ready && !session && (
        <div className="mt-8 rounded-2xl border border-line bg-paper p-8 text-center">
          <p className="text-stone-700">Đăng nhập bằng tài khoản quản trị.</p>
          <button onClick={() => openLogin()} className="mt-4 cursor-pointer rounded-xl bg-ink px-5 py-3 font-semibold text-gold hover:bg-ink-soft">Đăng nhập</button>
        </div>
      )}

      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}

      {session && !users && !error && <div className="mt-8 h-40 animate-pulse rounded-2xl bg-paper" aria-label="Đang tải" />}

      {stats && visible && (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-paper p-4">
                <dt className="text-sm text-stone-600">{s.label}</dt>
                <dd className="mt-1 font-serif text-3xl font-bold text-ink">{s.value.toLocaleString("vi-VN")}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <label className="relative min-w-60 flex-1">
              <span className="sr-only">Tìm theo email</span>
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo email"
                className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 outline-none focus:border-ink" />
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              Sắp xếp
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 rounded-xl border border-line bg-white px-3 outline-none focus:border-ink">
                <option value="created_at">Mới đăng ký</option>
                <option value="ai_used_total">Dùng AI nhiều nhất</option>
              </select>
            </label>
            <button onClick={() => downloadCsv(rows)}
              className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-gold hover:bg-ink-soft">
              <Download size={18} aria-hidden="true" /> Xuất CSV
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-paper">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Ngày đăng ký</th>
                  <th className="px-4 py-3 text-right font-semibold">Lượt AI hôm nay</th>
                  <th className="px-4 py-3 text-right font-semibold">Tổng lượt AI</th>
                  <th className="px-4 py-3 text-right font-semibold">Lá số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-ink">{u.email ?? "(không có email)"}</td>
                    <td className="px-4 py-3 text-stone-700">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.ai_used_today}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.ai_used_total}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.charts}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-600">Không có người dùng phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
