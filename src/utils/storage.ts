import { Student, ClassRoom, UserAccount, SchoolSettings, StudentReport } from '../types';
import { syncStateToFirestore } from '../firebase';

const STORAGE_KEYS = {
  SETTINGS: 'eraport_settings_v1',
  USERS: 'eraport_users_v1',
  CURRENT_USER: 'eraport_current_user_v1',
  AUTH_SESSION: 'eraport_auth_session_v1',
  CLASSES: 'eraport_classes_v1',
  STUDENTS: 'eraport_students_v1',
  REPORTS: 'eraport_reports_v1',
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'SMP IT / PESANTREN TAHFIDZ AL-QUR\'AN',
  logoUrl: undefined,
  secondaryLogoUrl: undefined,
  showSecondaryLogo: true,
  showHaditsSection: false, // Default format hadits dihilangkan, namun disediakan opsi switch untuk diaktifkan kapan saja
  academicYear: '2025/2026',
  semester: 'GENAP',
  issueCity: 'Balikpapan',
  issueDate: '02 Juni 2026',
  hijriDate: '16 Dzulhijjah 1447 H',
  headmasterName: 'Drs. H. Abdullah Masykur, M.Pd.I',
  coordinatorName: 'Ustadz Ahmad Fauzi, Al-Hafidz',
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-super-admin',
    username: 'superadmin',
    name: 'Super Admin Utama',
    niy: 'NIY. 20240001',
    email: 'superadmin@sekolah.sch.id',
    role: 'super_admin',
    password: 'admin',
    phone: '081234567800',
    notes: 'Akses penuh pengelola sistem (kredensial bebas disesuaikan)',
  },
  {
    id: 'user-admin',
    username: 'admin.quran',
    name: 'Ustadz Ahmad Fauzi, Al-Hafidz',
    niy: 'NIY. 20240101',
    email: 'koordinator@sekolah.sch.id',
    role: 'coordinator',
    password: 'admin',
    phone: '081234567801',
    notes: 'Koordinator Al-Qur’an & Tahfidz',
  },
  {
    id: 'user-teacher-1',
    username: 'mujiono',
    name: 'M. Mujiono, S.Pd',
    niy: 'NIY. 20240201',
    email: 'mujiono@sekolah.sch.id',
    role: 'teacher',
    password: 'guru',
    assignedClassIds: ['class-ix-a', 'class-ix-b'],
    phone: '081234567802',
    notes: 'Guru Halaqah IX A & IX B',
  },
  {
    id: 'user-teacher-2',
    username: 'nurul',
    name: 'Ustadzah Nurul Hidayah, S.Pd.I',
    niy: 'NIY. 20240202',
    email: 'nurul@sekolah.sch.id',
    role: 'teacher',
    password: 'guru',
    assignedClassIds: ['class-viii-a'],
    phone: '081234567803',
    notes: 'Guru Halaqah VIII A',
  },
];

export const DEFAULT_CLASSES: ClassRoom[] = [
  {
    id: 'class-ix-a',
    name: 'IX A - AL HAITAMI',
    gradeLevel: '9',
    targetHafalan: 'Juz 2',
    teacherId: 'user-teacher-1',
    teacherName: 'M. Mujiono, S.Pd',
  },
  {
    id: 'class-ix-b',
    name: 'IX B - IBNU SINA',
    gradeLevel: '9',
    targetHafalan: 'Juz 2',
    teacherId: 'user-teacher-1',
    teacherName: 'M. Mujiono, S.Pd',
  },
  {
    id: 'class-viii-a',
    name: 'VIII A - AL KHINDI',
    gradeLevel: '8',
    targetHafalan: 'Juz 29',
    teacherId: 'user-teacher-2',
    teacherName: 'Ustadzah Nurul Hidayah, S.Pd.I',
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'student-dzakki',
    nis: '2311063106',
    name: 'DZAKKI ATHARRAYHAN',
    classId: 'class-ix-a',
    gender: 'L',
    parentName: 'H. Bambang Irawan',
    parentPhone: '081234567890',
  },
  {
    id: 'student-fathan',
    nis: '2311063107',
    name: 'FATHAN AL-FARISI',
    classId: 'class-ix-a',
    gender: 'L',
    parentName: 'Rudi Hartono',
    parentPhone: '081234567891',
  },
  {
    id: 'student-aisyah',
    nis: '2311063108',
    name: 'AISYAH AZ-ZAHRA',
    classId: 'class-ix-a',
    gender: 'P',
    parentName: 'Drs. Hendro Wibowo',
    parentPhone: '081234567892',
  },
  {
    id: 'student-rayhan',
    nis: '2311063109',
    name: 'MUHAMMAD RAYHAN PUTRA',
    classId: 'class-ix-a',
    gender: 'L',
    parentName: 'Ahmad Sofyan',
    parentPhone: '081234567893',
  },
  {
    id: 'student-salma',
    nis: '2311063110',
    name: 'SALMA NABILAH SYARIFAH',
    classId: 'class-ix-b',
    gender: 'P',
    parentName: 'Ir. Agus Pratama',
    parentPhone: '081234567894',
  },
];

