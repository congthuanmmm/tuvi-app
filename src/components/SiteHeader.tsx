"use client";

import Link from "next/link";
import { History, LogOut, BookOpen } from "lucide-react";
import { useLogin } from "@/components/LoginProvider";
import { useSession } from "@/lib/hooks/useSession";
import { supabase } from "@/lib/supabase/client";

export default function SiteHeader() {
  const { session, ready } = useSession();
  const { openLogin } = useLogin();
  const meta = session?.user.user_metadata as { avatar_url?: string; full_name?: string } | undefined;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" width={36} height={36} className="rounded-lg" />
          <span className="font-serif text-lg font-bold tracking-wide text-ink">Lá Số Việt</span>
        </Link>
        <nav aria-label="Chính" className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          <Link href="/#lap-la-so" className="transition-colors hover:text-ink">Lập lá số</Link>
          <Link href="/#12-cung" className="transition-colors hover:text-ink">12 cung</Link>
          <Link href="/tu-vi" className="transition-colors hover:text-ink">Wiki tử vi</Link>
          <Link href="/#hoi-dap" className="transition-colors hover:text-ink">Hỏi đáp</Link>
          <Link href="/lich-su" className="transition-colors hover:text-ink">Lá số của tôi</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/tu-vi" aria-label="Wiki tử vi"
            className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden">
            <BookOpen size={20} />
          </Link>
          {ready && session ? (
            <>
              <Link href="/lich-su" aria-label="Lá số của tôi"
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden">
                <History size={20} />
              </Link>
              {meta?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.avatar_url} alt={meta.full_name ?? session.user.email ?? ""} width={32} height={32}
                  referrerPolicy="no-referrer" className="h-8 w-8 rounded-full" />
              ) : (
                <span className="hidden text-sm text-stone-600 sm:inline">{session.user.email}</span>
              )}
              <button onClick={() => supabase.auth.signOut()} aria-label="Đăng xuất" title="Đăng xuất"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-stone-600 transition-colors hover:bg-ink/5 hover:text-ink">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button onClick={() => openLogin()} disabled={!ready}
              className="cursor-pointer rounded-full bg-ink px-5 py-2 text-sm font-semibold text-gold transition-colors hover:bg-ink-soft disabled:opacity-60">
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
