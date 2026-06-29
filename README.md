# Absensi Rapat Vercel

Aplikasi absensi rapat publik tanpa login, dibangun dengan **Next.js** di **Vercel** dan menyimpan data langsung ke **Google Sheets**.

## Fitur

- Link absensi publik tanpa login
- QR code untuk dibagikan ke peserta
- Form rapat dan form absensi
- Penyimpanan data ke Google Sheets
- Halaman detail rapat dengan daftar hadir

## Alur kerja

1. Buat rapat dari halaman utama.
2. Buka halaman detail rapat.
3. Salin link absensi atau scan QR code.
4. Peserta isi nama, NIP, dan tanda tangan.
5. Data masuk ke Google Sheets.

## Struktur Google Sheets

Buat 1 spreadsheet dengan 2 worksheet:

- `Data_Rapat`
- `Data_Absensi`

Header yang dipakai aplikasi:

`Data_Rapat`

```text
Meeting ID | Judul | Tanggal | Waktu | Lokasi | Pimpinan | Timestamp Dibuat | Status
```

`Data_Absensi`

```text
Meeting ID | Nama | NIP | Timestamp | Signature
```

## Environment Variables

Set variabel berikut di Vercel dan juga untuk lokal:

```env
GOOGLE_SHEET_ID=isi-id-spreadsheet
GOOGLE_SERVICE_ACCOUNT_EMAIL=isi-email-service-account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
NEXT_PUBLIC_SITE_URL=https://domain-anda.vercel.app
```

## Jalankan lokal

```bash
npm install
npm run dev
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import repo ke Vercel.
3. Set environment variables di atas.
4. Deploy.

Setelah deploy, link absensi akan mengikuti domain Vercel Anda dengan format:

```text
https://domain-anda/a/<meeting_id>
```

## Catatan

Folder Django lama masih ada di repo sebagai arsip, tetapi deployment utama sekarang memakai stack Vercel + Google Sheets.# 📋 Sistem Absensi & Notulensi Rapat Sekolah v3.0

Aplikasi web berbasis **Django + PostgreSQL** untuk mencatat absensi dan membuat notulensi rapat sekolah secara digital dengan **link sharing**, **tanda tangan digital**, **QR code**, dan export PDF.

## ✨ Fitur Utama

### 🆕 Fitur Baru v3.0:
- 🔗 **Link Absensi Digital** - Generate link/QR code yang bisa dibagikan ke peserta
- ✍️ **Tanda Tangan Digital** - Peserta tanda tangan langsung di form online (mouse/touchscreen)
- 📱 **Mobile Friendly** - Peserta bisa absen dari HP tanpa install aplikasi
- 📊 **Dashboard Admin** - Kelola rapat dan monitoring daftar hadir real-time
- 🆔 **Input NIP** - Form absensi include Nama + NIP
- 📈 **Multi-Meeting** - Kelola banyak rapat sekaligus dengan Meeting ID unik

### Fitur Lainnya:
- ✅ **Form Input Data Rapat** - Judul, tanggal, waktu, lokasi, dan pimpinan rapat
- ☁️ **Penyimpanan Stabil** - Data tersimpan di PostgreSQL
- 📄 **Generate PDF Profesional** - Include daftar hadir lengkap
- 🎨 **UI Responsif & User-Friendly** - Tampilan modern berbasis template Django
- 💾 **Export PDF** - Download notulensi dari halaman detail rapat

## 🛠️ Teknologi yang Digunakan

- **Python 3.11+**
- **Django** - Framework web app
- **PostgreSQL** - Database utama
- **fpdf2** - Generate PDF
- **pandas** - Manipulasi data
- **qrcode** + **pillow** - Generate QR Code

## 📦 Instalasi

1. **Clone atau download repository ini**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Siapkan PostgreSQL** dan isi `DATABASE_URL`

4. **Buat file `.env`** untuk `DJANGO_SECRET_KEY`, `DATABASE_URL`, dan `DJANGO_ALLOWED_HOSTS`

## 🚀 Cara Menjalankan

```bash
python manage.py migrate
python manage.py runserver
```

Aplikasi akan terbuka di browser: `http://localhost:8000`

## 🧭 Cara Penggunaan

### Mode Admin:
1. Buka halaman daftar rapat di `/meetings/`
2. Buat rapat baru
3. Buka detail rapat untuk melihat QR code dan link absensi
4. Monitor daftar hadir real-time
5. Unduh PDF notulensi dari halaman detail rapat

### Mode Peserta:
1. Buka link absensi atau scan QR code yang dibagikan admin
2. Isi nama lengkap dan NIP
3. Tanda tangan di canvas (pakai mouse/jari di touchscreen)
4. Submit - selesai!

## 📖 Panduan Lengkap

Baca **[PANDUAN_SETUP.md](PANDUAN_SETUP.md)** untuk:
- Setup PostgreSQL lokal atau cloud
- Menjalankan migrasi Django
- Konfigurasi environment variable
- Deploy ke hosting yang mendukung Django

## ☁️ Deploy Cepat (Render + PostgreSQL)

Repository ini sudah disiapkan untuk Render menggunakan [render.yaml](render.yaml).

Langkah singkat:
1. Push repo ke GitHub.
2. Buka Render dan pilih **New +** → **Blueprint**.
3. Pilih repository ini.
4. Render akan membaca [render.yaml](render.yaml) dan membuat:
   - 1 Web Service (Django)
   - 1 PostgreSQL database
5. Setelah deploy selesai, buka URL aplikasi dari Render.

Catatan:
- Ganti nilai `DJANGO_ALLOWED_HOSTS` dan `DJANGO_CSRF_TRUSTED_ORIGINS` jika nama service berubah.
- Start command produksi memakai `gunicorn` via [Procfile](Procfile).

## 🎯 Use Case

Aplikasi ini cocok untuk:
- Sekolah (SD, SMP, SMA, SMK) - Rapat guru
- Universitas - Rapat dosen/staf
- Lembaga pendidikan - Meeting internal
- Organisasi yang sering mengadakan rapat
- **Cocok untuk rapat hybrid**: peserta bisa absen dari lokasi berbeda via link

## 📝 Lisensi

Bebas digunakan untuk keperluan pendidikan dan non-komersial.

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan Python, Django, dan PostgreSQL

---

**Butuh bantuan?** Baca [PANDUAN_SETUP.md](PANDUAN_SETUP.md) atau buka issue di repository ini.
