import { NextResponse } from 'next/server';
import { fetchAll } from '../../../lib/ingest/fetcher';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await fetchAll();
    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
