import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WIKI_ENTRIES, type WikiEntry } from "./catalog";

export interface WikiContent {
  summary: string;
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  related: string[];
}

const file = (x: Pick<WikiEntry, "type" | "slug">) => join(process.cwd(), "content/wiki", x.type, `${x.slug}.json`);

export function loadWiki(x: Pick<WikiEntry, "type" | "slug">): WikiContent | null {
  const f = file(x);
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as WikiContent) : null;
}

export const publishedEntries = () => WIKI_ENTRIES.filter((x) => existsSync(file(x)));
