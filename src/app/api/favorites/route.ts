import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT f.id, n.id as news_item_id, s.name as source, n.title, n.summary, n.url, n.published_at
       FROM favorites f
       JOIN news_items n ON f.news_item_id = n.id
       LEFT JOIN sources s ON n.source_id = s.id
       ORDER BY f.created_at DESC
       LIMIT 100`
    );
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
