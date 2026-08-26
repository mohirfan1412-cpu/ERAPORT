import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { HADITS_LIST } from './reportCalculations';

/**
 * Robust, perfectly symmetrical Export Raport Al-Qur'an to PDF (Format F4 / Folio: 215mm x 330mm).
 * - High-resolution crisp rasterization (300+ DPI equivalent with pixelRatio: 3).
 * - Formatted specifically for Folio / F4 (21.5 cm x 33.0 cm).
 * - Symmetrical margins matching atas, bawah, kanan, kiri, and centered placement.
 */
export async function exportReportToPdf(elementId: string, filename: string): Promise<boolean> {
  let element = document.getElementById(elementId);

  // If specified element is not found, search for any available report card element
  if (!element) {
    element =
      document.getElementById('official-report-card') ||
      document.getElementById('editor-preview-card') ||
      document.getElementById('parent-report-card') ||
      document.getElementById('export-hidden-report-card');
  }

  if (!element) {
    console.error('Element not found for PDF export:', elementId);
    alert('Elemen raport tidak ditemukan untuk diekspor. Silakan buka tab Pratinjau atau coba lagi.');
    return false;
  }

  // Clone node or prepare element to guarantee fixed dimensions and remove any surrounding borders
  const originalStyle = element.getAttribute('style') || '';
  const parentContainer = element.parentElement;
  const parentOriginalStyle = parentContainer ? parentContainer.getAttribute('style') || '' : '';

  try {
    // Standard target capture dimensions for F4 ratio
    const targetWidth = 794; // px (standard 96 DPI for ~215mm)

    // If container is positioned offscreen or hidden, temporarily standardize its dimensions
    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.style.position = 'fixed';
      parentContainer.style.top = '0';
      parentContainer.style.left = '0';
      parentContainer.style.width = `${targetWidth}px`;
      parentContainer.style.opacity = '1';
      parentContainer.style.zIndex = '99999';
      parentContainer.style.background = '#ffffff';
      parentContainer.style.visibility = 'visible';
    }

    // Force exact standard width and remove any box-shadow or outer outline during capture
    element.style.width = `${targetWidth}px`;
    element.style.maxWidth = `${targetWidth}px`;
    element.style.minWidth = `${targetWidth}px`;
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';
    element.style.backgroundColor = '#ffffff';
    element.style.margin = '0';
    element.style.padding = '24px 28px';

    // Capture using html-to-image with pixelRatio 3 for razor-sharp typography
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 3, // Ultra-crisp 300+ DPI equivalent
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node) => {
        // Exclude interactive buttons or non-printable controls
        if (node instanceof HTMLElement && (node.classList.contains('no-print') || node.classList.contains('hidden-print'))) {
          return false;
        }
        return true;
      },
    });

    // Reset styles immediately after capture
    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.setAttribute('style', parentOriginalStyle);
    }
    element.setAttribute('style', originalStyle);

    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('Canvas render returned empty data');
    }

    // Build PDF for F4 / Folio (215mm x 330mm)
    const pageWidth = 215; // F4 / Folio width in mm
    const pageHeight = 330; // F4 / Folio height in mm
    const margin = 7.5; // Balanced 7.5mm margin for all 4 sides (atas, bawah, kanan, kiri)

    const printableWidth = pageWidth - margin * 2; // 200 mm
    const printableHeight = pageHeight - margin * 2; // 315 mm

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
      compress: true,
    });

    // Create an image object to calculate natural aspect ratio
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load generated image'));
      img.src = dataUrl;
    });

    const imgRatio = img.width / img.height;
    const printableRatio = printableWidth / printableHeight;

    // Calculate dimensions to fit exactly within F4 page with matching margins
    let finalWidth: number;
    let finalHeight: number;

    if (imgRatio > printableRatio) {
      // Constrained by width
      finalWidth = printableWidth;
      finalHeight = finalWidth / imgRatio;
    } else {
      // Constrained by height
      finalHeight = printableHeight;
      finalWidth = finalHeight * imgRatio;
    }

    // Perfectly center on F4 page both horizontally and vertically so margins on all 4 sides are balanced
    const posX = (pageWidth - finalWidth) / 2;
    const posY = (pageHeight - finalHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

    // Direct Blob Trigger for immediate, reliable download
    try {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = cleanFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 300);
    } catch (blobErr) {
      console.warn('Blob download fallback to pdf.save:', blobErr);
      pdf.save(cleanFilename);
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);

    // Reset styles in case of error
    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.setAttribute('style', parentOriginalStyle);
    }
    element.setAttribute('style', originalStyle);

    // Fallback: Notify user and offer print
    const userWantsPrint = window.confirm(
      'Unduh otomatis mengalami kendala pada browser ini. Apakah Anda ingin membuka dialog Cetak / Simpan sebagai PDF langsung?'
    );
    if (userWantsPrint) {
      window.print();
    }
    return false;
  }
}

