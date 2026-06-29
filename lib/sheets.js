import { google } from 'googleapis';

// Environment variables will be read dynamically inside the functions
// to ensure they are captured correctly at runtime on Vercel.

const MEETING_HEADERS = ['Meeting ID', 'Judul', 'Tanggal', 'Waktu', 'Lokasi', 'Pimpinan', 'Timestamp Dibuat', 'Status', 'Notulensi'];
const ATTENDANCE_HEADERS = ['Meeting ID', 'Nama', 'NIP', 'Timestamp', 'Signature'];

let cachedSheetsClient = null;

// function requireEnv diubah menjadi getEnv di bawah

function decodePrivateKey(value) {
  return value.replace(/\\n/g, '\n');
}

function formatWibTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function generateMeetingId() {
  const stamp = formatWibTimestamp().replace(/[-:\s]/g, '').replace(',', '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MTG${stamp}${suffix}`;
}

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} belum diatur.`);
  }
  return value;
}

function getSpreadsheetId() {
  return getEnv('GOOGLE_SHEET_ID');
}

function getSheetsClient() {
  const SERVICE_ACCOUNT_EMAIL = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const SERVICE_ACCOUNT_PRIVATE_KEY = getEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

  if (!cachedSheetsClient) {
    const auth = new google.auth.JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: decodePrivateKey(SERVICE_ACCOUNT_PRIVATE_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    cachedSheetsClient = google.sheets({ version: 'v4', auth });
  }

  return cachedSheetsClient;
}

async function ensureNotulensiColumn() {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: 'Data_Rapat!A1:Z1',
    });
    const currentHeaders = response.data.values?.[0] ?? [];

    if (!currentHeaders.includes('Notulensi')) {
      const colIndex = currentHeaders.length;
      // Support columns A-Z
      const colLetter = colIndex < 26
        ? String.fromCharCode(65 + colIndex)
        : 'A' + String.fromCharCode(65 + colIndex - 26);

      await sheets.spreadsheets.values.update({
        spreadsheetId: getSpreadsheetId(),
        range: `Data_Rapat!${colLetter}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Notulensi']] },
      });
    }
  } catch {
    // Abaikan error — sheet mungkin belum dibuat
  }
}

async function ensureWorksheet(title, headers) {
  const sheets = getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
  const sheetExists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === title);

  if (!sheetExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: getSpreadsheetId(),
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }

  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${title}!A1:Z1`,
  });

  const currentHeaders = headerResponse.data.values?.[0] ?? [];
  const needsHeaders = currentHeaders.length === 0 || currentHeaders.every((cell) => String(cell).trim() === '');

  if (needsHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}

async function readTable(title, headers) {
  await ensureWorksheet(title, headers);

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${title}!A:Z`,
  });

  const values = response.data.values ?? [];
  if (values.length === 0) {
    return [];
  }

  const rawHeaders = values[0].map((value) => String(value).trim());
  return values
    .slice(1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ''))
    .map((row) => {
      const normalizedRow = [...row];
      while (normalizedRow.length < rawHeaders.length) {
        normalizedRow.push('');
      }

      const entry = {};
      rawHeaders.forEach((header, index) => {
        entry[header] = String(normalizedRow[index] ?? '').trim();
      });
      return entry;
    });
}

export async function getMeetings() {
  const meetings = await readTable('Data_Rapat', MEETING_HEADERS);

  return meetings
    .map((meeting) => ({
      meetingId: meeting['Meeting ID'] ?? '',
      title: meeting.Judul ?? '',
      meetingDate: meeting.Tanggal ?? '',
      meetingTime: meeting.Waktu ?? '',
      location: meeting.Lokasi ?? '',
      leader: meeting.Pimpinan ?? '',
      timestamp: meeting['Timestamp Dibuat'] ?? '',
      status: meeting.Status ?? 'Aktif',
      notulensi: meeting.Notulensi ?? '',
    }))
    .filter((meeting) => meeting.meetingId)
    .reverse();
}

export async function getMeetingById(meetingId) {
  const meetings = await getMeetings();
  return meetings.find((meeting) => meeting.meetingId === meetingId) ?? null;
}

export async function getAttendancesByMeetingId(meetingId) {
  const attendances = await readTable('Data_Absensi', ATTENDANCE_HEADERS);

  return attendances
    .filter((attendance) => attendance['Meeting ID'] === meetingId)
    .map((attendance) => ({
      meetingId: attendance['Meeting ID'] ?? '',
      name: attendance.Nama ?? '',
      nip: attendance.NIP ?? '',
      timestamp: attendance.Timestamp ?? '',
      signatureBase64: attendance.Signature ?? '',
    }));
}

