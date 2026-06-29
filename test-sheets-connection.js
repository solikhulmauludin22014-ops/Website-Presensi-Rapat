/**
 * Script untuk test koneksi ke Google Sheets
 * Jalankan dengan: node test-sheets-connection.js
 */

// Load .env.local secara manual
const fs = require('fs');
const path = require('path');

// Baca file .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^"|"$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('✅ File .env.local berhasil dibaca');
} else {
  console.log('❌ File .env.local tidak ditemukan');
}

// Cek apakah env variables ada
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

console.log('\n=== Cek Environment Variables ===');
console.log('GOOGLE_SHEET_ID:', SPREADSHEET_ID ? `✅ Ada (${SPREADSHEET_ID.substring(0, 20)}...)` : '❌ TIDAK ADA');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', SERVICE_ACCOUNT_EMAIL ? `✅ Ada (${SERVICE_ACCOUNT_EMAIL})` : '❌ TIDAK ADA');
console.log('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', SERVICE_ACCOUNT_PRIVATE_KEY ? `✅ Ada (${SERVICE_ACCOUNT_PRIVATE_KEY.substring(0, 40)}...)` : '❌ TIDAK ADA');

// Coba koneksi ke Google Sheets
async function testConnection() {
  console.log('\n=== Test Koneksi ke Google Sheets ===');

  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.log('❌ Tidak bisa test koneksi karena environment variables belum lengkap!');
    console.log('\nSilakan isi file .env.local dengan:');
    console.log('  GOOGLE_SHEET_ID=id-spreadsheet-anda');
    console.log('  GOOGLE_SERVICE_ACCOUNT_EMAIL=email@project.iam.gserviceaccount.com');
    console.log('  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n');
    return;
  }

  try {
    const { google } = require('googleapis');

    const privateKey = SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('⏳ Mencoba mengambil data dari Google Sheets...');

    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const spreadsheetTitle = response.data.properties?.title;
    const sheetNames = response.data.sheets?.map(s => s.properties?.title) ?? [];

    console.log('✅ KONEKSI BERHASIL!');
    console.log(`\nNama Spreadsheet: "${spreadsheetTitle}"`);
    console.log(`Sheet yang ada: ${sheetNames.length > 0 ? sheetNames.join(', ') : '(tidak ada sheet)'}`);

    // Cek apakah sheet Data_Rapat dan Data_Absensi ada
    console.log('\n=== Cek Sheet yang Diperlukan ===');
    const hasDataRapat = sheetNames.includes('Data_Rapat');
    const hasDataAbsensi = sheetNames.includes('Data_Absensi');
    console.log('Sheet "Data_Rapat":', hasDataRapat ? '✅ Ada' : '⚠️  Belum ada (akan dibuat otomatis saat pertama kali digunakan)');
    console.log('Sheet "Data_Absensi":', hasDataAbsensi ? '✅ Ada' : '⚠️  Belum ada (akan dibuat otomatis saat pertama kali digunakan)');

    if (hasDataRapat) {
      // Coba baca data rapat
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Data_Rapat!A:H',
      });
      const rows = dataResponse.data.values ?? [];
      console.log(`\nJumlah baris di Data_Rapat: ${rows.length > 0 ? rows.length - 1 : 0} data rapat`);
    }

    if (hasDataAbsensi) {
      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Data_Absensi!A:E',
      });
      const rows = dataResponse.data.values ?? [];
      console.log(`Jumlah baris di Data_Absensi: ${rows.length > 0 ? rows.length - 1 : 0} data absensi`);
    }

  } catch (error) {
    console.log('❌ KONEKSI GAGAL!');
    console.log('\nError:', error.message);

    if (error.message.includes('invalid_grant') || error.message.includes('DECODER')) {
      console.log('\n💡 Kemungkinan penyebab:');
      console.log('  - Private key tidak valid atau format salah');
      console.log('  - Waktu sistem tidak sinkron');
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      console.log('\n💡 Kemungkinan penyebab:');
      console.log('  - GOOGLE_SHEET_ID salah');
      console.log('  - Spreadsheet belum di-share ke service account email');
    } else if (error.message.includes('403') || error.message.includes('permission')) {
      console.log('\n💡 Kemungkinan penyebab:');
      console.log('  - Service account tidak punya akses ke spreadsheet');
      console.log(`  - Share spreadsheet ke: ${SERVICE_ACCOUNT_EMAIL}`);
      console.log('  - Berikan akses "Editor"');
    } else if (error.message.includes('belum diatur') || error.message.includes('not set')) {
      console.log('\n💡 Environment variable belum diatur');
    }
  }
}

testConnection();
