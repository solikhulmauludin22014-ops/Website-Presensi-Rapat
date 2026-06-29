import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import AttendanceForm from '../../../components/AttendanceForm';
import { getMeetingById, getPublicAttendanceUrl } from '../../../lib/sheets';

export const dynamic = 'force-dynamic';

function getOrigin() {
  const requestHeaders = headers();
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000';
  return `${protocol}://${host}`;
}

export default async function AttendancePage({ params }) {
  const meeting = await getMeetingById(params.meetingId);

  if (!meeting) {
    notFound();
  }

  const attendanceUrl = getPublicAttendanceUrl(getOrigin(), meeting.meetingId);

  return (
    <main className="page-shell">
      <AttendanceForm meeting={meeting} attendanceUrl={attendanceUrl} />
    </main>
  );
}