export const DEFAULT_REPORTS: StudentReport[] = [
  {
    id: 'report-dzakki',
    studentId: 'student-dzakki',
    classId: 'class-ix-a',
    academicYear: '2025/2026',
    semester: 'GENAP',
    pembelajaranAlQuran: {
      jilid: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      tartil: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      deskripsiJilidTartil: '-',
      turjuman: {
        targetSemester: 'Turjuman 5',
        prestasiBelajar: 'LULUS',
        perKata: 90,
        perKalimat: 90,
        intisari: 87,
        imla: '-',
        keterangan: 'Jayyid Jiddan',
      },
      deskripsiTurjuman: "Alhamdulillah Ananda memiliki kemampuan yang baik dalam mempelajari dan memahami arti perkata, perkalimat dan Intisari surah-surah pendek dalam Al-Qur'an. Harapannya Ananda dapat terus berinteraksi terhadap Al-Qur'an dengan tilawah dan selalu memuroja'ah hafalannya.",
    },
    hafalanAlQuran: {
      targetHafalanKelas: 'Juz 2',
      capaianHafalan: {
        juz30: true,
        juz29: true,
        juz28: false,
        juz1: false,
        juz2: false,
        juz3: false,
        juz4: false,
        juz5: false,
        juz6: false,
        juz7: false,
        juz8: false,
        juz9: false,
        juz10: false,
      },
      munaqosyah: {
        juz30: 90,
        juz29: '-',
        juz28: '-',
        juz1: '-',
        juz2: '-',
        juz3: '-',
        juz4: '-',
        juz5: '-',
        juz6: '-',
        juz7: '-',
        juz8: '-',
        juz9: '-',
        juz10: '-',
      },
      ujianSemester: {
        nilai: 89,
        predikat: 'Jayyid',
      },
      catatanGuru: "Alhamdulillah Ananda telah menyelesaikan ujian tahfidz juz 30 surah An-Naas sampai surah An-Naba'. Semoga Ananda istiqomah dalam memuroja'ah dan menambah hafalannya.",
    },
    hafalanHadits: {
      scores: {
        niat: 85,
        menuntutIlmu: 85,
        amalJariyah: 85,
        menunjukkanKebaikan: 85,
        laranganMenyembunyikanIlmu: 85,
        ikhlas: 85,
        rukunIslam: 85,
        mukminSempurna: 85,
        ridhoOrangTua: 85,
        laranganTidakMenyapa: 85,
      },
      rataRata: 85,
      predikat: 'Jayyid',
    },
    teacherName: 'M. Mujiono, S.Pd',
    issueCity: 'Balikpapan',
    issueDate: '02 Juni 2026',
    hijriDate: '16 Dzulhijjah 1447 H',
    isLocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'report-fathan',
    studentId: 'student-fathan',
    classId: 'class-ix-a',
    academicYear: '2025/2026',
    semester: 'GENAP',
    pembelajaranAlQuran: {
      jilid: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      tartil: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      deskripsiJilidTartil: '-',
      turjuman: {
        targetSemester: 'Turjuman 5',
        prestasiBelajar: 'LULUS',
        perKata: 94,
        perKalimat: 92,
        intisari: 95,
        imla: 90,
        keterangan: 'Jayyid Jiddan',
      },
      deskripsiTurjuman: "Alhamdulillah Ananda menguasai terjemah perkata dan pemahaman makna ayat dengan sangat baik. Pertahankan semangat belajar Al-Qur'an.",
    },
    hafalanAlQuran: {
      targetHafalanKelas: 'Juz 2',
      capaianHafalan: {
        juz30: true,
        juz29: true,
        juz28: true,
        juz1: false,
        juz2: false,
        juz3: false,
        juz4: false,
        juz5: false,
        juz6: false,
        juz7: false,
        juz8: false,
        juz9: false,
        juz10: false,
      },
      munaqosyah: {
        juz30: 95,
        juz29: 92,
        juz28: '-',
        juz1: '-',
        juz2: '-',
        juz3: '-',
        juz4: '-',
        juz5: '-',
        juz6: '-',
        juz7: '-',
        juz8: '-',
        juz9: '-',
        juz10: '-',
      },
      ujianSemester: {
        nilai: 93,
        predikat: 'Jayyid Jiddan',
      },
      catatanGuru: "Alhamdulillah Ananda telah menyelesaikan ujian tahfidz Juz 30 dan Juz 29 dengan mutqin. Terus istiqomah menambah hafalan di Juz berikutnya.",
    },
    hafalanHadits: {
      scores: {
        niat: 90,
        menuntutIlmu: 92,
        amalJariyah: 90,
        menunjukkanKebaikan: 94,
        laranganMenyembunyikanIlmu: 90,
        ikhlas: 92,
        rukunIslam: 95,
        mukminSempurna: 90,
        ridhoOrangTua: 92,
        laranganTidakMenyapa: 90,
      },
      rataRata: 92,
      predikat: 'Jayyid Jiddan',
    },
    teacherName: 'M. Mujiono, S.Pd',
    issueCity: 'Balikpapan',
    issueDate: '02 Juni 2026',
    hijriDate: '16 Dzulhijjah 1447 H',
    isLocked: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'report-aisyah',
    studentId: 'student-aisyah',
    classId: 'class-ix-a',
    academicYear: '2025/2026',
    semester: 'GENAP',
    pembelajaranAlQuran: {
      jilid: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      tartil: {
        targetSemester: 'Pasca',
        prestasiBelajar: '-',
        m: '-',
        mad: '-',
        t: '-',
        k: '-',
        keterangan: '-',
      },
      deskripsiJilidTartil: '-',
      turjuman: {
        targetSemester: 'Turjuman 5',
        prestasiBelajar: 'LULUS',
        perKata: 100,
        perKalimat: 100,
        intisari: 100,
        imla: 98,
        keterangan: 'Mumtaz',
      },
      deskripsiTurjuman: "MasyaAllah Tabarakallah Ananda menunjukkan kemampuan istimewa dalam mengartikan dan menghafal mufrodat Al-Qur'an perkata maupun perkalimat.",
    },
    hafalanAlQuran: {
      targetHafalanKelas: 'Juz 2',
      capaianHafalan: {
        juz30: true,
        juz29: true,
        juz28: true,
        juz1: true,
        juz2: true,
        juz3: false,
        juz4: false,
        juz5: false,
        juz6: false,
        juz7: false,
        juz8: false,
        juz9: false,
        juz10: false,
      },
      munaqosyah: {
        juz30: 98,
        juz29: 96,
        juz28: 94,
        juz1: 95,
        juz2: '-',
        juz3: '-',
        juz4: '-',
        juz5: '-',
        juz6: '-',
        juz7: '-',
        juz8: '-',
        juz9: '-',
        juz10: '-',
      },
      ujianSemester: {
        nilai: 98,
        predikat: 'Mumtaz',
      },
      catatanGuru: "Alhamdulillah Ananda telah melampaui target hafalan dengan sangat baik dan mutqin. Semoga selalu dijaga oleh Allah SWT.",
    },
    hafalanHadits: {
      scores: {
        niat: 100,
        menuntutIlmu: 100,
        amalJariyah: 98,
        menunjukkanKebaikan: 98,
        laranganMenyembunyikanIlmu: 100,
        ikhlas: 100,
        rukunIslam: 100,
        mukminSempurna: 100,
        ridhoOrangTua: 100,
        laranganTidakMenyapa: 98,
      },
      rataRata: 99,
      predikat: 'Mumtaz',
    },
    teacherName: 'M. Mujiono, S.Pd',
    issueCity: 'Balikpapan',
    issueDate: '02 Juni 2026',
    hijriDate: '16 Dzulhijjah 1447 H',
    isLocked: false,
    updatedAt: new Date().toISOString(),
  },
];

