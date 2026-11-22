import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { WIKI_TYPES, wikiPath, type WikiType } from "@/lib/wiki/catalog";
import { publishedEntries } from "@/lib/wiki/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tu-vi`, changeFrequency: "monthly", priority: 0.8 },
    ...(Object.keys(WIKI_TYPES) as WikiType[]).map((t) => ({ url: `${SITE_URL}/tu-vi/${t}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...publishedEntries().map((x) => ({ url: `${SITE_URL}${wikiPath(x)}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
