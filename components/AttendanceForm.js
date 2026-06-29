'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

function useSignatureCanvas() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const contextRef = useRef(null);
  const snapshotRef = useRef('');

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const previousDataUrl = snapshotRef.current;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#111827';
    contextRef.current = context;

    if (previousDataUrl && hasDrawnRef.current) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, rect.width, rect.height);
      };
      image.src = previousDataUrl;
    }
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = event.touches?.[0] ?? event;
    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
  };

  const beginDrawing = (event) => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    drawingRef.current = true;
    hasDrawnRef.current = true;

    const { x, y } = getPoint(event);
    context.beginPath();
    context.moveTo(x, y);
  };

  const continueDrawing = (event) => {
    const context = contextRef.current;
    if (!drawingRef.current || !context) {
      return;
    }

    const { x, y } = getPoint(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    snapshotRef.current = '';
    hasDrawnRef.current = false;
  };

  const capture = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnRef.current) {
      return '';
    }

    const dataUrl = canvas.toDataURL('image/png');
    snapshotRef.current = dataUrl;
    return dataUrl;
  };

  return {
    canvasRef,
    beginDrawing,
    continueDrawing,
    stopDrawing,
    clear,
    capture,
  };
}

export default function AttendanceForm({ meeting, attendanceUrl }) {
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('');

  const signature = useSignatureCanvas();
  const canSubmit = useMemo(() => Boolean(meeting?.meetingId), [meeting]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setMessageKind('');

    const signatureBase64 = signature.capture();
    if (!signatureBase64) {
      setMessageKind('error');
      setMessage('Tanda tangan wajib diisi.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.meetingId,
          name,
          nip,
          signatureBase64,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'Gagal menyimpan absensi.');
      }

      setMessageKind('success');
      setMessage('Absensi berhasil disimpan.');
      setName('');
      setNip('');
      signature.clear();
    } catch (submitError) {
      setMessageKind('error');
      setMessage(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stack gap-xl">
      <section className="card hero-card">
        <div className="eyebrow">Link absensi publik</div>
        <h1>{meeting.title}</h1>
        <p className="muted">
          {meeting.meetingDate} · {meeting.meetingTime} · {meeting.location}
        </p>
        <div className="inline-row">
          <input className="link-input" value={attendanceUrl} readOnly />
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(attendanceUrl);
              setMessageKind('success');
              setMessage('Link absensi disalin.');
            }}
          >
            Salin Link
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-grid two">
          <div>
            <h2>Isi Absensi</h2>
            <form className="stack" onSubmit={handleSubmit}>
              <label>
                Nama lengkap
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Budi Santoso, S.Pd" required />
              </label>
              <label>
                NIP
                <input value={nip} onChange={(event) => setNip(event.target.value)} placeholder="197501011998031001" required />
              </label>

              <label>
                Tanda tangan digital
                <div className="signature-shell">
                  <canvas
                    ref={signature.canvasRef}
                    className="signature-canvas"
                    onPointerDown={signature.beginDrawing}
                    onPointerMove={signature.continueDrawing}
                    onPointerUp={signature.stopDrawing}
                    onPointerLeave={signature.stopDrawing}
                    onTouchStart={signature.beginDrawing}
                    onTouchMove={signature.continueDrawing}
                    onTouchEnd={signature.stopDrawing}
                  />
                </div>
              </label>

              <div className="inline-row">
                <button className="btn btn-secondary" type="button" onClick={signature.clear}>
                  Hapus TTD
                </button>
                <button className="btn btn-primary" type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Mengirim...' : 'Kirim Absensi'}
                </button>
              </div>
            </form>

            {message ? <p className={messageKind === 'error' ? 'error-box' : 'success-box'}>{message}</p> : null}
          </div>

          <div className="panel soft-panel">
            <h3>Petunjuk</h3>
            <ol className="steps">
              <li>Buka link absensi.</li>
              <li>Isi nama dan NIP.</li>
              <li>Tanda tangani kotak di bawah.</li>
              <li>Kirim absensi. Tidak ada login.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}