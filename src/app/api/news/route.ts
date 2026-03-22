import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const source = searchParams.get("source");
    
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
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
