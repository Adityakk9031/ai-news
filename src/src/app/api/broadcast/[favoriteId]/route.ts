import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { generateLinkedInCaption } from '../../../../lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { favoriteId: string } }) {
  try {
    const { platform } = await req.json() as { platform: string };
    const favoriteId = Number(params.favoriteId);
    
    const { rows } = await query(
      `SELECT n.title, n.summary, n.url 
       FROM favorites f 
       JOIN news_items n ON f.news_item_id = n.id 
       WHERE f.id = $1`, 
      [favoriteId]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
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
    return NextResponse.json({ status: "sent", platform, aiContent: content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
