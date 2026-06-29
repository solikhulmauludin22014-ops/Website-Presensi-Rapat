import { NextResponse } from 'next/server';

import { getAttendancesByMeetingId, getMeetingById } from '@/lib/sheets';

export const runtime = 'nodejs';

// ── Bangun dokumen HTML yang bisa dibuka Word ──────────────────
function buildWordHtml(meeting, attendances) {
  const infoRows = [
    ['Judul Rapat', meeting.title],
    ['Tanggal', meeting.meetingDate],
    ['Waktu', meeting.meetingTime],
    ['Lokasi', meeting.location],
    ['Pimpinan Rapat', meeting.leader],
    ['Status', meeting.status],
    ['Jumlah Peserta Hadir', String(attendances.length)],
  ];

  const infoTableRows = infoRows
    .map(
      ([label, value]) => `
      <tr>
        <td style="font-weight:bold;width:30%;background:#e8f4f8;padding:6px 10px;border:1px solid #ccc;">${escHtml(label)}</td>
        <td style="width:5%;padding:6px 4px;border:1px solid #ccc;">:</td>
        <td style="padding:6px 10px;border:1px solid #ccc;">${escHtml(value)}</td>
      </tr>`,
    )
    .join('');

  const attendanceRows = attendances.length > 0
    ? attendances
        .map(
          (att, idx) => `
        <tr>
          <td style="text-align:center;padding:6px 8px;border:1px solid #ccc;">${idx + 1}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;">${escHtml(att.name)}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;">${escHtml(att.nip)}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;">${escHtml(att.timestamp)}</td>
          <td style="text-align:center;padding:4px 8px;border:1px solid #ccc;">
            ${
              att.signatureBase64
                ? `<img src="${att.signatureBase64}" alt="TTD" style="max-width:120px;max-height:50px;display:block;margin:auto;">`
                : ''
            }
          </td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="5" style="text-align:center;padding:12px;border:1px solid #ccc;color:#888;font-style:italic;">Belum ada peserta yang hadir.</td></tr>`;

  const notulensiHtml = (meeting.notulensi ?? '').trim()
    ? escHtml(meeting.notulensi)
        .split('\n')
        .map((line) => `<p style="margin:4px 0;line-height:1.7;">${line || '&nbsp;'}</p>`)
        .join('')
    : '<p style="color:#888;font-style:italic;">(Belum ada notulensi yang dicatat.)</p>';

  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>Daftar Hadir - ${escHtml(meeting.title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: "Times New Roman", serif;
      font-size: 12pt;
      color: #111;
      margin: 0;
      padding: 0;
    }
    .page {
      width: 21cm;
      min-height: 29.7cm;
      margin: 0 auto;
      padding: 2.5cm 2cm;
      box-sizing: border-box;
    }
    h1 { font-size: 16pt; text-align: center; margin: 0 0 4px; letter-spacing: 1px; }
    h2 { font-size: 14pt; text-align: center; margin: 0 0 24px; font-weight: normal; }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      background: #0f766e;
      color: white;
      padding: 6px 12px;
      margin: 24px 0 8px;
      letter-spacing: 0.5px;
    }
    table { border-collapse: collapse; width: 100%; }
    th {
      background: #1e3a5f;
      color: white;
      padding: 7px 10px;
      text-align: left;
      border: 1px solid #ccc;
      font-size: 11pt;
    }
    .footer {
      margin-top: 40px;
      font-size: 9pt;
      color: #999;
      text-align: right;
      border-top: 1px solid #ddd;
      padding-top: 8px;
    }
    @media print {
      .page { padding: 0; }
    }
  </style>
</head>
<body>
<div class="page">

  <h1>DAFTAR HADIR RAPAT</h1>
  <h2>${escHtml(meeting.title)}</h2>

  <div class="section-title">INFORMASI RAPAT</div>
  <table>
    ${infoTableRows}
  </table>

  <div class="section-title">DAFTAR HADIR PESERTA</div>
  <table>
    <thead>
      <tr>
        <th style="width:5%;text-align:center;">No</th>
        <th style="width:28%;">Nama Peserta</th>
        <th style="width:22%;">NIP</th>
        <th style="width:20%;">Waktu Hadir</th>
        <th style="width:25%;text-align:center;">Tanda Tangan</th>
      </tr>
    </thead>
    <tbody>
      ${attendanceRows}
    </tbody>
  </table>

  <div class="section-title">NOTULENSI RAPAT</div>
  <div style="padding:12px 14px;border:1px solid #ddd;min-height:100px;line-height:1.8;">
    ${notulensiHtml}
  </div>

  <div class="footer">
    Meeting ID: ${escHtml(meeting.meetingId)} &nbsp;·&nbsp; Dicetak: ${escHtml(now)}
  </div>

</div>
</body>
</html>`;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── GET ────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { meetingId } = params;

    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
      return NextResponse.json({ error: 'Rapat tidak ditemukan.' }, { status: 404 });
    }

    const attendances = await getAttendancesByMeetingId(meetingId);
    const html = buildWordHtml(meeting, attendances);

    const safeTitle = (meeting.title ?? meetingId)
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 40);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'application/vnd.ms-word; charset=UTF-8',
        'Content-Disposition': `attachment; filename="Daftar_Hadir_${safeTitle}.doc"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[download]', error);
    return NextResponse.json(
      { error: error.message ?? 'Gagal membuat dokumen.' },
      { status: 500 },
    );
  }
}
