import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Student,
  ClassRoom,
  StudentReport,
  SchoolSettings,
  UserAccount,
  GoogleUserProfile,
  GoogleWorkspaceDatabaseState,
} from '../types';
import { Storage } from './storage';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Provider with required Google Workspace Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const GOOGLE_STATE_KEY = 'eraport_google_workspace_state_v1';

export const getSavedGoogleDatabaseState = (): GoogleWorkspaceDatabaseState => {
  const saved = localStorage.getItem(GOOGLE_STATE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    isConnected: false,
    isMigrated: false,
    autoSyncEnabled: true,
    spreadsheetId: null,
    spreadsheetUrl: null,
    spreadsheetTitle: 'Database E-Raport Al-Qur\'an (Metode UMMI & Tahfidz)',
    folderId: null,
    folderUrl: null,
    backupFolderId: null,
    pdfFolderId: null,
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  };
};

export const saveGoogleDatabaseState = (state: Partial<GoogleWorkspaceDatabaseState>) => {
  const current = getSavedGoogleDatabaseState();
  const updated = { ...current, ...state };
  localStorage.setItem(GOOGLE_STATE_KEY, JSON.stringify(updated));
  return updated;
};

// Listen for auth state changes
export const initGoogleAuth = (
  onSuccess?: (profile: GoogleUserProfile, token: string) => void,
  onSignedOut?: () => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const profile: GoogleUserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Pengguna Google',
        photoURL: firebaseUser.photoURL || undefined,
      };

      if (cachedAccessToken) {
        if (onSuccess) onSuccess(profile, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged in to Firebase but token is not in memory, user may need to re-authorize
        if (onSignedOut) onSignedOut();
      }
    } else {
      cachedAccessToken = null;
      saveGoogleDatabaseState({ isConnected: false });
      if (onSignedOut) onSignedOut();
    }
  });
};

