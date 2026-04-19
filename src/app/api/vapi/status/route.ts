import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const callId = req.nextUrl.searchParams.get('id');
  const privateKey = process.env.VAPI_PRIVATE_KEY;

  if (!callId) return NextResponse.json({ error: 'Missing call id' }, { status: 400 });
  if (!privateKey) return NextResponse.json({ error: 'Missing VAPI_PRIVATE_KEY' }, { status: 500 });

  const res = await fetch(`https://api.vapi.ai/call/${callId}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.message ?? 'Vapi error' }, { status: res.status });

  return NextResponse.json({
    status: data.status,
    endedReason: data.endedReason,
    structuredData: data.analysis?.structuredData ?? null,
  });
}
