import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ChevronRight, Sparkles } from "lucide-react";
import { WIKI_ENTRIES, WIKI_TYPES, findEntry, wikiPath, type WikiType } from "@/lib/wiki/catalog";
import { loadWiki, publishedEntries } from "@/lib/wiki/content";
import { OG_IMAGES, SITE_NAME, SITE_URL } from "@/lib/site";

type Params = { type: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedEntries().map(({ type, slug }) => ({ type, slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type, slug } = await params;
  const entry = findEntry(type, slug);
  const content = entry && loadWiki(entry);
  if (!entry || !content) return {};
  const title = `${entry.name} (${entry.han}) là gì? Ý nghĩa trong Tử Vi`;
  const path = wikiPath(entry);
  return {
    title,
    description: content.summary.slice(0, 160),
    alternates: { canonical: path },
    openGraph: { type: "article", locale: "vi_VN", siteName: SITE_NAME, url: path, title: `${title} | ${SITE_NAME}`, description: content.summary, images: OG_IMAGES },
  };
}

export default async function WikiPage({ params }: { params: Promise<Params> }) {
  const { type, slug } = await params;
  const entry = findEntry(type, slug);
  const content = entry && loadWiki(entry);
  if (!entry || !content) notFound();
  const typeInfo = WIKI_TYPES[entry.type as WikiType];
  const url = `${SITE_URL}${wikiPath(entry)}`;
  const related = content.related
    .map((r) => WIKI_ENTRIES.find((x) => `${x.type}/${x.slug}` === r))
    .filter((x): x is NonNullable<typeof x> => !!x && publishedEntries().some((p) => p.slug === x.slug && p.type === x.type));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${entry.name} (${entry.han}) trong Tử Vi Đẩu Số`,
        description: content.summary,
        inLanguage: "vi",
        mainEntityOfPage: url,
        image: `${SITE_URL}/og.png`,
        author: { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Wiki tử vi", item: `${SITE_URL}/tu-vi` },
          { "@type": "ListItem", position: 3, name: typeInfo.label, item: `${SITE_URL}/tu-vi/${entry.type}` },
          { "@type": "ListItem", position: 4, name: entry.name, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-stone-600">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-ink">Trang chủ</Link></li>
          <ChevronRight size={14} aria-hidden="true" />
          <li><Link href="/tu-vi" className="hover:text-ink">Wiki tử vi</Link></li>
          <ChevronRight size={14} aria-hidden="true" />
          <li><Link href={`/tu-vi/${entry.type}`} className="hover:text-ink">{typeInfo.label}</Link></li>
        </ol>
      </nav>

      <article className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-gold-deep">{entry.group}</p>
        <h1 className="mt-1 font-serif text-4xl font-bold text-ink">
          {entry.name} <span className="text-2xl font-normal text-stone-500">{entry.han}</span>
        </h1>
        <p className="mt-4 rounded-2xl border-l-4 border-gold bg-paper p-5 text-lg leading-relaxed text-stone-800">{content.summary}</p>

        {content.sections.length > 2 && (
          <nav aria-label="Mục lục" className="mt-6 rounded-2xl border border-line bg-paper p-5">
            <p className="font-semibold text-ink">Nội dung chính</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-700">
              {content.sections.map((s, i) => (
                <li key={s.heading}><a href={`#muc-${i + 1}`} className="hover:text-ink hover:underline">{s.heading}</a></li>
              ))}
            </ol>
          </nav>
        )}

        {content.sections.map((s, i) => (
          <section key={s.heading} id={`muc-${i + 1}`} className="mt-8 scroll-mt-24">
            <h2 className="font-serif text-2xl font-bold text-ink">{s.heading}</h2>
            <div className="prose-reading mt-2 text-[17px] leading-relaxed text-stone-800"><ReactMarkdown>{s.body}</ReactMarkdown></div>
          </section>
        ))}

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold text-ink">Câu hỏi thường gặp</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-paper">
            {content.faq.map((f) => (
              <details key={f.q} className="group px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-xl text-gold-deep transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 leading-relaxed text-stone-700">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <aside className="mt-10 flex flex-col items-center gap-4 rounded-3xl bg-ink px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-serif text-xl font-bold text-gold">Xem {entry.name} nằm ở đâu trong lá số của bạn</p>
          <p className="mt-1 text-stone-300">Lập lá số miễn phí, kèm luận giải AI.</p>
        </div>
        <Link href="/#lap-la-so" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold px-5 py-3 font-semibold text-ink hover:opacity-90">
          <Sparkles size={18} aria-hidden="true" /> Lập lá số
        </Link>
      </aside>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-bold text-ink">Bài liên quan</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={`${r.type}/${r.slug}`}>
                <Link href={wikiPath(r)} className="flex min-h-14 items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 transition-colors hover:bg-gold/15">
                  <span><span className="font-semibold text-ink">{r.name}</span> <span className="text-sm text-stone-500">{r.han}</span></span>
                  <ChevronRight size={18} className="text-stone-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-xs text-stone-500">
        Nội dung tham khảo tài liệu Numerologist_skills, biên soạn lại bằng tiếng Việt với sự hỗ trợ của AI. Chỉ mang tính tham khảo, không thay thế tư vấn chuyên môn.
      </p>
    </main>
  );
}
