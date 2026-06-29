import streamlit as st
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from fpdf import FPDF
from datetime import datetime
import pandas as pd
import json

# Konfigurasi halaman
st.set_page_config(
    page_title="Sistem Absensi & Notulensi Rapat",
    page_icon="📋",
    layout="wide"
)

# Data hardcoded guru/staf
DAFTAR_GURU = [
    "Budi Santoso, S.Pd (Guru Matematika)",
    "Siti Nurhaliza, M.Pd (Guru Bahasa Indonesia)",
    "Ahmad Fauzi, S.Si (Guru Biologi)",
    "Dewi Lestari, S.Pd (Guru Bahasa Inggris)",
    "Eko Prasetyo, S.Kom (Guru TIK)",
    "Ratna Sari, S.Pd (Guru PKn)",
    "Muhammad Rizki, S.Pd (Guru Olahraga)",
    "Linda Wijaya, S.Pd (Guru Seni Budaya)",
    "Hendra Gunawan, M.Pd (Wakil Kepala Sekolah)",
    "Sri Mulyani, S.Pd (Guru BK)"
]

# Fungsi koneksi Google Sheets
@st.cache_resource
def connect_to_gsheet():
    """Koneksi ke Google Sheets menggunakan credentials dari secrets"""
    try:
        # Ambil credentials dari secrets
        credentials_dict = dict(st.secrets["gcp_service_account"])
        
        # Setup scope
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        
        # Authenticate
        credentials = ServiceAccountCredentials.from_json_keyfile_dict(
            credentials_dict, scope
        )
        client = gspread.authorize(credentials)
        
        # Buka spreadsheet (gunakan URL atau key dari secrets)
        sheet = client.open_by_key(st.secrets["spreadsheet_key"])
        worksheet = sheet.get_worksheet(0)  # Sheet pertama
        
        return worksheet
    except Exception as e:
        st.error(f"Gagal koneksi ke Google Sheets: {str(e)}")
        return None

def save_to_gsheet(worksheet, data):
    """Simpan data ke Google Sheets"""
    try:
        # Append row baru
        worksheet.append_row(data)
        return True
    except Exception as e:
        st.error(f"Gagal menyimpan data: {str(e)}")
        return False

