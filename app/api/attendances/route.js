import { NextResponse } from 'next/server';

import { createAttendance } from '../../../lib/sheets';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const payload = await request.json();
    const attendance = await createAttendance(payload);
    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    const status = error.statusCode ?? 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}