'use client';

export default function CopyLinkButton({ url }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link berhasil disalin!');
    } catch {
      // fallback jika clipboard tidak tersedia
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Link berhasil disalin!');
    }
  };

  return (
    <button className="btn btn-secondary" type="button" onClick={handleCopy}>
      Salin Link
    </button>
  );
}
