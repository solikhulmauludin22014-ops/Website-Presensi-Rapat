'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeCard({ url }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((result) => {
        if (mounted) {
          setDataUrl(result);
        }
      })
      .catch(() => {
        if (mounted) {
          setDataUrl('');
        }
      });

    return () => {
      mounted = false;
    };
  }, [url]);

  if (!dataUrl) {
    return <div className="qr-placeholder">Membuat QR code...</div>;
  }

  return <img className="qr-image" src={dataUrl} alt="QR Code absensi" />;
}
