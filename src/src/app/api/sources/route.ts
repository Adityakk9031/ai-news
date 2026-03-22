import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await query(`SELECT * FROM sources ORDER BY name ASC`);
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, url, type } = await req.json();
    await query(
      `INSERT INTO sources(name, url, type, active) VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (name) DO UPDATE SET url = EXCLUDED.url, type = EXCLUDED.type`,
      [name, url, type]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
