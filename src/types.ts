export type UserRole = 'super_admin' | 'coordinator' | 'teacher' | 'parent';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  assignedClassIds?: string[];
  nip?: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  classId: string;
  gender: 'L' | 'P';
  parentName?: string;
  parentPhone?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "IX A - AL HAITAMI"
  gradeLevel: string; // e.g. "9"
  targetHafalan: string; // e.g. "Juz 2"
  teacherId: string; // Ustadz/Ustadzah ID
  teacherName: string; // e.g. "M. Mujiono, S.Pd"
}

export interface SchoolSettings {
  schoolName: string;
  schoolSubName?: string; // e.g. "SEKOLAH MENENGAH PERTAMA ISLAM TERPADU"
  logoUrl?: string; // custom logo data URL or link
  academicYear: string; // e.g. "2025/2026"
  semester: 'GANJIL' | 'GENAP';
  issueCity: string; // e.g. "Balikpapan"
  issueDate: string; // e.g. "02 Juni 2026"
  hijriDate: string; // e.g. "16 Dzulhijjah 1447 H"
  headmasterName: string;
  coordinatorName: string;
}

export interface PembelajaranAlQuran {
  jilid: {
    targetSemester: string; // e.g. "Pasca"
    prestasiBelajar: string; // e.g. "-" or "Jilid 6"
    m: string; // e.g. "-" or "A"
    mad: string; // e.g. "-"
    t: string; // e.g. "-"
    k: string; // e.g. "-"
    keterangan: string; // e.g. "-"
  };
  tartil: {
    targetSemester: string; // e.g. "Pasca"
    prestasiBelajar: string;
    m: string;
    mad: string;
    t: string;
    k: string;
    keterangan: string;
  };
  deskripsiJilidTartil: string; // e.g. "-"
  turjuman: {
    targetSemester: string; // e.g. "Turjuman 5"
    prestasiBelajar: string; // e.g. "LULUS"
    perKata: number | string; // e.g. 90
    perKalimat: number | string; // e.g. 90
    intisari: number | string; // e.g. 87
    imla: number | string; // e.g. "-" or 85
    keterangan: string; // e.g. "Jayyid Jiddan"
  };
  deskripsiTurjuman: string;
}

export interface HafalanAlQuran {
  targetHafalanKelas: string; // e.g. "Juz 2"
  capaianHafalan: {
    juz30: boolean;
    juz29: boolean;
    juz28: boolean;
    juz1: boolean;
    juz2: boolean;
    juz3: boolean;
    juz4: boolean;
    juz5: boolean;
    juz6: boolean;
    juz7: boolean;
    juz8: boolean;
    juz9: boolean;
    juz10: boolean;
  };
  munaqosyah: {
    juz30: number | string;
    juz29: number | string;
    juz28: number | string;
    juz1: number | string;
    juz2: number | string;
    juz3: number | string;
    juz4: number | string;
    juz5: number | string;
    juz6: number | string;
    juz7: number | string;
    juz8: number | string;
    juz9: number | string;
    juz10: number | string;
  };
  ujianSemester: {
    nilai: number | string; // e.g. 89
    predikat: string; // e.g. "Jayyid"
  };
  catatanGuru: string;
}

export interface HaditsItemScores {
  niat: number | string;
  menuntutIlmu: number | string;
  amalJariyah: number | string;
  menunjukkanKebaikan: number | string;
  laranganMenyembunyikanIlmu: number | string;
  ikhlas: number | string;
  rukunIslam: number | string;
  mukminSempurna: number | string;
  ridhoOrangTua: number | string;
  laranganTidakMenyapa: number | string;
}

export interface HafalanHadits {
  scores: HaditsItemScores;
  rataRata: number | string; // e.g. 85
  predikat: string; // e.g. "Jayyid"
}

export interface StudentReport {
  id: string;
  studentId: string;
  classId: string;
  academicYear: string;
  semester: 'GANJIL' | 'GENAP';
  pembelajaranAlQuran: PembelajaranAlQuran;
  hafalanAlQuran: HafalanAlQuran;
  hafalanHadits: HafalanHadits;
  teacherName: string;
  issueCity: string;
  issueDate: string;
  hijriDate: string;
  isLocked?: boolean;
  updatedAt: string;
}

export interface GoogleUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface GoogleWorkspaceDatabaseState {
  isConnected: boolean;
  isMigrated?: boolean;
  autoSyncEnabled?: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string | null;
  folderId: string | null;
  folderUrl: string | null;
  backupFolderId?: string | null;
  pdfFolderId?: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error: string | null;
}
