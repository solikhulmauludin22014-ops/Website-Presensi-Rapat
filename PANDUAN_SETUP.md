# Panduan Setup Vercel + Google Sheets

Panduan ini untuk menjalankan aplikasi absensi rapat publik tanpa login memakai **Vercel** sebagai server dan **Google Sheets** sebagai database.

## 1. Siapkan Google Sheets

Buat 1 spreadsheet dengan 2 worksheet:

- `Data_Rapat`
- `Data_Absensi`

Isi header baris pertama:

`Data_Rapat`

```text
Meeting ID, Judul, Tanggal, Waktu, Lokasi, Pimpinan, Timestamp Dibuat, Status
```

`Data_Absensi`

```text
Meeting ID, Nama, NIP, Timestamp, Signature
```

## 2. Buat Service Account Google

Di Google Cloud Console:

1. Aktifkan Google Sheets API.
2. Buat service account.
3. Download file key JSON.
4. Share spreadsheet ke email service account itu sebagai Editor.

## 3. Set Environment Variables

Tambahkan variabel berikut di Vercel dan di file lokal jika ingin jalan di komputer sendiri:

```env
GOOGLE_SHEET_ID=isi-id-spreadsheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=isi-email-service-account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
NEXT_PUBLIC_SITE_URL=https://domain-anda.vercel.app
```

Catatan untuk `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`:

- Simpan dalam satu baris.
- Gunakan `\n` untuk pindah baris.
- Jangan hapus bagian `BEGIN` dan `END`.

## 4. Jalankan Lokal

```bash
npm install
npm run dev
```

Lalu buka aplikasi di browser.

## 5. Cara Pakai

1. Buka halaman utama.
2. Buat rapat baru.
3. Klik detail rapat.
4. Salin link absensi.
5. Bagikan link itu ke peserta.
6. Peserta buka link, isi data, tanda tangan, lalu kirim.

Tidak ada login untuk peserta.

## 6. Format Link Absensi

Link absensi publik selalu berbentuk:

```text
https://domain-anda/a/<meeting_id>
```

Contoh lokal:

```text
http://localhost:3000/a/<meeting_id>
```

## 7. Deploy ke Vercel

1. Push repository ke GitHub.
2. Import project ke Vercel.
3. Set environment variables.
4. Deploy.

## 8. Troubleshooting

- Jika data tidak tersimpan, cek `GOOGLE_SHEET_ID` dan email service account.
- Jika `private_key` gagal dibaca, pastikan `\n` masih ada.
- Jika halaman detail rapat menampilkan link lokal, set `NEXT_PUBLIC_SITE_URL` ke domain Vercel Anda.# Panduan Pakai Cepat

Dokumen ini untuk menjalankan aplikasi absensi rapat tanpa login peserta. Link absensi dibentuk otomatis dari halaman detail rapat dan bisa langsung dibagikan ke peserta.

## 1. Jalankan aplikasi

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Kalau memakai environment virtual, aktifkan dulu environment yang sudah ada sebelum menjalankan perintah di atas.

## 2. Buat rapat

1. Buka halaman utama aplikasi.
2. Isi data rapat pada form admin rapat.
3. Simpan rapat.
4. Buka halaman detail rapat untuk melihat QR code dan link absensi.

## 3. Link absensi

Format link absensi adalah:

```text
https://domain-anda/a/<meeting_id>/
```

Contoh lokal:

```text
http://127.0.0.1:8000/a/<meeting_id>/
```

Di halaman detail rapat, link ini sudah tampil dalam bentuk field siap salin dan QR code.

## 4. Alur peserta

1. Peserta membuka link absensi.
2. Peserta mengisi nama, NIP, dan tanda tangan.
3. Data tersimpan otomatis.

Tidak ada login peserta.

## 5. Catatan deployment

Repositori ini saat ini berjalan dengan backend Django. Jika Anda ingin domain publik, gunakan URL deploy yang aktif lalu bagikan link absensi dari halaman detail rapat.

Jika Anda benar-benar ingin versi Vercel + Google Sheets murni, itu perlu migrasi arsitektur terpisah dari kode yang ada sekarang.
