import { NextResponse } from 'next/server';

import { createMeeting, getMeetings } from '@/lib/sheets';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const meetings = await getMeetings();
    return NextResponse.json({ meetings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload.title || !payload.meetingDate || !payload.meetingTime || !payload.location || !payload.leader) {
      return NextResponse.json({ error: 'Semua field rapat wajib diisi.' }, { status: 400 });
    }

    const meeting = await createMeeting(payload);
    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}