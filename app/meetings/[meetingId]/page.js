import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import QRCodeCard from '../../../components/QRCodeCard';
import CopyLinkButton from '../../../components/CopyLinkButton';
import NotulensiEditor from '../../../components/NotulensiEditor';
import { getAttendancesByMeetingId, getMeetingById, getPublicAttendanceUrl } from '../../../lib/sheets';

export const dynamic = 'force-dynamic';

function getOrigin() {
  const requestHeaders = headers();
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https';
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000';
  return `${protocol}://${host}`;
}

export default async function MeetingDetailPage({ params }) {
  const meeting = await getMeetingById(params.meetingId);

  if (!meeting) {
    notFound();
  }

  const attendances = await getAttendancesByMeetingId(params.meetingId);
  const attendanceUrl = getPublicAttendanceUrl(getOrigin(), meeting.meetingId);

  return (
    <main className="page-shell stack gap-xl">
      <div className="toolbar">
        <Link className="btn btn-secondary" href="/">Kembali</Link>
        <div className="toolbar-right">
          <Link className="btn btn-secondary" href={`/a/${meeting.meetingId}`}>
            Buka Form Absensi
          </Link>
          <a
            className="btn btn-download"
            href={`/api/meetings/${meeting.meetingId}/download`}
            download
          >
            ⬇ Download Word
          </a>
        </div>
      </div>

      <section className="hero">
        <div className="hero-card hero-copy">
          <div className="eyebrow">Detail rapat</div>
          <h1>{meeting.title}</h1>
          <p className="subtle">ID: {meeting.meetingId}</p>

          <div className="metrics">
            <div className="metric">
              <strong>{meeting.meetingDate}</strong>
              <span>Tanggal</span>
            </div>
            <div className="metric">
              <strong>{meeting.meetingTime}</strong>
              <span>Waktu</span>
            </div>
            <div className="metric">
              <strong>{attendances.length}</strong>
              <span>Peserta hadir</span>
            </div>
          </div>

          <div className="stack">
            <p className="subtle"><strong>Lokasi:</strong> {meeting.location}</p>
            <p className="subtle"><strong>Pimpinan:</strong> {meeting.leader}</p>
            <p className="subtle"><strong>Status:</strong> {meeting.status}</p>
          </div>

          <div className="inline-row">
            <input className="link-input" value={attendanceUrl} readOnly />
            <CopyLinkButton url={attendanceUrl} />
          </div>
        </div>

        <div className="panel soft-panel">
          <h2>QR Code</h2>
          <p className="muted">Scan untuk membuka form absensi publik.</p>
          <QRCodeCard url={attendanceUrl} />
        </div>
      </section>

      {/* Daftar Hadir */}
      <section className="card">
        <div className="section-header-row">
          <div>
            <h2>Daftar Hadir</h2>
            <p className="muted">{attendances.length} peserta hadir</p>
          </div>
          <a
            className="btn btn-download btn-sm"
            href={`/api/meetings/${meeting.meetingId}/download`}
            download
          >
            ⬇ Download Word
          </a>
        </div>

        {attendances.length > 0 ? (
          <div className="table-scroll">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>NIP</th>
                  <th>Waktu</th>
                  <th>Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance, idx) => (
                  <tr key={`${attendance.nip}-${attendance.timestamp}`}>
                    <td className="text-center">{idx + 1}</td>
                    <td>{attendance.name}</td>
                    <td>{attendance.nip}</td>
                    <td>{attendance.timestamp}</td>
                    <td className="signature-cell">
                      {attendance.signatureBase64 ? (
                        <img
                          src={attendance.signatureBase64}
                          alt={`TTD ${attendance.name}`}
                          className="signature-thumb"
                        />
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">Belum ada peserta yang absen.</p>
        )}
      </section>

      {/* Notulensi */}
      <NotulensiEditor
        meetingId={meeting.meetingId}
        initialNotulensi={meeting.notulensi ?? ''}
      />
    </main>
  );
}