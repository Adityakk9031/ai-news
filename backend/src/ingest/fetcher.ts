import Parser from "rss-parser";
import crypto from "crypto";
import { query } from "../db.js";
import { SOURCES } from "./sources.js";
import { summarizeNews } from "../ai.js";
// @ts-ignore
import stringSimilarity from "string-similarity";

const parser = new Parser({
  timeout: 10000,
});

function fingerprint(title: string, url: string) {
  const normalized = title.toLowerCase().replace(/\s+/g, " ").trim();
  try {
    const hostname = new URL(url).hostname;
    return crypto.createHash("sha256").update(normalized + "|" + hostname).digest("hex");
  } catch (e) {
    return crypto.createHash("sha256").update(normalized + "|" + url).digest("hex");
  }
}

export async function upsertSources() {
  for (const s of SOURCES) {
    await query(
      `INSERT INTO sources(name, url, type, active)
       VALUES ($1,$2,$3,TRUE)
       ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url, type = EXCLUDED.type, active = TRUE`,
      [s.name, s.url, s.type]
    ).catch(() => {});
  }
}

export async function fetchAll() {
  await upsertSources();
  
  // Cache recent titles directly to avoid N+1 DB queries in isSemanticDuplicate
  const recentTitlesReq = await query(
    `SELECT title FROM news_items 
     WHERE created_at > NOW() - INTERVAL '24 hours' 
     AND is_duplicate = FALSE`
  );
  const recentTitles = recentTitlesReq.rows.map(r => r.title.toLowerCase());

  // Fetch active sources directly from DB instead of hardcoded array
  const sourcesReq = await query(`SELECT id, name, url, type FROM sources WHERE active = TRUE`);
  const activeSources = sourcesReq.rows;

  for (const src of activeSources) {
    if (src.type === "api") {
      console.warn(`Skipping API source ${src.name} - 'api' type parser not fully implemented yet.`);
      continue;
    }

    try {
      const feed = await parser.parseURL(src.url);
      for (const item of feed.items) {
        const title = item.title ?? "";
        const link = item.link ?? "";
        const rawSummary = item.contentSnippet ?? item.content ?? item.summary ?? "";
        const fp = fingerprint(title, link);
        const published = item.isoDate ?? item.pubDate ?? null;

        // Check for exact fingerprint
        const exactDup = await query(
          `SELECT 1 FROM news_items WHERE fingerprint = $1`, [fp]
        );
        
        let isDup = exactDup.rows.length > 0;
        
        // Fast in-memory semantic similarity check
        if (!isDup) {
          const lowerTitle = title.toLowerCase();
          for (const rt of recentTitles) {
            const similarity = stringSimilarity.compareTwoStrings(lowerTitle, rt);
            if (similarity > 0.85) {
              isDup = true;
              break;
            }
          }
          if (!isDup) {
             recentTitles.push(lowerTitle);
          }
        }

        // Summarize with AI if content is long and NOT a duplicate
        const summary = (!isDup && rawSummary.length > 300) 
          ? await summarizeNews(title, rawSummary) 
          : rawSummary;

        // Insert
        await query(
          `INSERT INTO news_items(source_id, title, summary, url, published_at, fingerprint, is_duplicate)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (fingerprint) DO NOTHING`,
          [src.id, title, summary, link, published, fp, isDup]
        );
      }
    } catch (e: any) {
      console.error("Fetch error for", src.name, e.message);
    }
  }
}