/**
 * Generate PDF Blob for direct upload to Google Drive
 */
export async function generateReportPdfBlob(elementId: string): Promise<Blob | null> {
  let element = document.getElementById(elementId);
  if (!element) {
    element =
      document.getElementById('official-report-card') ||
      document.getElementById('editor-preview-card') ||
      document.getElementById('parent-report-card') ||
      document.getElementById('export-hidden-report-card');
  }
  if (!element) return null;

  const originalStyle = element.getAttribute('style') || '';
  const parentContainer = element.parentElement;
  const parentOriginalStyle = parentContainer ? parentContainer.getAttribute('style') || '' : '';

  try {
    const targetWidth = 794;
    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.style.position = 'fixed';
      parentContainer.style.top = '0';
      parentContainer.style.left = '0';
      parentContainer.style.width = `${targetWidth}px`;
      parentContainer.style.opacity = '1';
      parentContainer.style.zIndex = '99999';
      parentContainer.style.background = '#ffffff';
      parentContainer.style.visibility = 'visible';
    }

    element.style.width = `${targetWidth}px`;
    element.style.maxWidth = `${targetWidth}px`;
    element.style.minWidth = `${targetWidth}px`;
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0px';
    element.style.backgroundColor = '#ffffff';
    element.style.margin = '0';
    element.style.padding = '24px 28px';

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && (node.classList.contains('no-print') || node.classList.contains('hidden-print'))) {
          return false;
        }
        return true;
      },
    });

    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.setAttribute('style', parentOriginalStyle);
    }
    element.setAttribute('style', originalStyle);

    const pageWidth = 215;
    const pageHeight = 330;
    const margin = 7.5;
    const printableWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
      compress: true,
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });

    const imgRatio = img.width / img.height;
    const printableRatio = printableWidth / printableHeight;
    let finalWidth: number;
    let finalHeight: number;

    if (imgRatio > printableRatio) {
      finalWidth = printableWidth;
      finalHeight = finalWidth / imgRatio;
    } else {
      finalHeight = printableHeight;
      finalWidth = finalHeight * imgRatio;
    }

    const posX = (pageWidth - finalWidth) / 2;
    const posY = (pageHeight - finalHeight) / 2;
    pdf.addImage(dataUrl, 'PNG', posX, posY, finalWidth, finalHeight, undefined, 'FAST');

    return pdf.output('blob');
  } catch (err) {
    console.error('Failed to generate PDF blob:', err);
    if (parentContainer && (parentContainer.id?.includes('hidden') || element.id === 'export-hidden-report-card')) {
      parentContainer.setAttribute('style', parentOriginalStyle);
    }
    element.setAttribute('style', originalStyle);
    return null;
  }
}

/**
 * Export Individual Student Report to Excel.
 * Formatted with clean column widths, merged headers, and structured tables so data doesn't get corrupted.
 */
