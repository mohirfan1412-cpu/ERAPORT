import * as XLSX from 'xlsx';
import { Student, ClassRoom, StudentReport, SchoolSettings, UserAccount } from '../types';
import { HADITS_LIST } from './reportCalculations';

export interface ExportDatasetOptions {
  includeStudents: boolean;
  includeClasses: boolean;
  includeReports: boolean;
  includeSettings: boolean;
  format: 'json' | 'excel' | 'csv' | 'sql';
}

/**
 * Generate formatted Open Educational Dataset (JSON standard)
 * Conforms to open education / school interoperability standards.
 */
export function generateOpenEducationJson(
  students: Student[],
  classes: ClassRoom[],
  reports: StudentReport[],
  settings: SchoolSettings
) {
  const exportTimestamp = new Date().toISOString();

  const enrichedStudents = students.map((s) => {
    const classObj = classes.find((c) => c.id === s.classId);
    const reportObj = reports.find((r) => r.studentId === s.id);

    return {
      id: s.id,
      nis: s.nis,
      fullName: s.name,
      gender: s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
      genderCode: s.gender,
      parentName: s.parentName || '-',
      parentPhone: s.parentPhone || '-',
      classroom: {
        id: classObj?.id || s.classId,
        name: classObj?.name || s.classId,
        gradeLevel: classObj?.gradeLevel || '-',
        teacherName: classObj?.teacherName || '-',
        targetHafalan: classObj?.targetHafalan || '-',
      },
      academicYear: reportObj?.academicYear || settings.academicYear,
      semester: reportObj?.semester || settings.semester,
      scores: reportObj
        ? {
            ummiJilid: {
              target: reportObj.pembelajaranAlQuran.jilid.targetSemester,
              achievement: reportObj.pembelajaranAlQuran.jilid.prestasiBelajar,
              makhroj: reportObj.pembelajaranAlQuran.jilid.m,
              mad: reportObj.pembelajaranAlQuran.jilid.mad,
              tajwid: reportObj.pembelajaranAlQuran.jilid.t,
              kelancaran: reportObj.pembelajaranAlQuran.jilid.k,
              keterangan: reportObj.pembelajaranAlQuran.jilid.keterangan,
            },
            ummiTartil: {
              target: reportObj.pembelajaranAlQuran.tartil.targetSemester,
              achievement: reportObj.pembelajaranAlQuran.tartil.prestasiBelajar,
              makhroj: reportObj.pembelajaranAlQuran.tartil.m,
              mad: reportObj.pembelajaranAlQuran.tartil.mad,
              tajwid: reportObj.pembelajaranAlQuran.tartil.t,
              kelancaran: reportObj.pembelajaranAlQuran.tartil.k,
              keterangan: reportObj.pembelajaranAlQuran.tartil.keterangan,
            },
            turjuman: {
              target: reportObj.pembelajaranAlQuran.turjuman.targetSemester,
              achievement: reportObj.pembelajaranAlQuran.turjuman.prestasiBelajar,
              scorePerWord: reportObj.pembelajaranAlQuran.turjuman.perKata,
              scorePerSentence: reportObj.pembelajaranAlQuran.turjuman.perKalimat,
              scoreIntisari: reportObj.pembelajaranAlQuran.turjuman.intisari,
              scoreImla: reportObj.pembelajaranAlQuran.turjuman.imla,
              predicate: reportObj.pembelajaranAlQuran.turjuman.keterangan,
            },
            tahfidzHafalan: {
              targetJuz: reportObj.hafalanAlQuran.targetHafalanKelas,
              completedJuz: Object.entries(reportObj.hafalanAlQuran.capaianHafalan)
                .filter(([_, val]) => Boolean(val))
                .map(([juz]) => juz.replace('juz', 'Juz ')),
              munaqosyahScores: reportObj.hafalanAlQuran.munaqosyah,
              semesterExam: reportObj.hafalanAlQuran.ujianSemester,
              teacherNote: reportObj.hafalanAlQuran.catatanGuru,
            },
            hafalanHadits: {
              scores: reportObj.hafalanHadits.scores,
              averageScore: reportObj.hafalanHadits.rataRata,
              predicate: reportObj.hafalanHadits.predikat,
            },
          }
        : null,
      verificationUrl: `${window.location.origin}${window.location.pathname}?view=parent&nis=${encodeURIComponent(
        s.nis
      )}`,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `E-Raport Al-Qur'an Dataset - ${settings.schoolName}`,
    description: `Dataset lengkap nilai raport Al-Qur'an metode UMMI, Tahfidz Al-Qur'an, dan Hafalan Hadits santri ${settings.schoolName} Tahun Ajaran ${settings.academicYear} Semester ${settings.semester}.`,
    institution: {
      "@type": "EducationalOrganization",
      name: settings.schoolName,
      subName: settings.schoolSubName || '',
      headmaster: settings.headmasterName,
      coordinator: settings.coordinatorName,
      city: settings.issueCity,
    },
    meta: {
      generatedAt: exportTimestamp,
      totalStudents: students.length,
      totalClasses: classes.length,
      totalEvaluatedReports: reports.length,
      academicYear: settings.academicYear,
      semester: settings.semester,
      schemaVersion: "2.1.0",
      compatibleSystems: [
        "Dapodik",
        "EMIS Kemenag",
        "Google Sheets SIS",
        "Excel Database",
        "PostgreSQL / MySQL",
        "Open Educational Data"
      ]
    },
    students: enrichedStudents,
  };
}

/**
 * Generate Master Interoperable Excel (XLSX) with multiple sheets
 */
export function generateMasterInteroperableExcel(
  students: Student[],
  classes: ClassRoom[],
  reports: StudentReport[],
  settings: SchoolSettings
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet 1: Master Flat Data (All columns in one clean tabular format for direct database import)
  const masterFlatRows: (string | number)[][] = [
    [
      'NIS',
      'Nama Santri',
      'Jenis Kelamin',
      'ID Kelas',
      'Nama Kelas',
      'Tingkat',
      'Guru Kelas',
      'Target Hafalan Kelas',
      'Nama Wali',
      'No HP Wali',
      'Tahun Ajaran',
      'Semester',
      'UMMI Jilid Target',
      'UMMI Jilid Capaian',
      'UMMI Jilid M',
      'UMMI Jilid Mad',
      'UMMI Jilid T',
      'UMMI Jilid K',
      'UMMI Jilid Ket',
      'UMMI Tartil Target',
      'UMMI Tartil Capaian',
      'UMMI Tartil M',
      'UMMI Tartil Mad',
      'UMMI Tartil T',
      'UMMI Tartil K',
      'UMMI Tartil Ket',
      'Turjuman Target',
      'Turjuman Capaian',
      'Turjuman Kata',
      'Turjuman Kalimat',
      'Turjuman Intisari',
      'Turjuman Imla',
      'Turjuman Predikat',
      'Hafalan Target Kelas',
      'Juz 30',
      'Juz 29',
      'Juz 28',
      'Juz 1',
      'Juz 2',
      'Juz 3',
      'Juz 4',
      'Juz 5',
      'Juz 6',
      'Juz 7',
      'Juz 8',
      'Juz 9',
      'Juz 10',
      'Nilai Ujian Tahfidz',
      'Predikat Ujian Tahfidz',
      'Catatan Guru Tahfidz',
      'Rata Hadits',
      'Predikat Hadits',
      'Link Verifikasi Raport'
    ]
  ];

  students.forEach((s) => {
    const c = classes.find((cls) => cls.id === s.classId);
    const r = reports.find((rep) => rep.studentId === s.id);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eraport-alquran.app';
    const verifyUrl = `${origin}/?view=parent&nis=${s.nis}`;

    if (r) {
      masterFlatRows.push([
        s.nis,
        s.name,
        s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
        c?.id || s.classId,
        c?.name || s.classId,
        c?.gradeLevel || '-',
        c?.teacherName || '-',
        c?.targetHafalan || '-',
        s.parentName || '-',
        s.parentPhone || '-',
        r.academicYear || settings.academicYear,
        r.semester || settings.semester,
        r.pembelajaranAlQuran.jilid.targetSemester || '-',
        r.pembelajaranAlQuran.jilid.prestasiBelajar || '-',
        r.pembelajaranAlQuran.jilid.m || '-',
        r.pembelajaranAlQuran.jilid.mad || '-',
        r.pembelajaranAlQuran.jilid.t || '-',
        r.pembelajaranAlQuran.jilid.k || '-',
        r.pembelajaranAlQuran.jilid.keterangan || '-',
        r.pembelajaranAlQuran.tartil.targetSemester || '-',
        r.pembelajaranAlQuran.tartil.prestasiBelajar || '-',
        r.pembelajaranAlQuran.tartil.m || '-',
        r.pembelajaranAlQuran.tartil.mad || '-',
        r.pembelajaranAlQuran.tartil.t || '-',
        r.pembelajaranAlQuran.tartil.k || '-',
        r.pembelajaranAlQuran.tartil.keterangan || '-',
        r.pembelajaranAlQuran.turjuman.targetSemester || '-',
        r.pembelajaranAlQuran.turjuman.prestasiBelajar || '-',
        r.pembelajaranAlQuran.turjuman.perKata ?? '-',
        r.pembelajaranAlQuran.turjuman.perKalimat ?? '-',
        r.pembelajaranAlQuran.turjuman.intisari ?? '-',
        r.pembelajaranAlQuran.turjuman.imla ?? '-',
        r.pembelajaranAlQuran.turjuman.keterangan || '-',
        r.hafalanAlQuran.targetHafalanKelas || c?.targetHafalan || 'Juz 2',
        r.hafalanAlQuran.capaianHafalan.juz30 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz29 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz28 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz1 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz2 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz3 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz4 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz5 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz6 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz7 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz8 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz9 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz10 ? 'V' : '-',
        r.hafalanAlQuran.ujianSemester.nilai ?? '-',
        r.hafalanAlQuran.ujianSemester.predikat || '-',
        r.hafalanAlQuran.catatanGuru || '-',
        r.hafalanHadits.rataRata ?? '-',
        r.hafalanHadits.predikat || '-',
        verifyUrl
      ]);
    } else {
      masterFlatRows.push([
        s.nis,
        s.name,
        s.gender === 'L' ? 'Laki-Laki' : 'Perempuan',
        c?.id || s.classId,
        c?.name || s.classId,
        c?.gradeLevel || '-',
        c?.teacherName || '-',
        c?.targetHafalan || '-',
        s.parentName || '-',
        s.parentPhone || '-',
        settings.academicYear,
        settings.semester,
        '-', '-', '-', '-', '-', '-', '-',
        '-', '-', '-', '-', '-', '-', '-',
        '-', '-', '-', '-', '-', '-', 'Belum Input',
        c?.targetHafalan || 'Juz 2',
        '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
        '-', 'Belum Ada',
        '-',
        '-', 'Belum Ada',
        verifyUrl
      ]);
    }
  });

  const wsMaster = XLSX.utils.aoa_to_sheet(masterFlatRows);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master Database Lengkap');

  // 2. Sheet 2: Data Santri (Format EMIS / Dapodik)
  const studentRows = [
    ['NO', 'NIS / ID', 'NAMA LENGKAP SANTRI', 'JENIS KELAMIN', 'KELAS', 'NAMA WALI', 'NO TELP / HP WALI'],
    ...students.map((s, idx) => [
      idx + 1,
      s.nis,
      s.name,
      s.gender === 'L' ? 'L' : 'P',
      classes.find((c) => c.id === s.classId)?.name || s.classId,
      s.parentName || '-',
      s.parentPhone || '-'
    ])
  ];
  const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Data Santri');

  // 3. Sheet 3: Data Kelas & Guru
  const classRows = [
    ['NO', 'ID KELAS', 'NAMA KELAS', 'TINGKAT', 'GURU / USTADZ PENGAJAR', 'TARGET HAFALAN KELAS', 'JUMLAH SANTRI'],
    ...classes.map((c, idx) => [
      idx + 1,
      c.id,
      c.name,
      c.gradeLevel,
      c.teacherName,
      c.targetHafalan,
      students.filter((s) => s.classId === c.id).length
    ])
  ];
  const wsClasses = XLSX.utils.aoa_to_sheet(classRows);
  XLSX.utils.book_append_sheet(wb, wsClasses, 'Data Kelas & Pengajar');

  const filename = `Master_Interoperable_Data_${settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${settings.academicYear.replace('/', '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Generate CSV Flat representation of all student scores (compatible with SQL / Data Loader)
 */
export function generateFlatCsv(
  students: Student[],
  classes: ClassRoom[],
  reports: StudentReport[],
  settings: SchoolSettings
): string {
  const rows: string[][] = [
    [
      'nis',
      'name',
      'gender',
      'class_id',
      'class_name',
      'teacher_name',
      'academic_year',
      'semester',
      'ummi_target',
      'ummi_achievement',
      'turjuman_achievement',
      'turjuman_predicate',
      'tahfidz_exam_score',
      'tahfidz_exam_predicate',
      'hadits_average',
      'hadits_predicate',
      'verification_url'
    ]
  ];

  students.forEach((s) => {
    const c = classes.find((cls) => cls.id === s.classId);
    const r = reports.find((rep) => rep.studentId === s.id);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verifyUrl = `${origin}/?view=parent&nis=${s.nis}`;

    rows.push([
      `"${s.nis}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.gender}"`,
      `"${c?.id || s.classId}"`,
      `"${(c?.name || s.classId).replace(/"/g, '""')}"`,
      `"${(c?.teacherName || '-').replace(/"/g, '""')}"`,
      `"${r?.academicYear || settings.academicYear}"`,
      `"${r?.semester || settings.semester}"`,
      `"${r?.pembelajaranAlQuran.jilid.targetSemester || '-'}"`,
      `"${r?.pembelajaranAlQuran.jilid.prestasiBelajar || '-'}"`,
      `"${r?.pembelajaranAlQuran.turjuman.prestasiBelajar || '-'}"`,
      `"${r?.pembelajaranAlQuran.turjuman.keterangan || '-'}"`,
      `"${r?.hafalanAlQuran.ujianSemester.nilai ?? '-'}"`,
      `"${r?.hafalanAlQuran.ujianSemester.predikat || '-'}"`,
      `"${r?.hafalanHadits.rataRata ?? '-'}"`,
      `"${r?.hafalanHadits.predikat || '-'}"`,
      `"${verifyUrl}"`
    ]);
  });

  return rows.map((r) => r.join(',')).join('\n');
}

/**
 * Trigger file download directly in browser
 */
export function downloadRawFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}