// Storage Helper Functions
export const Storage = {
  getSettings: (): SchoolSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: SchoolSettings, syncCloud: boolean = true) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (syncCloud) {
      syncStateToFirestore({ settings });
    }
  },

  getUsers: (): UserAccount[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return DEFAULT_USERS;
    try {
      const parsed: UserAccount[] = JSON.parse(data);
      // Migrate missing username or niy if present
      return parsed.map((u, idx) => {
        const defaultMatch = DEFAULT_USERS.find((du) => du.id === u.id || du.name === u.name);
        return {
          ...u,
          username: u.username || defaultMatch?.username || `user_${u.id || idx + 1}`,
          niy: u.niy || (u as any).nip || defaultMatch?.niy || `NIY. 20240${idx + 1}`,
        };
      });
    } catch {
      return DEFAULT_USERS;
    }
  },
  saveUsers: (users: UserAccount[], syncCloud: boolean = true) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (syncCloud) {
      syncStateToFirestore({ users });
    }
  },
  saveOrUpdateUser: (user: UserAccount) => {
    const users = Storage.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    Storage.saveUsers(users);
    // If updating currently logged in user, refresh current user too
    const current = Storage.getCurrentUser();
    if (current.id === user.id) {
      Storage.setCurrentUser(user);
    }
  },
  deleteUser: (userId: string) => {
    const users = Storage.getUsers().filter((u) => u.id !== userId);
    Storage.saveUsers(users);
  },

  getCurrentUser: (): UserAccount => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return DEFAULT_USERS[0];
    try {
      const u: UserAccount = JSON.parse(data);
      const defaultMatch = DEFAULT_USERS.find((du) => du.id === u.id || du.name === u.name);
      return {
        ...u,
        username: u.username || defaultMatch?.username || 'admin',
        niy: u.niy || (u as any).nip || defaultMatch?.niy || 'NIY. 20240001',
      };
    } catch {
      return DEFAULT_USERS[0];
    }
  },
  setCurrentUser: (user: UserAccount) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  hasActiveSession: (): boolean => {
    const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    return !!session;
  },
  getAuthSession: (): UserAccount | null => {
    const data = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  setAuthSession: (user: UserAccount) => {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },
  clearAuthSession: () => {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  },

  getClasses: (): ClassRoom[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data) : DEFAULT_CLASSES;
  },
  saveClasses: (classes: ClassRoom[], syncCloud: boolean = true) => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    if (syncCloud) {
      syncStateToFirestore({ classes });
    }
  },

  getStudents: (): Student[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : DEFAULT_STUDENTS;
  },
  saveStudents: (students: Student[], syncCloud: boolean = true) => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    if (syncCloud) {
      syncStateToFirestore({ students });
    }
  },

  getReports: (): StudentReport[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : DEFAULT_REPORTS;
  },
  saveReports: (reports: StudentReport[], syncCloud: boolean = true) => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    if (syncCloud) {
      syncStateToFirestore({ reports });
    }
  },

  getReportForStudent: (studentId: string): StudentReport | undefined => {
    const reports = Storage.getReports();
    return reports.find((r) => r.studentId === studentId);
  },

  saveOrUpdateReport: (report: StudentReport) => {
    const reports = Storage.getReports();
    const index = reports.findIndex((r) => r.studentId === report.studentId);
    if (index >= 0) {
      reports[index] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      reports.push({ ...report, updatedAt: new Date().toISOString() });
    }
    Storage.saveReports(reports);
  },

  createEmptyReportForStudent: (student: Student, classObj?: ClassRoom, settings?: SchoolSettings): StudentReport => {
    const s = settings || Storage.getSettings();
    const c = classObj || Storage.getClasses().find((cls) => cls.id === student.classId);

    return {
      id: `report-${student.id}-${Date.now()}`,
      studentId: student.id,
      classId: student.classId,
      academicYear: s.academicYear,
      semester: s.semester,
      pembelajaranAlQuran: {
        jilid: {
          targetSemester: 'Pasca',
          prestasiBelajar: '-',
          m: '-',
          mad: '-',
          t: '-',
          k: '-',
          keterangan: '-',
        },
        tartil: {
          targetSemester: 'Pasca',
          prestasiBelajar: '-',
          m: '-',
          mad: '-',
          t: '-',
          k: '-',
          keterangan: '-',
        },
        deskripsiJilidTartil: '-',
        turjuman: {
          targetSemester: 'Turjuman 5',
          prestasiBelajar: 'LULUS',
          perKata: 85,
          perKalimat: 85,
          intisari: 85,
          imla: '-',
          keterangan: 'Jayyid',
        },
        deskripsiTurjuman: "Alhamdulillah Ananda memiliki kemampuan yang baik dalam mempelajari dan memahami arti perkata, perkalimat dan Intisari surah-surah pendek dalam Al-Qur'an. Harapannya Ananda dapat terus berinteraksi terhadap Al-Qur'an dengan tilawah dan selalu memuroja'ah hafalannya.",
      },
      hafalanAlQuran: {
        targetHafalanKelas: c ? c.targetHafalan : 'Juz 2',
        capaianHafalan: {
          juz30: true,
          juz29: false,
          juz28: false,
          juz1: false,
          juz2: false,
          juz3: false,
          juz4: false,
          juz5: false,
          juz6: false,
          juz7: false,
          juz8: false,
          juz9: false,
          juz10: false,
        },
        munaqosyah: {
          juz30: 85,
          juz29: '-',
          juz28: '-',
          juz1: '-',
          juz2: '-',
          juz3: '-',
          juz4: '-',
          juz5: '-',
          juz6: '-',
          juz7: '-',
          juz8: '-',
          juz9: '-',
          juz10: '-',
        },
        ujianSemester: {
          nilai: 85,
          predikat: 'Jayyid',
        },
        catatanGuru: "Alhamdulillah Ananda telah menyelesaikan ujian tahfidz juz 30 surah An-Naas sampai surah An-Naba'. Semoga Ananda istiqomah dalam memuroja'ah dan menambah hafalannya.",
      },
      hafalanHadits: {
        scores: {
          niat: 85,
          menuntutIlmu: 85,
          amalJariyah: 85,
          menunjukkanKebaikan: 85,
          laranganMenyembunyikanIlmu: 85,
          ikhlas: 85,
          rukunIslam: 85,
          mukminSempurna: 85,
          ridhoOrangTua: 85,
          laranganTidakMenyapa: 85,
        },
        rataRata: 85,
        predikat: 'Jayyid',
      },
      teacherName: c ? c.teacherName : 'M. Mujiono, S.Pd',
      issueCity: s.issueCity,
      issueDate: s.issueDate,
      hijriDate: s.hijriDate,
      isLocked: false,
      updatedAt: new Date().toISOString(),
    };
  },

  resetAllDataToDefault: () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(DEFAULT_REPORTS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    syncStateToFirestore({
      settings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS,
      classes: DEFAULT_CLASSES,
      students: DEFAULT_STUDENTS,
      reports: DEFAULT_REPORTS,
    });
  },

  exportDatabaseBackup: () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: Storage.getSettings(),
      users: Storage.getUsers(),
      classes: Storage.getClasses(),
      students: Storage.getStudents(),
      reports: Storage.getReports(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseBackup: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) Storage.saveSettings(data.settings, false);
      if (data.users) Storage.saveUsers(data.users, false);
      if (data.classes) Storage.saveClasses(data.classes, false);
      if (data.students) Storage.saveStudents(data.students, false);
      if (data.reports) Storage.saveReports(data.reports, false);
      syncStateToFirestore({
        settings: data.settings || Storage.getSettings(),
        users: data.users || Storage.getUsers(),
        classes: data.classes || Storage.getClasses(),
        students: data.students || Storage.getStudents(),
        reports: data.reports || Storage.getReports(),
      });
      return true;
    } catch {
      return false;
    }
  },
};
