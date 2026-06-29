# ⚠️ CARA MEMPERBAIKI ERROR "Incorrect padding"

Error ini muncul karena file `.streamlit/secrets.toml` belum diisi dengan credentials yang benar dari Google Cloud.

## 🔧 Langkah Perbaikan:

### 1. Download JSON Key dari Google Cloud

Ikuti langkah di [PANDUAN_SETUP.md](PANDUAN_SETUP.md#L27-L36) untuk:
- Membuat Service Account
- Generate dan download file JSON key

### 2. Buka File JSON yang Didownload

File akan terlihat seperti ini:
```json
{
  "type": "service_account",
  "project_id": "absensi-rapat-123456",
  "private_key_id": "a1b2c3d4e5f6...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n(banyak baris)...\n-----END PRIVATE KEY-----\n",
  "client_email": "streamlit-gsheets@absensi-rapat-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  ...
}
```

### 3. Copy ke secrets.toml

Buka file `.streamlit/secrets.toml` dan **GANTI** setiap field:

```toml
app_url = "http://localhost:8501"

# Copy dari URL Google Sheets Anda
spreadsheet_key = "1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T"

[gcp_service_account]
type = "service_account"

# Copy dari JSON
project_id = "absensi-rapat-123456"

# Copy dari JSON
private_key_id = "a1b2c3d4e5f6..."

# PENTING: Copy SELURUH private_key dari JSON
# Pastikan \n tetap ada (jangan dihapus)
# Harus dalam satu baris dengan \n untuk setiap enter
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n-----END PRIVATE KEY-----\n"

# Copy dari JSON
client_email = "streamlit-gsheets@absensi-rapat-123456.iam.gserviceaccount.com"

# Copy dari JSON
client_id = "123456789012345678901"

auth_uri = "https://accounts.google.com/o/oauth2/auth"
token_uri = "https://oauth2.googleapis.com/token"
auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"

# Copy dari JSON
client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/streamlit-gsheets%40absensi-rapat-123456.iam.gserviceaccount.com"

universe_domain = "googleapis.com"
```

### 4. Share Google Sheets ke Service Account

1. Buka Google Sheets Anda
2. Klik tombol **Share** (di kanan atas)
3. Masukkan email `client_email` dari file JSON
   - Contoh: `streamlit-gsheets@absensi-rapat-123456.iam.gserviceaccount.com`
4. Pilih akses: **Editor**
5. **Hilangkan centang** "Notify people"
6. Klik **Share**

### 5. Copy Spreadsheet Key

Dari URL Google Sheets:
```
https://docs.google.com/spreadsheets/d/1a2B3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T/edit
                                      ↑ COPY BAGIAN INI ↑
```

Paste ke `spreadsheet_key` di secrets.toml

### 6. Restart Aplikasi

1. Tekan `Ctrl+C` di terminal untuk stop aplikasi
2. Jalankan lagi:
   ```bash
   python -m streamlit run app.py
   ```

3. Refresh browser

## ✅ Checklist

- [ ] File JSON sudah didownload dari Google Cloud
- [ ] Semua field di secrets.toml sudah diisi (tidak ada "your-project-id", dll)
- [ ] Private key sudah dicopy dengan benar (termasuk \n)
- [ ] Google Sheets sudah di-share ke service account email
- [ ] Service account diberi akses "Editor"
- [ ] Spreadsheet key sudah dicopy dengan benar
- [ ] Google Sheets API & Drive API sudah di-enable
- [ ] Aplikasi sudah di-restart

## 🆘 Masih Error?

Cek file [PANDUAN_SETUP.md](PANDUAN_SETUP.md#L161-L189) untuk troubleshooting lengkap.
