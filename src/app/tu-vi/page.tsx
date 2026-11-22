import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { WIKI_TYPES, wikiPath, type WikiType } from "@/lib/wiki/catalog";
import { publishedEntries } from "@/lib/wiki/content";

export const metadata: Metadata = {
  title: "Wiki tử vi: ý nghĩa các sao, 12 cung, tứ hóa, cách cục",
  description: "Thư viện kiến thức Tử Vi Đẩu Số bằng tiếng Việt: 14 chính tinh, cát tinh, sát tinh, 12 cung, tứ hóa và các cách cục thường gặp.",
  alternates: { canonical: "/tu-vi" },
};

export default function WikiHub() {
  const entries = publishedEntries();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
        <BookOpen size={14} aria-hidden="true" /> Wiki tử vi
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold text-ink">Kiến thức Tử Vi Đẩu Số</h1>
      <p className="mt-2 max-w-2xl text-lg text-stone-700">
        Giải thích dễ hiểu về các sao, 12 cung, tứ hóa và cách cục, kèm tên chữ Hán. Đọc xong, bạn có thể tự đối chiếu với lá số của mình.
      </p>
      {(Object.keys(WIKI_TYPES) as WikiType[]).map((t) => {
        const list = entries.filter((x) => x.type === t);
        if (!list.length) return null;
        return (
          <section key={t} className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink">{WIKI_TYPES[t].label}</h2>
                <p className="mt-1 text-stone-700">{WIKI_TYPES[t].description}</p>
              </div>
              <Link href={`/tu-vi/${t}`} className="hidden shrink-0 text-sm font-semibold text-gold-deep hover:underline sm:inline">Xem tất cả →</Link>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {list.map((x) => (
                <li key={x.slug}>
                  <Link href={wikiPath(x)} className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line bg-paper px-4 text-sm text-ink transition-colors hover:bg-gold/30">
                    {x.name} <ChevronRight size={14} className="text-stone-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