class PDFNotulensi(FPDF):
    """Class untuk generate PDF Notulensi Rapat"""
    
    def header(self):
        """Header/Kop Surat"""
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'SMA NEGERI 1 CONTOH', 0, 1, 'C')
        self.set_font('Arial', '', 10)
        self.cell(0, 5, 'Jl. Pendidikan No. 123, Kota Contoh', 0, 1, 'C')
        self.cell(0, 5, 'Telp: (021) 12345678 | Email: info@sman1contoh.sch.id', 0, 1, 'C')
        
        # Garis pembatas
        self.ln(3)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)
    
    def footer(self):
        """Footer halaman"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Halaman {self.page_no()}', 0, 0, 'C')

def generate_pdf(data_rapat, peserta_hadir, peserta_tamu, notulensi):
    """Generate PDF Notulensi Rapat"""
    
    pdf = PDFNotulensi()
    pdf.add_page()
    
    # Judul Dokumen
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, 'NOTULENSI RAPAT', 0, 1, 'C')
    pdf.ln(5)
    
    # Detail Rapat
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(40, 7, 'DETAIL RAPAT', 0, 1)
    pdf.set_font('Arial', '', 10)
    
    details = [
        ('Judul Rapat', data_rapat['judul']),
        ('Tanggal', data_rapat['tanggal']),
        ('Waktu', data_rapat['waktu']),
        ('Lokasi', data_rapat['lokasi']),
        ('Pimpinan Rapat', data_rapat['pimpinan'])
    ]
    
    for label, value in details:
        pdf.cell(40, 6, f'{label}:', 0, 0)
        pdf.cell(0, 6, value, 0, 1)
    
    pdf.ln(5)
    
    # Daftar Hadir
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 7, 'DAFTAR HADIR', 0, 1)
    
    # Tabel daftar hadir
    pdf.set_font('Arial', 'B', 9)
    pdf.set_fill_color(200, 220, 255)
    pdf.cell(10, 7, 'No', 1, 0, 'C', True)
    pdf.cell(130, 7, 'Nama Peserta', 1, 0, 'C', True)
    pdf.cell(50, 7, 'Keterangan', 1, 1, 'C', True)
    
    pdf.set_font('Arial', '', 9)
    no = 1
    
    # Peserta dari daftar guru
    for peserta in peserta_hadir:
        pdf.cell(10, 6, str(no), 1, 0, 'C')
        pdf.cell(130, 6, peserta, 1, 0)
        pdf.cell(50, 6, 'Hadir', 1, 1, 'C')
        no += 1
    
    # Peserta tamu
    if peserta_tamu:
        for tamu in peserta_tamu.split('\n'):
            if tamu.strip():
                pdf.cell(10, 6, str(no), 1, 0, 'C')
                pdf.cell(130, 6, tamu.strip(), 1, 0)
                pdf.cell(50, 6, 'Tamu', 1, 1, 'C')
                no += 1
    
    pdf.ln(5)
    
    # Isi Notulensi
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 7, 'ISI NOTULENSI', 0, 1)
    pdf.set_font('Arial', '', 10)
    
    # Multi-line text untuk notulensi
    pdf.multi_cell(0, 6, notulensi)
    
    pdf.ln(10)
    
    # Tanda tangan
    pdf.set_font('Arial', '', 10)
    
    # Kolom kiri: Notulis
    x_start = pdf.get_x()
    y_start = pdf.get_y()
    
    pdf.cell(95, 6, f'Contoh, {data_rapat["tanggal"]}', 0, 1)
    
    # Notulis
    pdf.cell(95, 6, 'Notulis,', 0, 0)
    # Kepala Sekolah
    pdf.cell(95, 6, 'Mengetahui,', 0, 1)
    
    pdf.ln(15)
    
    # Nama dan garis
    pdf.set_font('Arial', 'U', 10)
    pdf.cell(95, 6, '(____________________)', 0, 0, 'C')
    pdf.cell(95, 6, data_rapat['pimpinan'], 0, 1, 'C')
    
    pdf.set_font('Arial', '', 9)
    pdf.cell(95, 5, '', 0, 0)
    pdf.cell(95, 5, 'Kepala Sekolah', 0, 1, 'C')
    
    # Output PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"Notulensi_Rapat_{timestamp}.pdf"
    pdf.output(filename)
    
    return filename

def main():
    """Fungsi utama aplikasi"""
    
    # Header aplikasi
    st.title("📋 Sistem Absensi & Notulensi Rapat Sekolah")
    st.markdown("---")
    
    # Sidebar info
    with st.sidebar:
        st.image("https://via.placeholder.com/150x150.png?text=Logo+Sekolah", width=150)
        st.markdown("### SMA Negeri 1 Contoh")
        st.info("Aplikasi ini untuk mencatat absensi dan notulensi rapat sekolah secara digital.")
        
        st.markdown("---")
        st.markdown("**Status Koneksi:**")
        worksheet = connect_to_gsheet()
        if worksheet:
            st.success("✅ Terhubung ke Google Sheets")
        else:
            st.error("❌ Gagal terhubung")
    
    # Form Input Data Rapat
    st.header("1️⃣ Data Rapat")
    col1, col2 = st.columns(2)
    
    with col1:
        judul_rapat = st.text_input(
            "Judul Rapat *",
            placeholder="Contoh: Rapat Koordinasi Semester Genap"
        )
        
        tanggal_rapat = st.date_input(
            "Tanggal Rapat *",
            value=datetime.now()
        )
        
        lokasi_rapat = st.text_input(
            "Lokasi Rapat *",
            placeholder="Contoh: Ruang Guru"
        )
    
    with col2:
        waktu_rapat = st.time_input(
            "Waktu Rapat *",
            value=datetime.now().time()
        )
        
        pimpinan_rapat = st.text_input(
            "Pimpinan Rapat *",
            placeholder="Contoh: Drs. Bambang Sutopo, M.Pd"
        )
    
    st.markdown("---")
    
    # Form Absensi
    st.header("2️⃣ Daftar Kehadiran")
    col1, col2 = st.columns([2, 1])
    
    with col1:
        peserta_hadir = st.multiselect(
            "Pilih Peserta Hadir (Guru/Staf) *",
            options=DAFTAR_GURU,
            help="Pilih satu atau lebih peserta yang hadir"
        )
    
    with col2:
        peserta_tamu = st.text_area(
            "Peserta Tamu (Opsional)",
            placeholder="Tulis nama tamu, satu nama per baris\nContoh:\nDr. Ahmad (Komite)\nIbu Susi (Orang Tua)",
            height=150
        )
    
    st.markdown("---")
    
    # Form Notulensi
    st.header("3️⃣ Isi Notulensi")
    notulensi = st.text_area(
        "Tulis Hasil Pembahasan Rapat *",
        placeholder="""Contoh:

