'use client';

import { useState } from 'react';

export default function NotulensiEditor({ meetingId, initialNotulensi = '' }) {
  const [notulensi, setNotulensi] = useState(initialNotulensi);
  // Track notulensi yang sudah tersimpan (untuk mengaktifkan tombol PDF)
  const [savedNotulensi, setSavedNotulensi] = useState(initialNotulensi);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(''); // 'saved' | 'error' | ''
  const [errorMsg, setErrorMsg] = useState('');

  const isDirty = notulensi !== savedNotulensi;
  const hasSavedContent = savedNotulensi.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    setStatus('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notulensi }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Gagal menyimpan notulensi.');
        return;
      }

      setStatus('saved');
      setSavedNotulensi(notulensi); // update referensi tersimpan
      setTimeout(() => setStatus(''), 4000);
    } catch {
      setStatus('error');
      setErrorMsg('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card notulensi-section">
      <div className="notulensi-header">
        <div>
          <h2>Notulensi Rapat</h2>
          <p className="muted">Catatan hasil rapat. Tersimpan langsung ke Google Sheets.</p>
        </div>
        <div className="notulensi-header-actions">
          {status === 'saved' && (
            <span className="save-badge saved">✓ Tersimpan</span>
          )}
          {status === 'error' && (
            <span className="save-badge error-badge">{errorMsg}</span>
          )}

          {/* Tombol Download PDF — aktif hanya jika sudah ada notulensi tersimpan */}
          {hasSavedContent ? (
            <a
              href={`/api/meetings/${meetingId}/notulensi-pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-pdf"
              title="Buka halaman PDF notulensi (pilih Simpan sebagai PDF di dialog cetak)"
            >
              📄 Download PDF
            </a>
          ) : (
            <button
              className="btn btn-pdf btn-pdf-disabled"
              type="button"
              disabled
              title="Simpan notulensi terlebih dahulu sebelum download PDF"
            >
              📄 Download PDF
            </button>
          )}

          <button
            className="btn btn-primary"
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? 'Menyimpan…' : 'Simpan Notulensi'}
          </button>
        </div>
      </div>

      <textarea
        className="notulensi-textarea"
        value={notulensi}
        onChange={(e) => {
          setNotulensi(e.target.value);
          if (status === 'saved') setStatus('');
        }}
        placeholder={
          'Tulis notulensi rapat di sini...\n\nContoh:\n1. Rapat dibuka pukul 09.00 WIB oleh Pimpinan Rapat.\n2. Agenda: ...\n3. Pembahasan: ...\n4. Keputusan: ...\n5. Rapat ditutup pukul ...'
        }
        rows={14}
        spellCheck={false}
      />

      {isDirty && status !== 'saved' && (
        <p className="notulensi-hint">Ada perubahan yang belum disimpan.</p>
      )}
    </section>
  );
}