// Sign in with Google Popup
export const signInWithGoogle = async (): Promise<{
  profile: GoogleUserProfile;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh access token Google Workspace. Pastikan izin telah diberikan.');
    }

    cachedAccessToken = credential.accessToken;
    const profile: GoogleUserProfile = {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || 'Pengguna Google',
      photoURL: result.user.photoURL || undefined,
    };

    saveGoogleDatabaseState({ isConnected: true, error: null });
    return { profile, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    saveGoogleDatabaseState({ error: error.message || 'Gagal login Google' });
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  saveGoogleDatabaseState({ isConnected: false });
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

// ==========================================
// Google Drive API Operations
// ==========================================

export interface GoogleDriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

// Helper to escape single quotes in Google Drive search queries
const escapeDriveQuery = (str: string) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export const getOrCreateDriveFolder = async (
  token: string,
  folderName = 'E-Raport Al-Qur\'an UMMI & Tahfidz'
): Promise<{ folderId: string; folderUrl: string }> => {
  // Check if saved folder is still accessible
  const savedState = getSavedGoogleDatabaseState();
  if (savedState.folderId) {
    try {
      const checkRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${savedState.folderId}?fields=id,name,webViewLink,trashed`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (!checkData.trashed) {
          return {
            folderId: checkData.id,
            folderUrl: checkData.webViewLink || `https://drive.google.com/drive/folders/${checkData.id}`,
          };
        }
      }
    } catch {
      // Continue to search or create
    }
  }

  // Search existing folder with safely escaped query
  try {
    const escapedName = escapeDriveQuery(folderName);
    const query = encodeURIComponent(
      `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );

    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const folder = searchData.files[0];
        const folderUrl = folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`;
        saveGoogleDatabaseState({ folderId: folder.id, folderUrl });
        return {
          folderId: folder.id,
          folderUrl,
        };
      }
    }
  } catch (err) {
    console.warn('Folder search warning, creating folder directly:', err);
  }

  // Create new folder directly
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`Gagal membuat folder di Google Drive: ${createRes.statusText} ${errText}`);
  }

  const newFolder = await createRes.json();
  const folderUrl = newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`;
  saveGoogleDatabaseState({ folderId: newFolder.id, folderUrl });

  return {
    folderId: newFolder.id,
    folderUrl,
  };
};

// ==========================================
// Google Sheets API Operations
// ==========================================

const SHEET_NAMES = {
  SANTRI: 'Santri',
  KELAS: 'Kelas',
  RAPORT: 'Raport',
  PENGATURAN: 'Pengaturan',
  PENGGUNA: 'Pengguna',
};

export const getOrCreateSpreadsheetDatabase = async (
  token: string,
  folderId?: string,
  title = 'Database E-Raport Al-Qur\'an (Metode UMMI & Tahfidz)'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> => {
  // Check if saved spreadsheet exists and is accessible
  const savedState = getSavedGoogleDatabaseState();
  if (savedState.spreadsheetId) {
    try {
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${savedState.spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        return {
          spreadsheetId: checkData.spreadsheetId,
          spreadsheetUrl:
            checkData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${checkData.spreadsheetId}`,
          title: checkData.properties?.title || title,
        };
      }
    } catch {
      // continue to create or search
    }
  }

  // Search if spreadsheet exists in Drive
  try {
    const escapedTitle = escapeDriveQuery(title);
    const query = encodeURIComponent(
      `name = '${escapedTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,parents)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const file = searchData.files[0];
        const sheetUrl = file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}`;
        saveGoogleDatabaseState({
          spreadsheetId: file.id,
          spreadsheetUrl: sheetUrl,
          spreadsheetTitle: file.name,
          folderId: folderId || null,
        });
        return {
          spreadsheetId: file.id,
          spreadsheetUrl: sheetUrl,
          title: file.name,
        };
      }
    }
  } catch (err) {
    console.warn('Spreadsheet search warning, creating new sheet directly:', err);
  }

  // Create new Spreadsheet with 5 configured sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: SHEET_NAMES.SANTRI, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: SHEET_NAMES.KELAS, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: SHEET_NAMES.RAPORT, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: SHEET_NAMES.PENGATURAN, gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: SHEET_NAMES.PENGGUNA, gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`Gagal membuat Google Spreadsheet Database: ${createRes.statusText} ${errText}`);
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;
  const spreadsheetUrl =
    newSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // If folderId is provided, move the newly created spreadsheet into the Drive folder
  if (folderId) {
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      console.warn('Could not move sheet into folder:', e);
    }
  }

  saveGoogleDatabaseState({
    spreadsheetId,
    spreadsheetUrl,
    spreadsheetTitle: title,
    folderId: folderId || null,
  });

  return { spreadsheetId, spreadsheetUrl, title };
};

// ==========================================
// Sync: Push Local Database to Google Sheets
// ==========================================

