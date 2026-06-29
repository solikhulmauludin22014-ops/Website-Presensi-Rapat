import { NextResponse } from 'next/server';

import { deleteMeeting, updateMeeting } from '../../../../lib/sheets';

export const runtime = 'nodejs';

export async function PUT(request, { params }) {
  try {
    const { meetingId } = params;
    const payload = await request.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID wajib ada.' }, { status: 400 });
    }

    const updated = await updateMeeting(meetingId, payload);
    return NextResponse.json({ meeting: updated });
  } catch (error) {
    const status = error.statusCode ?? 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { meetingId } = params;

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID wajib ada.' }, { status: 400 });
    }

    const result = await deleteMeeting(meetingId);
    return NextResponse.json(result);
  } catch (error) {
    const status = error.statusCode ?? 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
