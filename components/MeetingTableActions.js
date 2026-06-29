'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MeetingTableActions({ meetings: initialMeetings }) {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────
  const [meetings, setMeetings] = useState(initialMeetings);

  // Modal hapus
  const [deleteTarget, setDeleteTarget] = useState(null); // { meetingId, title }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Modal edit
  const [editTarget, setEditTarget] = useState(null); // objek meeting lengkap
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ── Hapus ──────────────────────────────────────────────
  function openDeleteModal(meeting) {
    setDeleteTarget(meeting);
    setDeleteError('');
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteError('');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/meetings/${deleteTarget.meetingId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error ?? 'Gagal menghapus rapat.');
        return;
      }

      // Hapus dari state lokal agar langsung hilang tanpa tunggu refresh
      setMeetings((prev) => prev.filter((m) => m.meetingId !== deleteTarget.meetingId));
      closeDeleteModal();
      router.refresh();
    } catch {
      setDeleteError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────
  function openEditModal(meeting) {
    setEditTarget(meeting);
    setEditForm({
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      meetingTime: meeting.meetingTime,
      location: meeting.location,
      leader: meeting.leader,
      status: meeting.status,
    });
    setEditError('');
  }

  function closeEditModal() {
    setEditTarget(null);
    setEditForm({});
    setEditError('');
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editTarget) return;
    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch(`/api/meetings/${editTarget.meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error ?? 'Gagal menyimpan perubahan.');
        return;
      }

      // Update state lokal
      setMeetings((prev) =>
        prev.map((m) =>
          m.meetingId === editTarget.meetingId ? { ...m, ...data.meeting } : m
        )
      );
      closeEditModal();
      router.refresh();
    } catch {
      setEditError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setEditLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────
  if (meetings.length === 0) {
    return <p className="muted">Belum ada rapat yang dibuat.</p>;
  }

  return (
    <>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Judul</th>
            <th>Tanggal</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.meetingId}>
              <td>{meeting.title}</td>
              <td>{meeting.meetingDate}</td>
              <td>
                <span className={`status-badge ${meeting.status.toLowerCase() === 'aktif' ? 'status-aktif' : 'status-selesai'}`}>
                  {meeting.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <Link
                    className="btn btn-secondary btn-sm"
                    href={`/meetings/${meeting.meetingId}`}
                  >
                    Detail
                  </Link>
                  <button
                    className="btn btn-edit btn-sm"
                    type="button"
                    onClick={() => openEditModal(meeting)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => openDeleteModal(meeting)}
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Modal Hapus ─────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon danger">🗑️</span>
              <h3>Hapus Rapat</h3>
            </div>
            <p className="modal-body">
              Yakin ingin menghapus rapat <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>?
              <br />
              <span className="muted text-sm">Data absensi peserta tidak akan ikut terhapus.</span>
            </p>
            {deleteError && <div className="error-box">{deleteError}</div>}
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit ───────────────────────────────────── */}
      {editTarget && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">✏️</span>
              <h3>Edit Rapat</h3>
            </div>

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="edit-title">Judul Rapat</label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={editForm.title ?? ''}
                    onChange={handleEditChange}
                    required
                    placeholder="Judul rapat"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-date">Tanggal</label>
                  <input
                    id="edit-date"
                    name="meetingDate"
                    type="date"
                    value={editForm.meetingDate ?? ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-time">Waktu</label>
                  <input
                    id="edit-time"
                    name="meetingTime"
                    type="time"
                    value={editForm.meetingTime ?? ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-location">Lokasi</label>
                  <input
                    id="edit-location"
                    name="location"
                    type="text"
                    value={editForm.location ?? ''}
                    onChange={handleEditChange}
                    required
                    placeholder="Lokasi rapat"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-leader">Pimpinan Rapat</label>
                  <input
                    id="edit-leader"
                    name="leader"
                    type="text"
                    value={editForm.leader ?? ''}
                    onChange={handleEditChange}
                    required
                    placeholder="Nama pimpinan"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editForm.status ?? 'Aktif'}
                    onChange={handleEditChange}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {editError && <div className="error-box">{editError}</div>}

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                >
                  Batal
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={editLoading}
                >
                  {editLoading ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