export function exportReportToExcel(
  student: Student,
  classroom: ClassRoom | undefined,
  report: StudentReport,
  settings: SchoolSettings
) {
  const wb = XLSX.utils.book_new();

  const quranData = report.pembelajaranAlQuran;
  const hafalanData = report.hafalanAlQuran;
  const haditsData = report.hafalanHadits;

  // Sheet 1: Format Raport Resmi
  const rows: (string | number)[][] = [
    // 0: Header Kop
    [settings.schoolName.toUpperCase()],
    ['LAPORAN PERKEMBANGAN KOMPETENSI AL-QUR\'AN METODE UMMI DAN TAHFIDZ'],
    [`TAHUN PELAJARAN ${report.academicYear || settings.academicYear} - SEMESTER ${report.semester || settings.semester}`],
    [], // 3: Empty

    // 4-6: Biodata Santri
    ['Nama Santri', ':', student.name.toUpperCase(), '', '', 'NIS', ':', student.nis],
    ['Kelas', ':', classroom?.name || student.classId, '', '', 'Jenis Kelamin', ':', student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'],
    ['Guru Pengajar', ':', report.teacherName || classroom?.teacherName || 'M. Mujiono, S.Pd', '', '', 'Target Kelas', ':', hafalanData.targetHafalanKelas || classroom?.targetHafalan || 'Juz 2'],
    [], // 7: Empty

    // 8: Section I Title
    ['I. PEMBELAJARAN AL-QUR\'AN'],
    // 9-13: Tabel Jilid & Tartil
    ['NO', 'Materi Al-Qur\'an', 'Target Semester', 'Prestasi Belajar', 'Makhroj (M)', 'Mad', 'Tajwid (T)', 'Kelancaran (K)', 'Keterangan'],
    [
      1,
      'JILID',
      quranData.jilid.targetSemester || 'Pasca',
      quranData.jilid.prestasiBelajar || '-',
      quranData.jilid.m || '-',
      quranData.jilid.mad || '-',
      quranData.jilid.t || '-',
      quranData.jilid.k || '-',
      quranData.jilid.keterangan || '-'
    ],
    [
      2,
      'TARTIL',
      quranData.tartil.targetSemester || 'Pasca',
      quranData.tartil.prestasiBelajar || '-',
      quranData.tartil.m || '-',
      quranData.tartil.mad || '-',
      quranData.tartil.t || '-',
      quranData.tartil.k || '-',
      quranData.tartil.keterangan || '-'
    ],
    ['Deskripsi Jilid & Tartil:', quranData.deskripsiJilidTartil || '-'],
    [],

    // 15-18: Tabel Turjuman
    ['NO', 'Materi Al-Qur\'an', 'Target Semester', 'Prestasi Belajar', 'Nilai Per Kata', 'Nilai Per Kalimat', 'Nilai Intisari', 'Nilai Imla\'', 'Keterangan'],
    [
      3,
      'TURJUMAN',
      quranData.turjuman.targetSemester || 'Turjuman 5',
      quranData.turjuman.prestasiBelajar || 'LULUS',
      quranData.turjuman.perKata ?? 90,
      quranData.turjuman.perKalimat ?? 90,
      quranData.turjuman.intisari ?? 87,
      quranData.turjuman.imla ?? '-',
      quranData.turjuman.keterangan || 'Jayyid Jiddan'
    ],
    ['Deskripsi Turjuman:', quranData.deskripsiTurjuman || '-'],
    [],

    // 20: Section II Title
    ['II. HAFALAN AL-QUR\'AN & EVALUASI'],
    ['Target Hafalan Kelas:', hafalanData.targetHafalanKelas || classroom?.targetHafalan || 'Juz 2'],
    ['CAPAIAN HAFALAN SANTRI (Centang / Checklist):'],
    ['NO', 'Juz 30', 'Juz 29', 'Juz 28', 'Juz 1', 'Juz 2', 'Juz 3', 'Juz 4', 'Juz 5', 'Juz 6', 'Juz 7', 'Juz 8', 'Juz 9', 'Juz 10'],
    [
      1,
      hafalanData.capaianHafalan.juz30 ? 'V' : '-',
      hafalanData.capaianHafalan.juz29 ? 'V' : '-',
      hafalanData.capaianHafalan.juz28 ? 'V' : '-',
      hafalanData.capaianHafalan.juz1 ? 'V' : '-',
      hafalanData.capaianHafalan.juz2 ? 'V' : '-',
      hafalanData.capaianHafalan.juz3 ? 'V' : '-',
      hafalanData.capaianHafalan.juz4 ? 'V' : '-',
      hafalanData.capaianHafalan.juz5 ? 'V' : '-',
      hafalanData.capaianHafalan.juz6 ? 'V' : '-',
      hafalanData.capaianHafalan.juz7 ? 'V' : '-',
      hafalanData.capaianHafalan.juz8 ? 'V' : '-',
      hafalanData.capaianHafalan.juz9 ? 'V' : '-',
      hafalanData.capaianHafalan.juz10 ? 'V' : '-'
    ],
    ['EVALUASI MUNAQOSYAH & UJIAN SEMESTER:'],
    ['NO', 'Jenis Evaluasi', 'Juz 30', 'Juz 29', 'Juz 28', 'Juz 1', 'Juz 2', 'Juz 3', 'Juz 4', 'Juz 5', 'Juz 6', 'Juz 7', 'Juz 8', 'Juz 9', 'Juz 10'],
    [
      1,
      'Munaqosyah',
      hafalanData.munaqosyah.juz30 || '-',
      hafalanData.munaqosyah.juz29 || '-',
      hafalanData.munaqosyah.juz28 || '-',
      hafalanData.munaqosyah.juz1 || '-',
      hafalanData.munaqosyah.juz2 || '-',
      hafalanData.munaqosyah.juz3 || '-',
      hafalanData.munaqosyah.juz4 || '-',
      hafalanData.munaqosyah.juz5 || '-',
      hafalanData.munaqosyah.juz6 || '-',
      hafalanData.munaqosyah.juz7 || '-',
      hafalanData.munaqosyah.juz8 || '-',
      hafalanData.munaqosyah.juz9 || '-',
      hafalanData.munaqosyah.juz10 || '-'
    ],
    [
      2,
      'Ujian Semester',
      'Nilai:',
      hafalanData.ujianSemester.nilai ?? 89,
      'Predikat:',
      hafalanData.ujianSemester.predikat || 'Jayyid',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ],
    ['Catatan Guru Tahfidz:', hafalanData.catatanGuru || '-'],
    [],

    // Section III Title
    ['III. HAFALAN HADITS'],
    ['NO', 'Jenis Evaluasi', ...HADITS_LIST.map((h) => h.title)],
    [
      1,
      'Hafalan Hadits',
      haditsData.scores.niat ?? 85,
      haditsData.scores.menuntutIlmu ?? 85,
      haditsData.scores.amalJariyah ?? 85,
      haditsData.scores.menunjukkanKebaikan ?? 85,
      haditsData.scores.laranganMenyembunyikanIlmu ?? 85,
      haditsData.scores.ikhlas ?? 85,
      haditsData.scores.rukunIslam ?? 85,
      haditsData.scores.mukminSempurna ?? 85,
      haditsData.scores.ridhoOrangTua ?? 85,
      haditsData.scores.laranganTidakMenyapa ?? 85
    ],
    ['Rata-Rata Nilai Hadits:', haditsData.rataRata ?? 85, 'Predikat:', haditsData.predikat || 'Jayyid'],
    [],

    // Titimangsa & Pengesahan
    ['Diberikan di', ':', report.issueCity || settings.issueCity || 'Balikpapan'],
    ['Tanggal Masehi', ':', report.issueDate || settings.issueDate || '02 Juni 2026'],
    ['Tanggal Hijriyah', ':', report.hijriDate || settings.hijriDate || '16 Dzulhijjah 1447 H'],
    [],
    ['Orang Tua / Wali Santri', '', '', '', 'Guru Al-Qur\'an UMMI & Tahfidz', '', '', '', 'Koordinator Al-Qur\'an'],
    ['', '', '', '', report.teacherName || classroom?.teacherName || 'M. Mujiono, S.Pd', '', '', '', settings.coordinatorName]
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set explicit column widths to prevent cramped text and broken columns
  ws['!cols'] = [
    { wch: 6 },  // Col A: NO / Label
    { wch: 26 }, // Col B: Materi / Title
    { wch: 16 }, // Col C
    { wch: 16 }, // Col D
    { wch: 14 }, // Col E
    { wch: 14 }, // Col F
    { wch: 14 }, // Col G
    { wch: 16 }, // Col H
    { wch: 22 }, // Col I
    { wch: 10 }, // Col J
    { wch: 10 }, // Col K
    { wch: 10 }, // Col L
    { wch: 10 }, // Col M
    { wch: 10 }, // Col N
    { wch: 10 }, // Col O
  ];

  // Set Merges for titles and descriptions
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Title 1
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Title 2
    { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Title 3
    { s: { r: 8, c: 0 }, e: { r: 8, c: 8 } }, // Section I header
    { s: { r: 12, c: 1 }, e: { r: 12, c: 8 } }, // Deskripsi Jilid
    { s: { r: 17, c: 1 }, e: { r: 17, c: 8 } }, // Deskripsi Turjuman
    { s: { r: 19, c: 0 }, e: { r: 19, c: 8 } }, // Section II header
    { s: { r: 28, c: 1 }, e: { r: 28, c: 14 } }, // Catatan guru
    { s: { r: 30, c: 0 }, e: { r: 30, c: 8 } }, // Section III header
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Raport Siswa');

  // Sheet 2: Ringkasan Nilai & Kriteria
  const kriteriaRows = [
    ['PEDOMAN PENILAIAN RAPORT AL-QUR\'AN UMMI & TAHFIDZ'],
    [],
    ['1. KRITERIA PREDIKAT NILAI HAFALAN & HADITS'],
    ['Predikat', 'Rentang Nilai', 'Keterangan'],
    ['Mumtaz', '100', 'Istimewa'],
    ['Jayyid Jiddan', '90 - 99', 'Sangat Memuaskan'],
    ['Jayyid', '80 - 89', 'Memuaskan'],
    ['Maqbul', '70 - 79', 'Cukup Memuaskan'],
    ['Kurang', '< 70', 'Perlu Bimbingan Tambahan'],
    [],
    ['2. ASPEK PENILAIAN TARTIL / JILID'],
    ['Kode', 'Aspek', 'Deskripsi'],
    ['M', 'Makhroj', 'Ketepatan keluarnya huruf hijaiyah'],
    ['Mad', 'Panjang/Pendek', 'Ketepatan kadar panjang 2, 4, 5, atau 6 harakat'],
    ['T', 'Tajwid', 'Kaidah hukum bacaan nun sukun, mim sukun, dll'],
    ['K', 'Kelancaran', 'Kelancaran, tempo bacaan, dan waqaf-ibtida\''],
  ];

  const wsKriteria = XLSX.utils.aoa_to_sheet(kriteriaRows);
  wsKriteria['!cols'] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 45 }
  ];
  wsKriteria['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 10, c: 0 }, e: { r: 10, c: 2 } },
  ];

  XLSX.utils.book_append_sheet(wb, wsKriteria, 'Pedoman Penilaian');

  const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Raport_${student.nis}_${cleanName}.xlsx`);
}

/**
 * Export Rekapitulasi Nilai Seluruh Kelas ke Excel.
 */
export function exportClassMasterExcel(
  classroom: ClassRoom,
  students: Student[],
  reports: StudentReport[],
  settings: SchoolSettings
) {
  const wb = XLSX.utils.book_new();

  // Summary header
  const rows: (string | number)[][] = [
    [`REKAPITULASI RAPORT AL-QUR'AN & TAHFIDZ METODE UMMI`],
    [`LEMBAGA: ${settings.schoolName.toUpperCase()}`],
    [`KELAS: ${classroom.name} | TAHUN PELAJARAN: ${settings.academicYear} | SEMESTER: ${settings.semester}`],
    [`GURU PENGAJAR: ${classroom.teacherName} | TARGET KELAS: ${classroom.targetHafalan}`],
    [],
    [
      'No',
      'NIS',
      'Nama Santri',
      'JK',
      'Turjuman (Kata)',
      'Turjuman (Kalimat)',
      'Turjuman (Intisari)',
      'Predikat Turjuman',
      'Target Kelas',
      'Juz 30',
      'Juz 29',
      'Juz 28',
      'Juz 1',
      'Juz 2',
      'Nilai Ujian Semester',
      'Predikat Ujian',
      'Rata-rata Hadits',
      'Predikat Hadits',
      'Catatan Guru'
    ]
  ];

  students.forEach((s, idx) => {
    const r = reports.find((rep) => rep.studentId === s.id);
    if (r) {
      rows.push([
        idx + 1,
        s.nis,
        s.name.toUpperCase(),
        s.gender,
        r.pembelajaranAlQuran.turjuman.perKata ?? '-',
        r.pembelajaranAlQuran.turjuman.perKalimat ?? '-',
        r.pembelajaranAlQuran.turjuman.intisari ?? '-',
        r.pembelajaranAlQuran.turjuman.keterangan || '-',
        r.hafalanAlQuran.targetHafalanKelas || classroom.targetHafalan,
        r.hafalanAlQuran.capaianHafalan.juz30 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz29 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz28 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz1 ? 'V' : '-',
        r.hafalanAlQuran.capaianHafalan.juz2 ? 'V' : '-',
        r.hafalanAlQuran.ujianSemester.nilai ?? '-',
        r.hafalanAlQuran.ujianSemester.predikat || '-',
        r.hafalanHadits.rataRata ?? '-',
        r.hafalanHadits.predikat || '-',
        r.hafalanAlQuran.catatanGuru || '-'
      ]);
    } else {
      rows.push([
        idx + 1,
        s.nis,
        s.name.toUpperCase(),
        s.gender,
        '-', '-', '-', 'Belum Input',
        classroom.targetHafalan,
        '-', '-', '-', '-', '-',
        '-', '-', '-', '-', 'Belum ada data'
      ]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // NIS
    { wch: 28 }, // Nama
    { wch: 6 },  // JK
    { wch: 15 }, // Kata
    { wch: 18 }, // Kalimat
    { wch: 17 }, // Intisari
    { wch: 18 }, // Predikat Turjuman
    { wch: 14 }, // Target Kelas
    { wch: 8 },  // Juz 30
    { wch: 8 },  // Juz 29
    { wch: 8 },  // Juz 28
    { wch: 8 },  // Juz 1
    { wch: 8 },  // Juz 2
    { wch: 19 }, // Nilai Ujian
    { wch: 15 }, // Predikat Ujian
    { wch: 16 }, // Hadits Avg
    { wch: 15 }, // Hadits Pred
    { wch: 45 }, // Catatan Guru
  ];

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 18 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 18 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 18 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 18 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws, `Rekap ${classroom.name.substring(0, 15)}`);

  const cleanClassName = classroom.name.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Rekap_Raport_Kelas_${cleanClassName}_${settings.academicYear.replace('/', '-')}.xlsx`);
}

/**
 * Print standard report directly using native browser print dialog.
 */
export function printElementDirectly(elementId: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }
  window.print();
}
