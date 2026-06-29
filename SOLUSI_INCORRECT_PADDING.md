# 🚨 SOLUSI ERROR "Incorrect padding"

## ❌ Masalah Anda:
Error "Incorrect padding" terjadi karena **file `secrets.toml` belum diisi dengan benar** atau **Anda mengedit file yang salah**.

---

## ✅ SOLUSI CEPAT (Pilih salah satu):

### 🎯 Metode 1: Menggunakan Helper Script (TERCEPAT)

1. **Download file JSON** dari Google Cloud (jika belum)

2. **Jalankan helper script** di terminal:
   ```bash
   cd "d:\APK ABSENSI RAPAT ONLINE"
   python helper_format_json.py
   ```

3. **Masukkan path ke file JSON** Anda (atau tekan Enter jika file ada di folder ini)

4. **Copy semua output** yang muncul

5. **Paste ke file** `.streamlit\secrets.toml` (BUKAN `secrets.toml.example`)

6. **Tambahkan Spreadsheet Key** dari URL Google Sheets Anda

7. **Save dan restart aplikasi**

---

### 📝 Metode 2: Manual (Jika cara 1 tidak berhasil)

#### Langkah 1: Pastikan Edit File yang Benar

**❌ SALAH:** Edit file `.streamlit\secrets.toml.example`  
**✅ BENAR:** Edit file `.streamlit\secrets.toml`

Di VS Code, pastikan tab yang terbuka adalah **`secrets.toml`** (tanpa .example)

#### Langkah 2: Buka File JSON dari Google Cloud

Buka file JSON yang Anda download dari Google Cloud. Contoh isinya:

```json
{
  "type": "service_account",
  "project_id": "absensi-rapat-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...\n-----END PRIVATE KEY-----\n",
  "client_email": "nama@absensi-rapat.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

#### Langkah 3: Copy ke secrets.toml

Edit file `.streamlit\secrets.toml` dan isi dengan format ini:

```toml
app_url = "http://localhost:8501"

# Ganti dengan Spreadsheet Key Anda
spreadsheet_key = "1a2B3c4D5e6F7g8H9i0J..."

[gcp_service_account]
type = "service_account"
project_id = "absensi-rapat-123456"          # ← Copy dari JSON
private_key_id = "abc123..."                 # ← Copy dari JSON
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...\n-----END PRIVATE KEY-----\n"  # ← Copy SELURUH dari JSON
client_email = "nama@absensi-rapat.iam.gserviceaccount.com"  # ← Copy dari JSON
client_id = "123456789"                      # ← Copy dari JSON
auth_uri = "https://accounts.google.com/o/oauth2/auth"
token_uri = "https://oauth2.googleapis.com/token"
auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/..."  # ← Copy dari JSON
universe_domain = "googleapis.com"
```

#### Langkah 4: Khusus untuk private_key

**SANGAT PENTING:**
- Copy **SELURUH** private_key dari JSON (dari `-----BEGIN` sampai `-----END`)
- Pastikan `\n` tetap ada (jangan dihapus!)
- Harus dalam SATU BARIS dengan `\n` untuk ganti baris
- Harus dalam tanda kutip ganda `"`

**Contoh yang BENAR:**
```toml
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgk...(panjang)...\n-----END PRIVATE KEY-----\n"
```

**Contoh yang SALAH:**
```toml
# ❌ Salah - private_key terpisah banyak baris tanpa \n
private_key = "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgk...
-----END PRIVATE KEY-----"

# ❌ Salah - ada spasi sebelum/sesudah key
private_key = " -----BEGIN PRIVATE KEY-----\n..."

# ❌ Salah - tidak ada \n
private_key = "-----BEGIN PRIVATE KEY-----MIIEvQI..."
```

#### Langkah 5: Dapatkan Spreadsheet Key

1. Buka Google Sheets Anda
2. Lihat URL di address bar:
   ```
   https://docs.google.com/spreadsheets/d/1vVdQqLaBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                          ↑ INI SPREADSHEET KEY ↑
   ```
3. Copy bagian antara `/d/` dan `/edit`
4. Paste ke `spreadsheet_key` di secrets.toml

#### Langkah 6: Share Google Sheets

1. Buka Google Sheets Anda
2. Klik tombol **Share** (kanan atas)
3. Masukkan email dari `client_email` (ada di JSON atau secrets.toml)
   - Contoh: `id-streamlit-gsheets@absensi-rapat.iam.gserviceaccount.com`
4. Pilih akses: **Editor**
5. **UNCHECK** "Notify people"
6. Klik **Share**

#### Langkah 7: Save & Restart

1. **Save** file `secrets.toml` (Ctrl+S)
2. **Stop** aplikasi Streamlit (Ctrl+C di terminal)
3. **Jalankan lagi:**
   ```bash
   python -m streamlit run app.py
   ```
4. **Refresh** browser

---

## 🔍 Cara Cek Apakah Sudah Benar

Jalankan script checker ini:

```bash
python -c "import tomli; print('✅ secrets.toml valid!' if tomli.loads(open('.streamlit/secrets.toml').read()) else '❌ Error')"
```

Atau cek manual:
1. File `.streamlit\secrets.toml` ada dan tidak kosong
2. Tidak ada placeholder seperti `"your-project-id"` atau `"PASTE_..."`
3. `private_key` dimulai dengan `"-----BEGIN PRIVATE KEY-----\n`
4. `private_key` diakhiri dengan `\n-----END PRIVATE KEY-----\n"`
5. Semua field terisi dengan data dari JSON Anda

---

## 🆘 Masih Error?

### Error: "Incorrect padding"
- ✅ Pastikan edit file `secrets.toml` (BUKAN `secrets.toml.example`)
- ✅ Pastikan `private_key` dicopy lengkap dengan `\n`
- ✅ Pastikan tidak ada spasi ekstra sebelum/sesudah key
- ✅ Restart aplikasi setelah edit

### Error: "Spreadsheet not found"
- ✅ Pastikan `spreadsheet_key` sudah benar
- ✅ Pastikan Google Sheets sudah di-share ke `client_email`

### Error: "Permission denied"
- ✅ Pastikan service account diberi akses "Editor" (bukan "Viewer")

---

## 📞 Butuh Bantuan?

Jalankan helper script untuk mendapatkan format yang tepat:
```bash
python helper_format_json.py path/to/your-file.json
```
