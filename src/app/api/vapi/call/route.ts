import { NextResponse } from 'next/server';

export async function POST() {
  const privateKey = process.env.VAPI_PRIVATE_KEY;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const customerNumber = process.env.VAPI_CUSTOMER_PHONE ?? '+14809526946';

  if (!privateKey || !phoneNumberId || !assistantId) {
    return NextResponse.json(
      { error: 'Missing VAPI_PRIVATE_KEY, VAPI_PHONE_NUMBER_ID, or NEXT_PUBLIC_VAPI_ASSISTANT_ID in environment.' },
      { status: 500 },
    );
  }

  const res = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumberId,
      customer: { number: customerNumber },
      assistantId,
      assistantOverrides: {
        analysisPlan: {
          structuredDataPlan: {
            enabled: true,
            schema: {
              type: 'object',
              properties: {
                appointmentDate: {
                  type: 'string',
                  description: 'The date of the appointment mentioned during the call, e.g. "April 25, 2026"',
                },
                appointmentTime: {
                  type: 'string',
                  description: 'The time of the appointment mentioned during the call, e.g. "2:00 PM"',
                },
              },
            },
          },
        },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data?.message ?? 'Vapi API error', details: data }, { status: res.status });
  }
  return NextResponse.json({ callId: data.id });
}
