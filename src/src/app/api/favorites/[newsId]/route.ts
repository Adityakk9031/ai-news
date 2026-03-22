import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { newsId: string } }) {
  try {
    const userId = 1;
    const newsId = Number(params.newsId);
    await query(`INSERT INTO users(id, role) VALUES (1, 'admin') ON CONFLICT (id) DO NOTHING`);
    await query(
      `INSERT INTO favorites(user_id, news_item_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, news_item_id) DO NOTHING`,
      [userId, newsId]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { newsId: string } }) {
  try {
    const userId = 1;
    const newsId = Number(params.newsId);
    await query(`DELETE FROM favorites WHERE user_id = $1 AND news_item_id = $2`, [userId, newsId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
