# 📋 Sistem Absensi & Notulensi Rapat Sekolah v2.0

Aplikasi web berbasis **Streamlit** untuk mencatat absensi dan membuat notulensi rapat sekolah secara digital dengan **link sharing**, **tanda tangan digital**, penyimpanan otomatis ke Google Sheets, dan export ke PDF.

## ✨ Fitur Utama

### 🆕 Fitur Baru v2.0:
- 🔗 **Link Absensi Digital** - Generate link/QR code yang bisa dibagikan ke peserta
- ✍️ **Tanda Tangan Digital** - Peserta tanda tangan langsung di form online (mouse/touchscreen)
- 📱 **Mobile Friendly** - Peserta bisa absen dari HP tanpa install aplikasi
- 📊 **Dashboard Admin** - Kelola rapat dan monitoring daftar hadir real-time
- 🆔 **Input NIP** - Form absensi include Nama + NIP
- 📈 **Multi-Meeting** - Kelola banyak rapat sekaligus dengan Meeting ID unik

### Fitur Lainnya:
- ✅ **Form Input Data Rapat** - Judul, tanggal, waktu, lokasi, dan pimpinan rapat
- ☁️ **Auto-Save ke Google Sheets** - Data tersimpan otomatis di cloud (3 worksheet terpisah)
- 📄 **Generate PDF Profesional** - Include daftar hadir lengkap dengan NIP
- 🎨 **UI Responsif & User-Friendly** - Tampilan modern dengan Streamlit
- 💾 **Export CSV** - Download daftar hadir dalam format CSV

## 🛠️ Teknologi yang Digunakan

- **Python 3.8+**
- **Streamlit** - Framework web app
- **gspread** + **oauth2client** - Integrasi Google Sheets
- **fpdf2** - Generate PDF
- **pandas** - Manipulasi data
- **streamlit-drawable-canvas** - Canvas tanda tangan digital
- **qrcode** + **pillow** - Generate QR Code

## 📦 Instalasi

1. **Clone atau download repository ini**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup Google Sheets** (Lihat [PANDUAN_SETUP.md](PANDUAN_SETUP.md) untuk detail lengkap)

4. **Buat file `.streamlit/secrets.toml`** dengan credentials Google Service Account

## 🚀 Cara Menjalankan

```bash
streamlit run app.py
```

Aplikasi akan terbuka di browser: `http://localhost:8501`

## � Cara Penggunaan

### Mode Admin:
1. Jalankan aplikasi (otomatis masuk halaman Admin)
2. Buat rapat baru di tab "Buat Rapat Baru"
3. Generate link/QR code absensi
4. Bagikan link/QR ke peserta via WhatsApp/email
5. Monitoring daftar hadir real-time di tab "Lihat Daftar Hadir"
6. Buat notulensi + PDF di tab "Generate Notulensi"

### Mode Peserta:
1. Buka link atau scan QR code yang dibagikan admin
2. Isi nama lengkap dan NIP
3. Tanda tangan di canvas (pakai mouse/jari di touchscreen)
4. Submit - selesai!

## 📖 Panduan Lengkap

Baca **[PANDUAN_SETUP.md](PANDUAN_SETUP.md)** untuk:
- Setup Google Cloud Platform & Service Account
- Generate JSON Key
- Konfigurasi Google Sheets
- Format file secrets.toml
- Troubleshooting lengkap

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

Dibuat dengan ❤️ menggunakan Python & Streamlit

---

**Butuh bantuan?** Baca [PANDUAN_SETUP.md](PANDUAN_SETUP.md) atau buka issue di repository ini.
