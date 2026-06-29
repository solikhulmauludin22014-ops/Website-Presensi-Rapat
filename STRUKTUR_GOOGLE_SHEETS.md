# 📊 Struktur Google Sheets

Aplikasi v2.0 menggunakan **3 worksheet terpisah** dalam 1 spreadsheet:

## 1️⃣ Worksheet: Data_Rapat

Sheet ini menyimpan informasi rapat yang dibuat admin.

**Header (Baris 1):**
```
Meeting ID | Judul | Tanggal | Waktu | Lokasi | Pimpinan | Timestamp Dibuat | Status
```

**Contoh Data:**
```
MTG20260211123456 | Rapat Koordinasi Semester | 11-02-2026 | 09:00 | Ruang Guru | Drs. Bambang Sutopo, M.Pd | 2026-02-11 08:30:00 | Aktif
```

**Keterangan:**
- `Meeting ID`: ID unik rapat (auto-generate)
- `Status`: "Aktif" atau "Selesai"
- Sheet ini dibuat otomatis saat admin create rapat pertama kali

---

## 2️⃣ Worksheet: Data_Absensi

Sheet ini menyimpan data absensi peserta yang submit via link.

**Header (Baris 1):**
```
Meeting ID | Nama | NIP | Timestamp | Signature
```

**Contoh Data:**
```
MTG20260211123456 | Budi Santoso, S.Pd | 197501011998031001 | 2026-02-11 09:05:23 | iVBORw0KGgoAAAANSUhEUgAA...
```

**Keterangan:**
- `Meeting ID`: ID rapat yang di-absen
- `Nama`: Nama lengkap dengan gelar
- `NIP`: Nomor Induk Pegawai (18 digit)
- `Timestamp`: Waktu submit absensi
- `Signature`: Tanda tangan digital (base64, 100 karakter pertama untuk verifikasi)
- 1 NIP hanya bisa absen 1x per Meeting ID (ada validasi duplikasi)

---

## 3️⃣ Worksheet: Data_Notulensi (Opsional - Future Update)

Untuk menyimpan notulensi terpisah (belum diimplementasikan di v2.0).

---

## 🔄 Cara Kerja

### Flow Admin:
1. Admin buat rapat → data masuk ke `Data_Rapat`
2. Admin generate link/QR → dibagikan ke peserta
3. Admin monitoring → baca data dari `Data_Absensi`
4. Admin generate PDF → baca dari `Data_Rapat` + `Data_Absensi`

### Flow Peserta:
1. Buka link → app cek `Data_Rapat` (validasi Meeting ID)
2. Isi form + tanda tangan
3. Submit → data masuk ke `Data_Absensi`

---

## 📝 Tips Setup Google Sheets

### Setelah Service Account sudah dishare:

1. **Biarkan aplikasi create worksheet otomatis** (recommended)
   - Jalankan app, buat rapat pertama
   - Worksheet akan dibuat otomatis dengan header yang benar

2. **ATAU buat manual** (jika ingin pre-setup):
   - Buat 2 sheet: `Data_Rapat` dan `Data_Absensi`
   - Copy paste header persis seperti di atas (huruf besar-kecil harus sama)
   - Jangan tambahkan formatting atau formula

### Format yang Harus Diperhatikan:
- **Nama worksheet** case-sensitive: `Data_Rapat` bukan `data_rapat`
- **Header** harus persis sama (spasi, huruf besar/kecil)
- Sheet pertama (default) tidak dipakai di v2.0 (bisa dihapus atau dibiarkan)

---

## 🔍 Query & Filter

### Lihat semua rapat:
```
Filter di worksheet Data_Rapat
```

### Lihat peserta rapat tertentu:
```
Filter di worksheet Data_Absensi berdasarkan Meeting ID
```

### Export ke Excel:
```
File → Download → Microsoft Excel (.xlsx)
```

---

## ⚠️ Catatan Penting

1. **Jangan edit header** setelah worksheet dibuat
2. **Jangan hapus kolom** (app akan error)
3. **Boleh tambah kolom** di sebelah kanan untuk keperluan lain
4. **Boleh tambah sheet** untuk arsip manual
5. Data tanda tangan (Signature) disimpan partial untuk verifikasi, bukan untuk ditampilkan

---

## 🔐 Keamanan

- Service Account hanya perlu akses **Editor** (bukan Owner)
- Bisa revoke akses kapan saja dari Google Sheets
- Data tanda tangan di-encode base64 (tidak bisa dilihat langsung)
- Validasi duplikasi otomatis (1 NIP = 1 absen per rapat)
