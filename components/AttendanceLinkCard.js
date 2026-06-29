"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function AttendanceLinkCard({ attendanceUrl }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(attendanceUrl, {
      width: 260,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#18212d",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (mounted) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      mounted = false;
    };
  }, [attendanceUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(attendanceUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="qr-box panel panel-strong panel-inner">
      <div className="stack">
        <span className="pill">Link absensi siap pakai</span>
        <div className="copy-row">
          <input readOnly value={attendanceUrl} />
          <button className="btn btn-secondary" type="button" onClick={copyLink}>
            {copied ? "Tersalin" : "Salin link"}
          </button>
        </div>
        <p className="meta">Peserta cukup buka link ini, isi nama, NIP, lalu tanda tangan. Tidak ada login.</p>
      </div>

      <div className="panel panel-inner" style={{ background: "white" }}>
        {qrDataUrl ? <img src={qrDataUrl} alt="QR Code absensi" style={{ width: "100%", display: "block" }} /> : <p className="meta">Membuat QR code...</p>}
      </div>
    </div>
  );
}