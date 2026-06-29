import Link from 'next/link';

import MeetingForm from '../components/MeetingForm';
import MeetingTableActions from '../components/MeetingTableActions';
import { getMeetings } from '../lib/sheets';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let meetings = [];
  let loadError = '';

  try {
    meetings = await getMeetings();
  } catch (error) {
    loadError = error instanceof Error ? error.message : 'Gagal memuat daftar rapat.';
  }

  const totalMeetings = meetings.length;
  const totalActive = meetings.filter((meeting) => meeting.status.toLowerCase() === 'aktif').length;

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-badge">Absensi Rapat Vercel</div>
          <h1>Absensi rapat publik tanpa login.</h1>
          <p className="subtle">
            Data rapat dan daftar hadir disimpan langsung ke Google Sheets. Peserta cukup buka link absensi dan tanda tangan dari perangkat apa pun.
          </p>
        </div>
        <div className="toolbar">
          <a className="btn btn-secondary" href="#buat-rapat">Buat Rapat</a>
          <a className="btn btn-secondary" href="#daftar-rapat">Daftar Rapat</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-card hero-copy">
          <div className="eyebrow">Google Sheets + Vercel</div>
          <h1>Form absensi publik yang siap dibagikan.</h1>
          <p className="subtle">
            Setelah rapat dibuat, sistem langsung menghasilkan link <strong>/a/&lt;meeting_id&gt;</strong> dan QR code untuk peserta. Tidak ada akun dan tidak ada login.
          </p>
          <div className="metrics">
            <div className="metric">
              <strong>{totalMeetings}</strong>
              <span>Rapat tersimpan</span>
            </div>
            <div className="metric">
              <strong>1</strong>
              <span>Database: Google Sheets</span>
            </div>
            <div className="metric">
              <strong>{totalActive}</strong>
              <span>Rapat aktif</span>
            </div>
          </div>
        </div>

        <div className="panel soft-panel">
          <h2>Alur pakai</h2>
          <ol className="steps">
            <li>Buat rapat dari halaman ini.</li>
            <li>Buka detail rapat untuk melihat link absensi.</li>
            <li>Bagikan link atau QR code ke peserta.</li>
            <li>Peserta isi nama, NIP, dan tanda tangan.</li>
          </ol>
        </div>
      </section>

      <section className="grid-cards" id="buat-rapat">
        <div className="card">
          <h2>Buat Rapat Baru</h2>
          <p className="muted">Data rapat langsung masuk ke worksheet <strong>Data_Rapat</strong>.</p>
          <MeetingForm />
        </div>

        <div className="card" id="daftar-rapat">
          <h2>Daftar Rapat</h2>
          <p className="muted">Klik detail untuk mengambil link absensi dan melihat daftar hadir.</p>
          {loadError ? <div className="error-box">{loadError}</div> : null}
          {!loadError && <MeetingTableActions meetings={meetings} />}
        </div>
      </section>

      <p className="footer-note">Deployment utama sekarang diarahkan ke Vercel + Google Sheets.</p>
    </main>
  );
}