"use client";

import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export default function AuthBar({ session }: { session: Session | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  if (session) {
    return (
      <div className="flex items-center justify-end gap-3 text-sm">
        <span className="text-stone-600">{session.user.email}</span>
        <button className="rounded-md border border-amber-900/30 px-3 py-1 hover:bg-amber-100" onClick={() => supabase.auth.signOut()}>
          Đăng xuất
        </button>
      </div>
    );
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Đang gửi...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setStatus(error ? `Lỗi: ${error.message}` : "Đã gửi link đăng nhập, hãy kiểm tra email (cả mục Spam).");
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    if (error) setStatus(`Lỗi: ${error.message}`);
  }

  return (
    <div className="flex flex-col items-end gap-2 text-sm">
      {!open ? (
        <button className="rounded-md bg-red-800 px-4 py-1.5 font-medium text-white hover:bg-red-900" onClick={() => setOpen(true)}>
          Đăng nhập
        </button>
      ) : (
        <div className="w-full max-w-sm space-y-2 rounded-xl border border-amber-900/30 bg-amber-50 p-4 shadow-md">
          <p className="font-medium">Đăng nhập để lưu lá số và dùng AI luận giải</p>
          <button className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50" onClick={google}>
            Tiếp tục với Google
          </button>
          <form onSubmit={sendLink} className="flex gap-2">
            <input
              type="email"
              required
              className="min-w-0 flex-1 rounded-md border border-amber-900/30 bg-white px-3 py-2"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="rounded-md bg-red-800 px-3 py-2 text-white hover:bg-red-900">Gửi link</button>
          </form>
          {status && <p className="text-stone-600">{status}</p>}
          <button className="text-xs text-stone-500 underline" onClick={() => setOpen(false)}>
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