1. PEMBUKAAN
   Rapat dibuka oleh Kepala Sekolah pada pukul 09.00 WIB dengan mengucapkan salam dan doa.

2. PEMBAHASAN
   a. Evaluasi kegiatan semester ganjil
   b. Perencanaan program semester genap
   c. Pembagian tugas mengajar

3. KESIMPULAN & KEPUTUSAN
   - Disepakati program tambahan les untuk kelas XII
   - Jadwal ujian tengah semester: 15-20 Maret 2026
   
4. PENUTUP
   Rapat ditutup pukul 11.30 WIB dengan doa dan salam.""",
        height=300
    )
    
    st.markdown("---")
    
    # Tombol Simpan & Generate PDF
    col1, col2, col3 = st.columns([1, 1, 2])
    
    with col1:
        submit_button = st.button(
            "💾 Simpan & Generate PDF",
            type="primary",
            use_container_width=True
        )
    
    with col2:
        if st.button("🔄 Reset Form", use_container_width=True):
            st.rerun()
    
    # Proses submit
    if submit_button:
        # Validasi input
        errors = []
        if not judul_rapat:
            errors.append("Judul Rapat harus diisi")
        if not lokasi_rapat:
            errors.append("Lokasi Rapat harus diisi")
        if not pimpinan_rapat:
            errors.append("Pimpinan Rapat harus diisi")
        if not peserta_hadir:
            errors.append("Minimal harus ada 1 peserta hadir")
        if not notulensi:
            errors.append("Isi Notulensi harus diisi")
        
        if errors:
            st.error("❌ **Form belum lengkap:**")
            for error in errors:
                st.error(f"• {error}")
        else:
            with st.spinner("🔄 Sedang memproses..."):
                # Persiapkan data
                data_rapat = {
                    'judul': judul_rapat,
                    'tanggal': tanggal_rapat.strftime("%d-%m-%Y"),
                    'waktu': waktu_rapat.strftime("%H:%M"),
                    'lokasi': lokasi_rapat,
                    'pimpinan': pimpinan_rapat
                }
                
                # Generate PDF
                try:
                    pdf_filename = generate_pdf(
                        data_rapat,
                        peserta_hadir,
                        peserta_tamu,
                        notulensi
                    )
                    
                    # Simpan ke Google Sheets
                    if worksheet:
                        row_data = [
                            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            judul_rapat,
                            data_rapat['tanggal'],
                            data_rapat['waktu'],
                            lokasi_rapat,
                            pimpinan_rapat,
                            ", ".join(peserta_hadir),
                            peserta_tamu,
                            notulensi
                        ]
                        
                        if save_to_gsheet(worksheet, row_data):
                            st.success("✅ Data berhasil disimpan ke Google Sheets!")
                        else:
                            st.warning("⚠️ PDF berhasil dibuat, tapi gagal menyimpan ke Google Sheets")
                    
                    # Download PDF
                    with open(pdf_filename, "rb") as pdf_file:
                        pdf_bytes = pdf_file.read()
                        st.download_button(
                            label="📥 Download PDF Notulensi",
                            data=pdf_bytes,
                            file_name=pdf_filename,
                            mime="application/pdf",
                            use_container_width=True
                        )
                    
                    st.success(f"✅ PDF berhasil dibuat: {pdf_filename}")
                    st.balloons()
                    
                except Exception as e:
                    st.error(f"❌ Gagal membuat PDF: {str(e)}")
    
    # Footer
    st.markdown("---")
    st.markdown(
        "<div style='text-align: center; color: gray; font-size: 12px;'>"
        "© 2026 SMA Negeri 1 Contoh | Sistem Absensi & Notulensi Rapat v1.0"
        "</div>",
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()