export async function createMeeting(payload) {
  const meeting = {
    meetingId: generateMeetingId(),
    title: String(payload.title ?? '').trim(),
    meetingDate: String(payload.meetingDate ?? '').trim(),
    meetingTime: String(payload.meetingTime ?? '').trim(),
    location: String(payload.location ?? '').trim(),
    leader: String(payload.leader ?? '').trim(),
    status: String(payload.status ?? 'Aktif').trim() || 'Aktif',
    timestamp: formatWibTimestamp(),
  };

  if (!meeting.title || !meeting.meetingDate || !meeting.meetingTime || !meeting.location || !meeting.leader) {
    throw new Error('Semua field rapat wajib diisi.');
  }

  await ensureWorksheet('Data_Rapat', MEETING_HEADERS);

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: 'Data_Rapat!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        meeting.meetingId,
        meeting.title,
        meeting.meetingDate,
        meeting.meetingTime,
        meeting.location,
        meeting.leader,
        meeting.timestamp,
        meeting.status,
        '', // notulensi kosong saat dibuat
      ]],
    },
  });

  return meeting;
}

export async function updateMeeting(meetingId, payload) {
  // Pastikan kolom Notulensi ada (backward compat untuk sheet lama)
  await ensureNotulensiColumn();
  await ensureWorksheet('Data_Rapat', MEETING_HEADERS);

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: 'Data_Rapat!A:I',
  });

  const rows = response.data.values ?? [];
  // baris ke-0 adalah header, data mulai dari baris ke-1
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && String(row[0]).trim() === meetingId);

  if (rowIndex === -1) {
    const error = new Error('Rapat tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Sheet baris dimulai dari 1, header di baris 1, data di baris 2+
  const sheetRowNumber = rowIndex + 1;
  const existingRow = rows[rowIndex];

  const updatedRow = [
    meetingId,
    String(payload.title ?? existingRow[1] ?? '').trim(),
    String(payload.meetingDate ?? existingRow[2] ?? '').trim(),
    String(payload.meetingTime ?? existingRow[3] ?? '').trim(),
    String(payload.location ?? existingRow[4] ?? '').trim(),
    String(payload.leader ?? existingRow[5] ?? '').trim(),
    existingRow[6] ?? formatWibTimestamp(), // timestamp dibuat tidak berubah
    String(payload.status ?? existingRow[7] ?? 'Aktif').trim(),
    String(payload.notulensi ?? existingRow[8] ?? ''), // notulensi
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `Data_Rapat!A${sheetRowNumber}:I${sheetRowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [updatedRow] },
  });

  return {
    meetingId,
    title: updatedRow[1],
    meetingDate: updatedRow[2],
    meetingTime: updatedRow[3],
    location: updatedRow[4],
    leader: updatedRow[5],
    timestamp: updatedRow[6],
    status: updatedRow[7],
    notulensi: updatedRow[8],
  };
}


export async function deleteMeeting(meetingId) {
  await ensureWorksheet('Data_Rapat', MEETING_HEADERS);

  const sheets = getSheetsClient();

  // Dapatkan metadata sheet untuk mendapatkan sheetId
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: getSpreadsheetId() });
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === 'Data_Rapat');
  if (!sheet) throw new Error('Worksheet Data_Rapat tidak ditemukan.');
  const sheetId = sheet.properties.sheetId;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: 'Data_Rapat!A:A',
  });

  const rows = response.data.values ?? [];
  const rowIndex = rows.findIndex((row, idx) => idx > 0 && String(row[0]).trim() === meetingId);

  if (rowIndex === -1) {
    const error = new Error('Rapat tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  // Hapus baris menggunakan batchUpdate (0-indexed)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,     // 0-indexed
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return { deleted: true, meetingId };
}

export async function createAttendance(payload) {
  const meetingId = String(payload.meetingId ?? '').trim();
  const name = String(payload.name ?? '').trim();
  const nip = String(payload.nip ?? '').trim();
  const signatureBase64 = String(payload.signatureBase64 ?? '').trim();

  if (!meetingId || !name || !nip || !signatureBase64) {
    throw new Error('Meeting ID, nama, NIP, dan tanda tangan wajib diisi.');
  }

  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    const error = new Error('Rapat tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  const attendances = await getAttendancesByMeetingId(meetingId);
  const duplicate = attendances.some((attendance) => attendance.nip === nip);
  if (duplicate) {
    const error = new Error('NIP ini sudah absen untuk rapat ini.');
    error.statusCode = 409;
    throw error;
  }

  await ensureWorksheet('Data_Absensi', ATTENDANCE_HEADERS);

  const sheets = getSheetsClient();
  const timestamp = formatWibTimestamp();

  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: 'Data_Absensi!A:E',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[meetingId, name, nip, timestamp, signatureBase64]],
    },
  });

  return {
    meetingId,
    name,
    nip,
    timestamp,
  };
}

export function getPublicAttendanceUrl(origin, meetingId) {
  const cleanOrigin = String(origin ?? '').replace(/\/$/, '');
  return `${cleanOrigin}/a/${meetingId}`;
}
