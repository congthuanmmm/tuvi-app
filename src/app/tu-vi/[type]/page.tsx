import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { WIKI_TYPES, wikiPath, type WikiType } from "@/lib/wiki/catalog";
import { publishedEntries } from "@/lib/wiki/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(WIKI_TYPES) as WikiType[]).filter((t) => publishedEntries().some((x) => x.type === t)).map((type) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const info = WIKI_TYPES[type as WikiType];
  if (!info) return {};
  return { title: `${info.label} trong Tử Vi Đẩu Số`, description: info.description, alternates: { canonical: `/tu-vi/${type}` } };
}

export default async function WikiTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const info = WIKI_TYPES[type as WikiType];
  if (!info) notFound();
  const entries = publishedEntries().filter((x) => x.type === type);
  const groups = [...new Set(entries.map((x) => x.group))];
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-stone-600">
        <Link href="/" className="hover:text-ink">Trang chủ</Link> / <Link href="/tu-vi" className="hover:text-ink">Wiki tử vi</Link>
      </nav>
      <h1 className="mt-3 font-serif text-4xl font-bold text-ink">{info.label}</h1>
      <p className="mt-2 text-lg text-stone-700">{info.description}</p>
      {groups.map((g) => (
        <section key={g} className="mt-8">
          <h2 className="font-serif text-2xl font-bold text-ink">{g}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.filter((x) => x.group === g).map((x) => (
              <li key={x.slug}>
                <Link href={wikiPath(x)} className="flex min-h-14 items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 transition-colors hover:bg-gold/15">
                  <span><span className="font-semibold text-ink">{x.name}</span> <span className="text-sm text-stone-500">{x.han}</span></span>
                  <ChevronRight size={18} className="text-stone-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