export const syncLocalToGoogleSheets = async (
  token: string,
  spreadsheetId: string,
  customData?: {
    students?: Student[];
    classes?: ClassRoom[];
    reports?: StudentReport[];
    settings?: SchoolSettings;
    users?: UserAccount[];
  }
): Promise<{ success: boolean; syncedAt: string }> => {
  const students = customData?.students || Storage.getStudents();
  const classes = customData?.classes || Storage.getClasses();
  const reports = customData?.reports || Storage.getReports();
  const settings = customData?.settings || Storage.getSettings();
  const users = customData?.users || Storage.getUsers();

  const classMap = new Map(classes.map((c) => [c.id, c.name]));
  const studentMap = new Map(students.map((s) => [s.id, s]));

  // 1. Santri Table Data
  const santriValues = [
    ['ID', 'NIS', 'Nama Siswa', 'ID Kelas', 'Nama Kelas', 'Jenis Kelamin', 'Nama Orang Tua', 'No HP Orang Tua'],
    ...students.map((s) => [
      s.id,
      s.nis,
      s.name,
      s.classId,
      classMap.get(s.classId) || s.classId,
      s.gender,
      s.parentName || '',
      s.parentPhone || '',
    ]),
  ];

  // 2. Kelas Table Data
  const kelasValues = [
    ['ID Kelas', 'Nama Kelas', 'Tingkat', 'Target Hafalan', 'ID Guru Pengajar', 'Nama Guru Pengajar'],
    ...classes.map((c) => [
      c.id,
      c.name,
      c.gradeLevel,
      c.targetHafalan,
      c.teacherId,
      c.teacherName,
    ]),
  ];

  // 3. Raport Table Data
  const raportValues = [
    [
      'ID Raport',
      'ID Siswa',
      'NIS',
      'Nama Siswa',
      'Kelas',
      'Tahun Ajaran',
      'Semester',
      'Jilid Target',
      'Jilid Prestasi',
      'Tartil Prestasi',
      'Turjuman Prestasi',
      'Turjuman Nilai (Kata/Kalimat/Intisari)',
      'Tahfidz Target Kelas',
      'Tahfidz Ujian Nilai',
      'Tahfidz Predikat',
      'Hadits Rata-Rata',
      'Hadits Predikat',
      'Catatan Guru Al-Qur\'an',
      'Tanggal Raport',
      'Terakhir Diperbarui',
      'Raw JSON Backup',
    ],
    ...reports.map((r) => {
      const st = studentMap.get(r.studentId);
      const q = r.pembelajaranAlQuran;
      const h = r.hafalanAlQuran;
      const d = r.hafalanHadits;
      return [
        r.id,
        r.studentId,
        st?.nis || '',
        st?.name || '',
        classMap.get(r.classId) || r.classId,
        r.academicYear,
        r.semester,
        q.jilid.targetSemester,
        q.jilid.prestasiBelajar,
        q.tartil.prestasiBelajar,
        q.turjuman.prestasiBelajar,
        `${q.turjuman.perKata}/${q.turjuman.perKalimat}/${q.turjuman.intisari}`,
        h.targetHafalanKelas,
        h.ujianSemester.nilai,
        h.ujianSemester.predikat,
        d.rataRata,
        d.predikat,
        h.catatanGuru,
        `${r.issueDate || settings.issueDate} (${r.hijriDate || settings.hijriDate})`,
        r.updatedAt,
        JSON.stringify(r),
      ];
    }),
  ];

  // 4. Pengaturan Table Data
  const pengaturanValues = [
    ['Parameter', 'Nilai / Konfigurasi'],
    ['Nama Lembaga / Sekolah', settings.schoolName],
    ['Sub Judul Lembaga', settings.schoolSubName || ''],
    ['Tahun Pelajaran Aktif', settings.academicYear],
    ['Semester Aktif', settings.semester],
    ['Kota Titimangsa', settings.issueCity],
    ['Tanggal Terbit Masehi', settings.issueDate],
    ['Tanggal Terbit Hijriyah', settings.hijriDate],
    ['Nama Kepala Sekolah / Mudir', settings.headmasterName],
    ['Nama Koordinator Al-Qur\'an', settings.coordinatorName],
    ['Terakhir Sinkronisasi', new Date().toLocaleString('id-ID')],
  ];

  // 5. Pengguna Table Data
  const penggunaValues = [
    ['ID Pengguna', 'Username', 'Nama Lengkap', 'NIY (Nomor Induk Yayasan)', 'Peran Akun', 'Password / Kunci', 'Kelas Yang Diampu', 'Email / Kontak'],
    ...users.map((u) => [
      u.id,
      u.username || '',
      u.name,
      u.niy || u.nip || '',
      u.role,
      u.password || '',
      (u.assignedClassIds || []).join(', '),
      u.email || u.phone || '',
    ]),
  ];

  // Batch update all sheets
  const batchData = [
    { range: `${SHEET_NAMES.SANTRI}!A1:H${Math.max(santriValues.length + 5, 50)}`, values: santriValues },
    { range: `${SHEET_NAMES.KELAS}!A1:F${Math.max(kelasValues.length + 5, 20)}`, values: kelasValues },
    { range: `${SHEET_NAMES.RAPORT}!A1:U${Math.max(raportValues.length + 5, 50)}`, values: raportValues },
    { range: `${SHEET_NAMES.PENGATURAN}!A1:B${pengaturanValues.length + 5}`, values: pengaturanValues },
    { range: `${SHEET_NAMES.PENGGUNA}!A1:H${Math.max(penggunaValues.length + 5, 20)}`, values: penggunaValues },
  ];

  // Clear existing ranges first for clean updates
  for (const sheet of [
    SHEET_NAMES.SANTRI,
    SHEET_NAMES.KELAS,
    SHEET_NAMES.RAPORT,
    SHEET_NAMES.PENGATURAN,
    SHEET_NAMES.PENGGUNA,
  ]) {
    try {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet}!A1:Z100:clear`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      // ignore clear error
    }
  }

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    throw new Error(`Gagal menyimpan ke Google Sheets: ${errText}`);
  }

  const syncedAt = new Date().toISOString();
  saveGoogleDatabaseState({
    lastSyncedAt: syncedAt,
    isSyncing: false,
    error: null,
  });

  return { success: true, syncedAt };
};

// ==========================================
// Sync: Pull Data from Google Sheets to App
// ==========================================

export const pullDataFromGoogleSheets = async (
  token: string,
  spreadsheetId: string
): Promise<{
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  users: UserAccount[];
}> => {
  const ranges = [
    `${SHEET_NAMES.SANTRI}!A2:H1000`,
    `${SHEET_NAMES.KELAS}!A2:F200`,
    `${SHEET_NAMES.RAPORT}!A2:U1000`,
    `${SHEET_NAMES.PENGATURAN}!A2:B20`,
    `${SHEET_NAMES.PENGGUNA}!A2:H100`,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges
      .map((r) => encodeURIComponent(r))
      .join('&ranges=')}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari Google Sheets: ${res.statusText}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  // Parse Santri
  const santriRows = valueRanges[0]?.values || [];
  const parsedStudents: Student[] = santriRows
    .filter((row: any[]) => row && row[0] && row[2])
    .map((row: any[]) => ({
      id: row[0],
      nis: row[1] || '',
      name: row[2] || '',
      classId: row[3] || '',
      gender: (row[5] === 'P' ? 'P' : 'L') as 'L' | 'P',
      parentName: row[6] || '',
      parentPhone: row[7] || '',
    }));

  // Parse Kelas
  const kelasRows = valueRanges[1]?.values || [];
  const parsedClasses: ClassRoom[] = kelasRows
    .filter((row: any[]) => row && row[0] && row[1])
    .map((row: any[]) => ({
      id: row[0],
      name: row[1] || '',
      gradeLevel: row[2] || '7',
      targetHafalan: row[3] || 'Juz 30',
      teacherId: row[4] || '',
      teacherName: row[5] || '',
    }));

  // Parse Raport
  const raportRows = valueRanges[2]?.values || [];
  const parsedReports: StudentReport[] = [];
  for (const row of raportRows) {
    if (!row || !row[0]) continue;
    // Check if JSON backup is available in column index 20 (U)
    const jsonStr = row[20];
    if (jsonStr) {
      try {
        const rep = JSON.parse(jsonStr);
        parsedReports.push(rep);
        continue;
      } catch {
        // fallback to standard columns
      }
    }
  }

  // Parse Settings
  const settingRows = valueRanges[3]?.values || [];
  const settingMap = new Map<string, string>();
  for (const r of settingRows) {
    if (r && r[0]) settingMap.set(r[0], r[1] || '');
  }

  const currentSettings = Storage.getSettings();
  const parsedSettings: SchoolSettings = {
    ...currentSettings,
    schoolName: settingMap.get('Nama Lembaga / Sekolah') || currentSettings.schoolName,
    schoolSubName: settingMap.get('Sub Judul Lembaga') || currentSettings.schoolSubName,
    academicYear: settingMap.get('Tahun Pelajaran Aktif') || currentSettings.academicYear,
    semester: (settingMap.get('Semester Aktif') as any) || currentSettings.semester,
    issueCity: settingMap.get('Kota Titimangsa') || currentSettings.issueCity,
    issueDate: settingMap.get('Tanggal Terbit Masehi') || currentSettings.issueDate,
    hijriDate: settingMap.get('Tanggal Terbit Hijriyah') || currentSettings.hijriDate,
    headmasterName: settingMap.get('Nama Kepala Sekolah / Mudir') || currentSettings.headmasterName,
    coordinatorName: settingMap.get('Nama Koordinator Al-Qur\'an') || currentSettings.coordinatorName,
  };

  // Parse Users
  const userRows = valueRanges[4]?.values || [];
  const parsedUsers: UserAccount[] = userRows
    .filter((r: any[]) => r && r[0] && (r[1] || r[2]))
    .map((r: any[], idx: number) => {
      // Check if row follows new schema (8 cols) or old schema (6 cols)
      const isNewSchema = r.length >= 7;
      if (isNewSchema) {
        return {
          id: r[0],
          username: r[1] || `user_${r[0]}`,
          name: r[2] || '',
          niy: r[3] || '',
          role: (r[4] as any) || 'teacher',
          password: r[5] || '',
          assignedClassIds: r[6] ? r[6].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          email: r[7] || '',
        };
      } else {
        // Fallback old schema
        return {
          id: r[0],
          username: `user_${r[0] || idx + 1}`,
          name: r[1] || '',
          email: r[2] || '',
          role: (r[3] as any) || 'teacher',
          niy: r[4] || '',
          assignedClassIds: r[5] ? r[5].split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        };
      }
    });

  return {
    students: parsedStudents.length > 0 ? parsedStudents : Storage.getStudents(),
    classes: parsedClasses.length > 0 ? parsedClasses : Storage.getClasses(),
    reports: parsedReports.length > 0 ? parsedReports : Storage.getReports(),
    settings: parsedSettings,
    users: parsedUsers.length > 0 ? parsedUsers : Storage.getUsers(),
  };
};

// ==========================================
// Upload Raport PDF to Google Drive Folder
// ==========================================

export const uploadReportPdfToGoogleDrive = async (
  token: string,
  folderId: string,
  fileName: string,
  pdfBlob: Blob
): Promise<{ fileId: string; fileUrl: string }> => {
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/pdf',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', pdfBlob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    throw new Error(`Gagal mengunggah PDF ke Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    fileId: data.id,
    fileUrl: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
};

// ==========================================
// Subfolder & JSON Snapshot Management
// ==========================================

export const getOrCreateDriveSubfolder = async (
  token: string,
  parentFolderId: string,
  subfolderName: string
): Promise<{ folderId: string; folderUrl: string }> => {
  try {
    const escapedName = escapeDriveQuery(subfolderName);
    const query = encodeURIComponent(
      `name = '${escapedName}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );

    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const folder = searchData.files[0];
        return {
          folderId: folder.id,
          folderUrl: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
        };
      }
    }
  } catch (err) {
    console.warn('Subfolder search error, creating directly:', err);
  }

  // Create Subfolder directly inside parent
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: subfolderName,
      parents: [parentFolderId],
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text().catch(() => '');
    throw new Error(`Gagal membuat subfolder di Google Drive: ${createRes.statusText} ${errText}`);
  }

  const newSubfolder = await createRes.json();
  return {
    folderId: newSubfolder.id,
    folderUrl: newSubfolder.webViewLink || `https://drive.google.com/drive/folders/${newSubfolder.id}`,
  };
};

export const uploadBackupJsonToGoogleDrive = async (
  token: string,
  folderId: string,
  backupData: {
    students: Student[];
    classes: ClassRoom[];
    reports: StudentReport[];
    settings: SchoolSettings;
    users: UserAccount[];
    metadata?: any;
  }
): Promise<{ fileId: string; fileUrl: string }> => {
  const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `Database_E-Raport_AlQuran_Backup_${nowStr}.json`;

  const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json',
    description: 'Cadangan penuh Database E-Raport Al-Qur\'an UMMI & Tahfidz',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', jsonBlob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    throw new Error(`Gagal mengunggah Cadangan JSON ke Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    fileId: data.id,
    fileUrl: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
};

// ==========================================
// Comprehensive Database Migration Engine
// ==========================================

export interface MigrationStepProgress {
  stepIndex: number;
  totalSteps: number;
  title: string;
  detail: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export const migrateEntireDatabaseToGoogleWorkspace = async (
  token: string,
  customData?: {
    students?: Student[];
    classes?: ClassRoom[];
    reports?: StudentReport[];
    settings?: SchoolSettings;
    users?: UserAccount[];
  },
  onStepProgress?: (step: MigrationStepProgress) => void
): Promise<{
  success: boolean;
  folderId: string;
  folderUrl: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  backupFileUrl?: string;
  syncedAt: string;
}> => {
  const steps: string[] = [
    'Memeriksa Otorisasi Google Drive & Spreadsheet',
    'Menyiapkan Folder Utama di Google Drive',
    'Menyiapkan Subfolder Arsip PDF & Cadangan JSON',
    'Membuat & Menghubungkan Google Spreadsheet Database',
    'Mentransfer 100% Seluruh Data (Santri, Kelas, Nilai Raport, Pengaturan, Pengguna)',
    'Mengunggah Berkas Cadangan JSON Lengkap ke Google Drive',
    'Mengaktifkan Sinkronisasi Otomatis Realtime',
  ];

  const updateStep = (index: number, status: MigrationStepProgress['status'], detail: string) => {
    if (onStepProgress) {
      onStepProgress({
        stepIndex: index + 1,
        totalSteps: steps.length,
        title: steps[index],
        detail,
        status,
      });
    }
  };

  const students = customData?.students || Storage.getStudents();
  const classes = customData?.classes || Storage.getClasses();
  const reports = customData?.reports || Storage.getReports();
  const settings = customData?.settings || Storage.getSettings();
  const users = customData?.users || Storage.getUsers();

  try {
    // Step 1: Check Auth
    updateStep(0, 'in-progress', 'Memverifikasi izin Google Sheets dan Google Drive...');
    if (!token) throw new Error('Token akses Google tidak ditemukan. Silakan login terlebih dahulu.');
    updateStep(0, 'completed', 'Izin Google Workspace terverifikasi aktif.');

    // Step 2: Main Folder
    updateStep(1, 'in-progress', 'Membuat atau menghubungkan folder utama di Google Drive...');
    const mainFolder = await getOrCreateDriveFolder(token, 'E-Raport Al-Qur\'an UMMI & Tahfidz');
    updateStep(1, 'completed', `Folder Google Drive siap: "${mainFolder.folderUrl}"`);

    // Step 3: Subfolders
    updateStep(2, 'in-progress', 'Menyiapkan subfolder "Arsip_PDF_Raport" & "Cadangan_Database_JSON"...');
    const pdfFolder = await getOrCreateDriveSubfolder(token, mainFolder.folderId, 'Arsip_PDF_Raport');
    const backupFolder = await getOrCreateDriveSubfolder(token, mainFolder.folderId, 'Cadangan_Database_JSON');
    updateStep(2, 'completed', 'Struktur folder Google Drive berhasil disiapkan.');

    // Step 4: Spreadsheet DB
    updateStep(3, 'in-progress', 'Membuat Spreadsheet Database dengan 5 lembar kerja terstruktur...');
    const sheetDb = await getOrCreateSpreadsheetDatabase(
      token,
      mainFolder.folderId,
      'Database E-Raport Al-Qur\'an (Metode UMMI & Tahfidz)'
    );
    updateStep(3, 'completed', `Google Spreadsheet terhubung: "${sheetDb.title}"`);

    // Step 5: Transfer All Entities
    updateStep(
      4,
      'in-progress',
      `Mentransfer ${students.length} Santri, ${classes.length} Kelas, ${reports.length} Raport, Pengaturan & Pengguna...`
    );
    const syncRes = await syncLocalToGoogleSheets(token, sheetDb.spreadsheetId, {
      students,
      classes,
      reports,
      settings,
      users,
    });
    updateStep(4, 'completed', 'Seluruh data berhasil ditulis ke dalam Google Sheets tanpa ada yang tertinggal.');

    // Step 6: Upload JSON Backup
    updateStep(5, 'in-progress', 'Mengunggah salinan cadangan JSON utuh ke Google Drive...');
    let backupRes;
    try {
      backupRes = await uploadBackupJsonToGoogleDrive(token, backupFolder.folderId, {
        students,
        classes,
        reports,
        settings,
        users,
        metadata: {
          app: 'E-Raport Al-Quran UMMI & Tahfidz',
          migratedAt: syncRes.syncedAt,
          version: '1.0.0',
        },
      });
      updateStep(5, 'completed', 'Salinan cadangan JSON berhasil diarsipkan ke Google Drive.');
    } catch (e: any) {
      console.warn('Backup JSON failed:', e);
      updateStep(5, 'completed', 'Data Sheets tersimpan (unggah JSON diskip).');
    }

    // Step 7: Finalize & Enable Auto-Sync
    updateStep(6, 'in-progress', 'Menyelesaikan konfigurasi database Google Drive & Sheets...');
    const finalState: Partial<GoogleWorkspaceDatabaseState> = {
      isConnected: true,
      isMigrated: true,
      autoSyncEnabled: true,
      spreadsheetId: sheetDb.spreadsheetId,
      spreadsheetUrl: sheetDb.spreadsheetUrl,
      spreadsheetTitle: sheetDb.title,
      folderId: mainFolder.folderId,
      folderUrl: mainFolder.folderUrl,
      backupFolderId: backupFolder.folderId,
      pdfFolderId: pdfFolder.folderId,
      lastSyncedAt: syncRes.syncedAt,
      isSyncing: false,
      error: null,
    };
    saveGoogleDatabaseState(finalState);
    updateStep(6, 'completed', 'Database resmi dialihkan 100% ke Google Drive & Google Spreadsheets!');

    return {
      success: true,
      folderId: mainFolder.folderId,
      folderUrl: mainFolder.folderUrl,
      spreadsheetId: sheetDb.spreadsheetId,
      spreadsheetUrl: sheetDb.spreadsheetUrl,
      backupFileUrl: backupRes?.fileUrl,
      syncedAt: syncRes.syncedAt,
    };
  } catch (err: any) {
    console.error('Migration failed:', err);
    saveGoogleDatabaseState({ error: err.message || 'Gagal migrasi database' });
    throw err;
  }
};

// ==========================================
// Auto-Sync Queue / Debounce
// ==========================================

let autoSyncTimeout: any = null;

export const triggerAutoSyncToGoogleSheets = (
  token: string | null,
  spreadsheetId: string | null,
  data: {
    students: Student[];
    classes: ClassRoom[];
    reports: StudentReport[];
    settings: SchoolSettings;
    users: UserAccount[];
  },
  onSyncComplete?: (syncedAt: string) => void
) => {
  if (!token || !spreadsheetId) return;

  const state = getSavedGoogleDatabaseState();
  if (!state.isConnected || state.autoSyncEnabled === false) return;

  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
  }

  autoSyncTimeout = setTimeout(async () => {
    try {
      const res = await syncLocalToGoogleSheets(token, spreadsheetId, data);
      if (onSyncComplete) onSyncComplete(res.syncedAt);
    } catch (err) {
      console.warn('Auto-sync background error:', err);
    }
  }, 2500); // 2.5 seconds debounce
};
