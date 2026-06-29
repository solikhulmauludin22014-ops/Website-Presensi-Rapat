import './globals.css';

export const metadata = {
  title: 'Absensi Rapat',
  description: 'Absensi rapat publik tanpa login dengan Google Sheets dan Vercel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}