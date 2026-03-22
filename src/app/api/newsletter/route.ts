import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { generateNewsletter } from '../../../lib/ai';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    return NextResponse.json({ content });
  } catch (e: any) {
    console.error("Newsletter route error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
