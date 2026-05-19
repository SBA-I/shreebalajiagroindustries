// Generates public/sitemap.xml from static routes + dynamic DB content.
// Runs in predev/prebuild via the package.json scripts.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://shreebalajiagroindustries.lovable.app";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/products/compare", changefreq: "monthly", priority: "0.5" },
  { path: "/resources", changefreq: "weekly", priority: "0.8" },
  { path: "/news", changefreq: "daily", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/ask-ai", changefreq: "monthly", priority: "0.6" },
  { path: "/yield-simulator", changefreq: "monthly", priority: "0.5" },
  { path: "/tools/harvest-timer", changefreq: "monthly", priority: "0.5" },
  { path: "/tools/pest-calendar", changefreq: "monthly", priority: "0.6" },
  { path: "/safety", changefreq: "monthly", priority: "0.6" },
  { path: "/sustainability", changefreq: "monthly", priority: "0.6" },
  { path: "/find-dealer", changefreq: "weekly", priority: "0.7" },
];

async function fetchRows(table: string, select: string, filter: string): Promise<any[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&${filter}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

function xml(entries: SitemapEntry[]) {
  const urls = entries.map((e) => [
    "  <url>",
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ].filter(Boolean).join("\n"));

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const entries: SitemapEntry[] = [...staticEntries];

  const products = await fetchRows("products", "slug,updated_at", "is_active=eq.true");
  products.forEach((p: any) => entries.push({
    path: `/products/${p.slug}`,
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
    changefreq: "monthly", priority: "0.7",
  }));

  const articles = await fetchRows("sustainability_articles", "slug,updated_at", "is_published=eq.true");
  articles.forEach((a: any) => entries.push({
    path: `/resources/${a.slug}`,
    lastmod: a.updated_at ? new Date(a.updated_at).toISOString().slice(0, 10) : undefined,
    changefreq: "monthly", priority: "0.6",
  }));

  const news = await fetchRows("news_articles", "slug,updated_at", "is_published=eq.true");
  news.forEach((n: any) => entries.push({
    path: `/news/${n.slug}`,
    lastmod: n.updated_at ? new Date(n.updated_at).toISOString().slice(0, 10) : undefined,
    changefreq: "weekly", priority: "0.6",
  }));

  writeFileSync(resolve("public/sitemap.xml"), xml(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();