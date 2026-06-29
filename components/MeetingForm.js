'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const initialState = {
  title: '',
  meetingDate: '',
  meetingTime: '',
  location: '',
  leader: '',
  status: 'Aktif',
};

export default function MeetingForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'Gagal membuat rapat.');
      }

      setForm(initialState);
      router.push(`/meetings/${payload.meeting.meetingId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>
          Judul rapat
          <input value={form.title} onChange={updateField('title')} placeholder="Rapat Koordinasi Semester Genap" required />
        </label>
        <label>
          Tanggal
          <input type="date" value={form.meetingDate} onChange={updateField('meetingDate')} required />
        </label>
        <label>
          Waktu
          <input type="time" value={form.meetingTime} onChange={updateField('meetingTime')} required />
        </label>
        <label>
          Lokasi
          <input value={form.location} onChange={updateField('location')} placeholder="Ruang Guru" required />
        </label>
        <label>
          Pimpinan rapat
          <input value={form.leader} onChange={updateField('leader')} placeholder="Kepala Sekolah" required />
        </label>
        <label>
          Status
          <select value={form.status} onChange={updateField('status')}>
            <option>Aktif</option>
            <option>Selesai</option>
            <option>Dibatalkan</option>
          </select>
        </label>
      </div>

      {error ? <p className="error-box">{error}</p> : null}

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : 'Buat Rapat'}
      </button>
    </form>
  );
}