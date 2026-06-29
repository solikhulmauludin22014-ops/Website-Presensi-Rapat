import { NextResponse } from 'next/server';

import { getMeetingById } from '../../../../../lib/sheets';

export const runtime = 'nodejs';

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(request, { params }) {
  try {
    const { meetingId } = params;

    const meeting = await getMeetingById(meetingId);
    if (!meeting) {
      return new NextResponse('Rapat tidak ditemukan.', { status: 404 });
    }

    const notulensi = (meeting.notulensi ?? '').trim();
    const notulensiHtml = notulensi
      ? notulensi
          .split('\n')
          .map((line) =>
            line.trim()
              ? `<p>${escHtml(line)}</p>`
              : '<p class="spacer">&nbsp;</p>',
          )
          .join('')
      : '<p class="empty-note">Notulensi belum diisi untuk rapat ini.</p>';

    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notulensi — ${escHtml(meeting.title)}</title>
  <style>
    /* ── Reset ──────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Times New Roman", Georgia, serif;
      font-size: 12pt;
      color: #111827;
      background: #f3f4f6;
    }

    /* ── Halaman ─────────────────────────────────────── */
    .page {
      width: 21cm;
      min-height: 29.7cm;
      margin: 24px auto;
      padding: 2.2cm 2.4cm;
      background: #fff;
      box-shadow: 0 4px 30px rgba(0,0,0,0.18);
    }

    /* ── Header kop ──────────────────────────────────── */
    .kop {
      text-align: center;
      border-bottom: 4px double #0f766e;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .kop .doc-type {
      font-size: 9pt;
      letter-spacing: 3px;
      color: #0f766e;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .kop h1 {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 1px;
      line-height: 1.2;
      margin-bottom: 6px;
    }

    .kop .subtitle {
      font-size: 12pt;
      color: #374151;
      font-style: italic;
    }

    /* ── Tabel info ──────────────────────────────────── */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      font-size: 11pt;
    }

    .info-table tr td {
      padding: 5px 8px;
      vertical-align: top;
    }

    .info-table tr td:first-child {
      font-weight: bold;
      width: 32%;
      color: #1f2937;
    }

    .info-table tr td:nth-child(2) {
      width: 4%;
      text-align: center;
    }

    .info-table tr:nth-child(odd) { background: #f9fafb; }

    /* ── Section label ───────────────────────────────── */
    .section-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #fff;
      background: linear-gradient(135deg, #0f766e, #0891b2);
      padding: 8px 14px;
      margin: 24px 0 14px;
    }

    /* ── Konten notulensi ────────────────────────────── */
    .notulensi-content {
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 18px 22px;
      min-height: 200px;
      line-height: 1.9;
      font-size: 12pt;
    }

    .notulensi-content p { margin: 0 0 4px; }
    .notulensi-content .spacer { margin: 0; }
    .notulensi-content .empty-note {
      color: #9ca3af;
      font-style: italic;
    }

    /* ── Area tanda tangan ───────────────────────────── */
    .sign-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 48px;
    }

    .sign-box {
      text-align: center;
      width: 220px;
    }

    .sign-box .place-date {
      font-size: 11pt;
      margin-bottom: 6px;
    }

    .sign-box .sign-space {
      height: 70px;
    }

    .sign-box .sign-name {
      font-size: 11pt;
      font-weight: bold;
      border-top: 1.5px solid #111;
      padding-top: 6px;
    }

    .sign-box .sign-title {
      font-size: 10pt;
      color: #6b7280;
    }

    /* ── Footer ──────────────────────────────────────── */
    .footer {
      margin-top: 32px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #9ca3af;
    }

    /* ── Tombol cetak (screen only) ──────────────────── */
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #0f766e, #0891b2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 24px;
      font-family: Inter, sans-serif;
      font-size: 13px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
      z-index: 9999;
    }

    .print-bar .info { font-weight: 600; }
    .print-bar .hint { font-size: 11px; opacity: 0.85; }

    .print-bar .btn-print {
      background: white;
      color: #0f766e;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: Inter, sans-serif;
      transition: box-shadow 0.15s;
    }

    .print-bar .btn-print:hover {
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }

    @media screen {
      body { padding-top: 56px; }
    }

    /* ── Print CSS ───────────────────────────────────── */
    @media print {
      body { background: white; padding: 0; }
      .print-bar { display: none; }
      .page {
        width: 100%;
        min-height: 0;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }

      @page {
        size: A4 portrait;
        margin: 2cm 2.2cm;
      }

      .section-label { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .info-table tr:nth-child(odd) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Bar cetak (screen only) -->
  <div class="print-bar">
    <div>
      <div class="info">📄 Notulensi: ${escHtml(meeting.title)}</div>
      <div class="hint">Pilih "Simpan sebagai PDF" di dialog cetak untuk mengunduh PDF</div>
    </div>
    <button class="btn-print" onclick="window.print()">
      🖨️ Cetak / Simpan PDF
    </button>
  </div>

  <!-- Konten halaman -->
  <div class="page">

    <!-- Kop surat -->
    <div class="kop">
      <div class="doc-type">Dokumen Resmi Rapat</div>
      <h1>NOTULENSI RAPAT</h1>
      <div class="subtitle">${escHtml(meeting.title)}</div>
    </div>

    <!-- Info rapat -->
    <table class="info-table">
      <tr><td>Tanggal</td><td>:</td><td>${escHtml(meeting.meetingDate)}</td></tr>
      <tr><td>Waktu</td><td>:</td><td>${escHtml(meeting.meetingTime)} WIB</td></tr>
      <tr><td>Lokasi / Tempat</td><td>:</td><td>${escHtml(meeting.location)}</td></tr>
      <tr><td>Pimpinan Rapat</td><td>:</td><td>${escHtml(meeting.leader)}</td></tr>
      <tr><td>Status</td><td>:</td><td>${escHtml(meeting.status)}</td></tr>
    </table>

    <!-- Isi notulensi -->
    <div class="section-label">📝 Notulensi Rapat</div>
    <div class="notulensi-content">
      ${notulensiHtml}
    </div>

    <!-- Area tanda tangan -->
    <div class="sign-area">
      <div class="sign-box">
        <div class="place-date">Mengetahui,</div>
        <div class="sign-space"></div>
        <div class="sign-name">${escHtml(meeting.leader)}</div>
        <div class="sign-title">Pimpinan Rapat</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>ID: ${escHtml(meeting.meetingId)}</span>
      <span>Dicetak: ${escHtml(now)}</span>
    </div>

  </div><!-- /.page -->

  <script>
    // Auto-buka dialog cetak saat halaman selesai dimuat
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 700);
    });
  </script>

</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[notulensi-pdf]', error);
    return new NextResponse('Gagal membuat halaman PDF: ' + error.message, { status: 500 });
  }
}
