import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import { fetchAll } from "./ingest/fetcher.js";
import { generateLinkedInCaption, generateNewsletter } from "./ai.js";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const app = express();
app.use(express.json());

// Allow specific origins for security. Defaults to * for local development.
// On Render, set FRONTEND_URL to your frontend's deployed URL (e.g., https://your-frontend.onrender.com)
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"].filter(Boolean);
app.use(cors({ 
  origin: allowedOrigins.length > 0 ? (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  } : "*" 
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/ingest", async (_req, res, next) => {
  try {
    await fetchAll();
    res.json({ status: "ok" });
  } catch (e) {
    next(e);
  }
});

app.get("/news", async (req, res, next) => {
  try {
    const { q, source } = req.query as Record<string, string>;
    let where = "WHERE n.is_duplicate = FALSE";
    const params: any[] = [];
    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      words.forEach(word => {
        params.push(`%${word}%`);
        where += ` AND (n.title ILIKE $${params.length} OR n.summary ILIKE $${params.length})`;
      });
    }
    if (source) {
      params.push(source);
      where += ` AND s.name = $${params.length}`;
    }
    const sql = `
      SELECT n.id, s.name as source, n.title, n.summary, n.url, n.published_at, n.is_duplicate
      FROM news_items n
      LEFT JOIN sources s ON n.source_id = s.id
      ${where}
      ORDER BY COALESCE(n.published_at, n.created_at) DESC
      LIMIT 100
    `;
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/favorites", async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT f.id, n.id as news_item_id, s.name as source, n.title, n.summary, n.url, n.published_at
       FROM favorites f
       JOIN news_items n ON f.news_item_id = n.id
       LEFT JOIN sources s ON n.source_id = s.id
       ORDER BY f.created_at DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.post("/favorites/:newsId", async (req, res, next) => {
  try {
    const userId = 1;
    const newsId = Number(req.params.newsId);
    await query(`INSERT INTO users(id, role) VALUES (1, 'admin') ON CONFLICT (id) DO NOTHING`);
    await query(
      `INSERT INTO favorites(user_id, news_item_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, news_item_id) DO NOTHING`,
      [userId, newsId]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.delete("/favorites/:newsId", async (req, res, next) => {
  try {
    const userId = 1;
    const newsId = Number(req.params.newsId);
    await query(`DELETE FROM favorites WHERE user_id = $1 AND news_item_id = $2`, [userId, newsId]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/broadcast/:favoriteId", async (req, res, next) => {
  try {
    const { platform } = req.body as { platform: string };
    const favoriteId = Number(req.params.favoriteId);
    
    const { rows } = await query(
      `SELECT n.title, n.summary, n.url 
       FROM favorites f 
       JOIN news_items n ON f.news_item_id = n.id 
       WHERE f.id = $1`, 
      [favoriteId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    const { title, summary, url } = rows[0];
    let content = "";
    
    if (platform === "linkedin") {
      content = await generateLinkedInCaption(title, summary, url);
    } else if (platform === "email") {
      content = `Subject: AI News Update: ${title}\n\nHi,\n\nCheck out this interesting AI update:\n\n${summary}\n\nRead the full story here: ${url}`;
    } else if (platform === "whatsapp") {
      content = `*AI News Update*\n\n*${title}*\n\n${summary?.slice(0, 100)}...\n\nRead more: ${url}`;
    } else if (platform === "blog") {
      content = `<h2>${title}</h2><p>${summary}</p><a href="${url}">Read more</a>`;
    } else {
      content = `Check out this AI news: ${title} ${url}`;
    }

    await query(
      `INSERT INTO broadcast_logs(favorite_id, platform, status)
       VALUES ($1, $2, 'sent')`,
      [favoriteId, platform]
    );
    res.json({ status: "sent", platform, aiContent: content });
  } catch (e) {
    next(e);
  }
});

app.get("/newsletter", async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT n.title, n.summary, n.url 
       FROM favorites f 
       JOIN news_items n ON f.news_item_id = n.id 
       ORDER BY f.created_at DESC 
       LIMIT 5`
    );
    console.log(`Generating newsletter for ${rows.length} items`);
    const content = await generateNewsletter(rows);
    res.json({ content });
  } catch (e) {
    console.error("Newsletter route error:", e);
    next(e);
  }
});

app.get("/sources", async (_req, res, next) => {
  try {
    const { rows } = await query(`SELECT * FROM sources ORDER BY name ASC`);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.post("/sources", async (req, res, next) => {
  try {
    const { name, url, type } = req.body;
    await query(
      `INSERT INTO sources(name, url, type, active) VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url, type = EXCLUDED.type`,
      [name, url, type]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);
  try {
    await query("SELECT 1");
    console.log("Connected to Neon DB");
  } catch (e) {
    console.error("DB connection failed", e);
  }
});
