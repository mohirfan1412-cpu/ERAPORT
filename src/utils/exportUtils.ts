import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { HADITS_LIST, getHaditsList } from './reportCalculations';

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
    element.style.padding = '20px 24px';

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
    element.style.padding = '20px 24px';

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

    // Section III: HAFALAN HADITS (Hanya disertakan jika fitur aktif di pengaturan)
    ...(settings.showHaditsSection
      ? [
          [settings.haditsSectionTitle || 'III. HAFALAN HADITS'],
          ['NO', 'Jenis Evaluasi', ...getHaditsList(settings.haditsNames).map((h) => h.title)],
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
            haditsData.scores.laranganTidakMenyapa ?? 85,
          ],
          ['Rata-Rata Nilai Hadits:', haditsData.rataRata ?? 85, 'Predikat:', haditsData.predikat || 'Jayyid'],
          [],
        ]
      : []),

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
 * Unduh Template Excel Resmi untuk Menambah / Mengimpor Data Pengguna (Guru, Koordinator, Admin) dalam Jumlah Banyak
 */
export function downloadUserImportTemplate(classes: ClassRoom[] = []) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data Pengguna
  const templateRows: any[][] = [
    [
      'NO',
      'NAMA_LENGKAP',
      'USERNAME',
      'NIY',
      'PERAN',
      'PASSWORD',
      'KELAS_DIAMPU',
      'NO_WHATSAPP',
      'EMAIL',
      'CATATAN'
    ],
    // Sample Row 1: Guru Al-Qur'an
    [
      1,
      'Ustadz M. Mujiono, S.Pd',
      'mujiono',
      'NIY. 20240101',
      'guru',
      'guru123',
      classes.length > 0 ? classes[0].name : 'Jilid 1, Tartil A',
      '081234567891',
      'mujiono@sekolah.sch.id',
      'Guru Al-Qur\'an UMMI & Tahfidz'
    ],
    // Sample Row 2: Guru Al-Qur'an 2
    [
      2,
      'Ustadzah Fatimah Azzahra, S.Pd.I',
      'fatimah',
      'NIY. 20240102',
      'guru',
      'guru123',
      classes.length > 1 ? classes[1].name : 'Jilid 2',
      '081234567892',
      'fatimah@sekolah.sch.id',
      'Pengampu Halaqah Putri'
    ],
    // Sample Row 3: Admin / Koordinator Khusus
    [
      3,
      'Ustadz H. Ahmad Fauzi, Lc',
      'ahmad.fauzi',
      'NIY. 20240201',
      'koordinator',
      'admin123',
      '',
      '081234567893',
      'koordinator@sekolah.sch.id',
      'Admin & Koordinator Penjamin Mutu Al-Qur\'an'
    ],
    // Sample Row 4: Super Admin
    [
      4,
      'Super Admin Utama',
      'superadmin',
      'NIY. 20240001',
      'super_admin',
      'admin',
      '',
      '081234567890',
      'admin@sekolah.sch.id',
      'Hak Akses Penuh Sistem'
    ],
  ];

  const wsTemplate = XLSX.utils.aoa_to_sheet(templateRows);

  // Set Widths
  wsTemplate['!cols'] = [
    { wch: 6 },  // NO
    { wch: 32 }, // NAMA_LENGKAP
    { wch: 18 }, // USERNAME
    { wch: 18 }, // NIY
    { wch: 16 }, // PERAN (guru / koordinator / super_admin)
    { wch: 16 }, // PASSWORD
    { wch: 30 }, // KELAS_DIAMPU
    { wch: 18 }, // NO_WHATSAPP
    { wch: 26 }, // EMAIL
    { wch: 35 }, // CATATAN
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Data Pengguna (Import)');

  // Sheet 2: Petunjuk & Referensi Kelas
  const guideRows: any[][] = [
    ['PANDUAN & PETUNJUK PENGISIAN IMPORT EXCEL PENGGUNA'],
    [''],
    ['1. KOLOM NAMA_LENGKAP', ':', 'Wajib diisi dengan nama lengkap beserta gelar (Contoh: Ustadz Ahmad, S.Pd)'],
    ['2. KOLOM USERNAME', ':', 'Wajib diisi, huruf kecil tanpa spasi (Contoh: ahmad / ustadz.ahmad). Digunakan saat login.'],
    ['3. KOLOM NIY', ':', 'Wajib diisi dengan Nomor Induk Yayasan (Contoh: NIY. 20240101). Digunakan sebagai otentikasi login.'],
    ['4. KOLOM PERAN', ':', 'Pilihan yang valid: "guru" (Guru Al-Qur\'an), "koordinator" (Admin Khusus), atau "super_admin" (Super Admin)'],
    ['5. KOLOM PASSWORD', ':', 'Opsional. Jika dikosongkan, pengguna dapat masuk menggunakan NIY atau password bawaan "guru".'],
    ['6. KOLOM KELAS_DIAMPU', ':', 'Opsional untuk Guru. Masukkan nama kelas/halaqah yang diampu. Pisahkan dengan tanda koma (,) jika lebih dari satu.'],
    ['7. KOLOM NO_WHATSAPP', ':', 'Opsional. Nomor kontak aktif untuk komunikasi dan notifikasi.'],
    ['8. KOLOM EMAIL', ':', 'Opsional. Alamat email pengguna.'],
    [''],
    ['DAFTAR NAMA KELAS / HALAQAH TERDAFTAR SAAT INI (Bisa disalin ke kolom KELAS_DIAMPU):'],
    ['NO', 'NAMA KELAS', 'TARGET HAFALAN', 'GURU PENGAJAR SEKARANG']
  ];

  classes.forEach((cls, idx) => {
    guideRows.push([
      idx + 1,
      cls.name,
      cls.targetHafalan || '-',
      cls.teacherName || '-'
    ]);
  });

  if (classes.length === 0) {
    guideRows.push([1, 'Belum ada kelas terdaftar di aplikasi', '-', '-']);
  }

  const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
  wsGuide['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 20 },
    { wch: 28 }
  ];

  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk & Daftar Kelas');

  // Unduh Berkas
  XLSX.writeFile(wb, 'Template_Import_User_Guru_Admin.xlsx');
}

/**
 * Parsing & Validasi Berkas Excel Pengguna untuk Tambah / Update Pengguna Massal
 */
export async function parseUsersFromExcel(
  file: File,
  classes: ClassRoom[] = []
): Promise<{
  parsedUsers: Array<{
    name: string;
    username: string;
    niy: string;
    role: 'super_admin' | 'coordinator' | 'teacher';
    password?: string;
    assignedClassIds?: string[];
    assignedClassNames?: string[];
    phone?: string;
    email?: string;
    notes?: string;
    isValid: boolean;
    errorReason?: string;
  }>;
  totalRows: number;
  validCount: number;
  invalidCount: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Gunakan sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert ke JSON raw array of objects atau 2D array
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length < 2) {
          resolve({ parsedUsers: [], totalRows: 0, validCount: 0, invalidCount: 0 });
          return;
        }

        // Cari index header
        let headerRowIndex = 0;
        let headerMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const row = rawRows[i];
          if (Array.isArray(row)) {
            const rowStr = row.map((cell) => String(cell || '').trim().toLowerCase());
            if (rowStr.some((c) => c.includes('nama') || c.includes('username') || c.includes('niy') || c.includes('peran') || c.includes('role'))) {
              headerRowIndex = i;
              row.forEach((colName: any, colIdx: number) => {
                const norm = String(colName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                headerMap[norm] = colIdx;
              });
              break;
            }
          }
        }

        const getColVal = (row: any[], keys: string[]): string => {
          for (const k of keys) {
            const idx = headerMap[k];
            if (idx !== undefined && row[idx] !== undefined) {
              const val = String(row[idx]).trim();
              if (val.length > 0) return val;
            }
          }
          return '';
        };

        const parsedUsers: any[] = [];
        let validCount = 0;
        let invalidCount = 0;

        // Loop rows setelah header
        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || !Array.isArray(row) || row.every((c) => String(c || '').trim() === '')) {
            continue; // Skip baris kosong
          }

          const rawName = getColVal(row, ['namalengkap', 'nama', 'fullname', 'name', 'namapengguna', 'namaguru']);
          const rawUsername = getColVal(row, ['username', 'user', 'namauser', 'login', 'iduser']);
          const rawNiy = getColVal(row, ['niy', 'nip', 'noinduk', 'nomorinduk', 'niyyayasan', 'id']);
          const rawRole = getColVal(row, ['peran', 'role', 'akses', 'jabatan', 'hakakses']).toLowerCase();
          const rawPassword = getColVal(row, ['password', 'sandi', 'pin', 'kunci', 'pass']);
          const rawClasses = getColVal(row, ['kelasdiampu', 'kelas', 'halaqah', 'assignedclasses', 'rombel']);
          const rawPhone = getColVal(row, ['nowhatsapp', 'whatsapp', 'wa', 'nohp', 'hp', 'phone', 'telp', 'telepon']);
          const rawEmail = getColVal(row, ['email', 'surel', 'mail']);
          const rawNotes = getColVal(row, ['catatan', 'notes', 'keterangan', 'ket']);

          // Validasi kelengkapan
          let isValid = true;
          let errorReason = '';

          if (!rawName) {
            isValid = false;
            errorReason = 'Nama lengkap wajib diisi';
          } else if (!rawUsername) {
            isValid = false;
            errorReason = 'Username wajib diisi';
          } else if (!rawNiy) {
            isValid = false;
            errorReason = 'NIY wajib diisi';
          }

          // Normalisasi Username
          const cleanUsername = rawUsername.toLowerCase().replace(/\s+/g, '.');

          // Normalisasi Role
          let cleanRole: 'super_admin' | 'coordinator' | 'teacher' = 'teacher';
          if (rawRole.includes('super') || rawRole.includes('admin utama')) {
            cleanRole = 'super_admin';
          } else if (rawRole.includes('koordinator') || rawRole.includes('admin') || rawRole.includes('coordinator')) {
            cleanRole = 'coordinator';
          } else {
            cleanRole = 'teacher';
          }

          // Resolusi Kelas
          const assignedClassIds: string[] = [];
          const assignedClassNames: string[] = [];

          if (rawClasses) {
            const classTokens = rawClasses.split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean);
            classTokens.forEach((token) => {
              const matched = classes.find(
                (c) =>
                  c.name.toLowerCase() === token.toLowerCase() ||
                  c.id.toLowerCase() === token.toLowerCase() ||
                  c.name.toLowerCase().includes(token.toLowerCase())
              );
              if (matched) {
                if (!assignedClassIds.includes(matched.id)) {
                  assignedClassIds.push(matched.id);
                  assignedClassNames.push(matched.name);
                }
              } else {
                assignedClassNames.push(token);
              }
            });
          }

          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          parsedUsers.push({
            name: rawName,
            username: cleanUsername,
            niy: rawNiy,
            role: cleanRole,
            password: rawPassword || '',
            assignedClassIds,
            assignedClassNames,
            phone: rawPhone,
            email: rawEmail,
            notes: rawNotes,
            isValid,
            errorReason,
          });
        }

        resolve({
          parsedUsers,
          totalRows: parsedUsers.length,
          validCount,
          invalidCount,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal membaca berkas Excel. Pastikan format sesuai template.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Terjadi kesalahan saat membaca file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Unduh Template Excel Resmi untuk Menambah / Mengimpor Data Santri dalam Jumlah Banyak
 */
export function downloadStudentImportTemplate(classes: ClassRoom[] = []) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data Santri
  const templateRows: any[][] = [
    [
      'NO',
      'NIS',
      'NAMA_SANTRI',
      'JENIS_KELAMIN',
      'KELAS',
      'NAMA_ORANG_TUA',
      'NO_WHATSAPP_WALI'
    ],
    // Sample Row 1 (Laki-laki)
    [
      1,
      '2311063101',
      'MUHAMMAD DZAKKI RAMADHAN',
      'L',
      classes.length > 0 ? classes[0].name : 'IX A - AL HAITAMI',
      'H. Bambang Irawan',
      '081234567890'
    ],
    // Sample Row 2 (Perempuan)
    [
      2,
      '2311063102',
      'AISYAH AZ-ZAHRA HUMAIRA',
      'P',
      classes.length > 1 ? classes[1].name : (classes[0]?.name || 'IX B - IBNU SINA'),
      'Drs. Hendro Wibowo',
      '081234567891'
    ],
    // Sample Row 3 (Laki-laki)
    [
      3,
      '2311063103',
      'FATHAN AL-FARISI',
      'L',
      classes.length > 0 ? classes[0].name : 'IX A - AL HAITAMI',
      'Rudi Hartono, S.T',
      '081234567892'
    ],
    // Sample Row 4 (Perempuan)
    [
      4,
      '2311063104',
      'KHANSA NABILA PUTRI',
      'P',
      classes.length > 2 ? classes[2].name : (classes[0]?.name || 'VIII A - AL KHINDI'),
      'Ahmad Sofyan',
      '081234567893'
    ],
  ];

  const wsTemplate = XLSX.utils.aoa_to_sheet(templateRows);

  // Set Column Widths
  wsTemplate['!cols'] = [
    { wch: 6 },  // NO
    { wch: 18 }, // NIS
    { wch: 36 }, // NAMA_SANTRI
    { wch: 16 }, // JENIS_KELAMIN (L / P)
    { wch: 30 }, // KELAS
    { wch: 30 }, // NAMA_ORANG_TUA
    { wch: 20 }, // NO_WHATSAPP_WALI
  ];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Data Santri (Import)');

  // Sheet 2: Petunjuk & Daftar Kelas Terdaftar
  const guideRows: any[][] = [
    ['PANDUAN & PETUNJUK PENGISIAN IMPORT EXCEL DATA SANTRI'],
    [''],
    ['1. KOLOM NO', ':', 'Nomor urut data (opsional/otomatis).'],
    ['2. KOLOM NIS', ':', 'Wajib diisi dengan Nomor Induk Santri/Siswa yang unik (Contoh: 2311063101).'],
    ['3. KOLOM NAMA_SANTRI', ':', 'Wajib diisi dengan nama lengkap santri (Contoh: MUHAMMAD DZAKKI RAMADHAN).'],
    ['4. KOLOM JENIS_KELAMIN', ':', 'Wajib diisi dengan kode "L" (Laki-laki) atau "P" (Perempuan).'],
    ['5. KOLOM KELAS', ':', 'Wajib diisi dengan nama kelas/halaqah yang terdaftar di sistem (lihat tabel di bawah).'],
    ['6. KOLOM NAMA_ORANG_TUA', ':', 'Opsional. Nama Ayah/Ibu/Wali santri.'],
    ['7. KOLOM NO_WHATSAPP_WALI', ':', 'Opsional. Nomor WhatsApp wali santri untuk pengiriman laporan raport & notifikasi.'],
    [''],
    ['DAFTAR NAMA KELAS / HALAQAH YANG TERDAFTAR SAAT INI (Bisa disalin persis ke kolom KELAS):'],
    ['NO', 'NAMA KELAS', 'TARGET HAFALAN', 'GURU PENGAMPU']
  ];

  classes.forEach((cls, idx) => {
    guideRows.push([
      idx + 1,
      cls.name,
      cls.targetHafalan || '-',
      cls.teacherName || '-'
    ]);
  });

  if (classes.length === 0) {
    guideRows.push([1, 'Belum ada kelas terdaftar di aplikasi', '-', '-']);
  }

  const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
  wsGuide['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 20 },
    { wch: 28 }
  ];

  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk & Daftar Kelas');

  // Unduh Berkas
  XLSX.writeFile(wb, 'Template_Import_Data_Santri.xlsx');
}

/**
 * Parsing & Validasi Berkas Excel Santri untuk Tambah / Import Santri Massal
 */
export async function parseStudentsFromExcel(
  file: File,
  classes: ClassRoom[] = []
): Promise<{
  parsedStudents: Array<{
    nis: string;
    name: string;
    gender: 'L' | 'P';
    classId: string;
    className: string;
    parentName: string;
    parentPhone: string;
    isValid: boolean;
    errorReason?: string;
  }>;
  totalRows: number;
  validCount: number;
  invalidCount: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Gunakan sheet pertama
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawRows || rawRows.length < 2) {
          resolve({ parsedStudents: [], totalRows: 0, validCount: 0, invalidCount: 0 });
          return;
        }

        // Cari baris header
        let headerRowIndex = 0;
        let headerMap: Record<string, number> = {};

        for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
          const row = rawRows[i];
          if (Array.isArray(row)) {
            const rowStr = row.map((cell) => String(cell || '').trim().toLowerCase());
            if (rowStr.some((c) => c.includes('nis') || c.includes('santri') || c.includes('nama') || c.includes('siswa'))) {
              headerRowIndex = i;
              row.forEach((colName: any, colIdx: number) => {
                const norm = String(colName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                headerMap[norm] = colIdx;
              });
              break;
            }
          }
        }

        const getColVal = (row: any[], keys: string[]): string => {
          for (const k of keys) {
            const idx = headerMap[k];
            if (idx !== undefined && row[idx] !== undefined) {
              const val = String(row[idx]).trim();
              if (val.length > 0) return val;
            }
          }
          return '';
        };

        const parsedStudents: any[] = [];
        let validCount = 0;
        let invalidCount = 0;

        for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || !Array.isArray(row) || row.every((c) => String(c || '').trim() === '')) {
            continue; // Lewati baris kosong
          }

          const rawNis = getColVal(row, ['nis', 'noinduk', 'nomorinduk', 'id', 'nissiswa', 'nissantri']);
          const rawName = getColVal(row, ['namasantri', 'nama', 'namalengkap', 'fullname', 'name', 'namasiswa', 'santri']);
          const rawGender = getColVal(row, ['jeniskelamin', 'jk', 'gender', 'lp', 'sex']).toUpperCase();
          const rawClass = getColVal(row, ['kelas', 'namakelas', 'rombel', 'halaqah', 'class', 'classid']);
          const rawParentName = getColVal(row, ['namaorangtua', 'namaortu', 'orangtua', 'wali', 'namawali', 'parent', 'parentname']);
          const rawParentPhone = getColVal(row, ['nowhatsappwali', 'nowhatsapp', 'whatsapp', 'wa', 'nohp', 'hp', 'phone', 'kontak', 'kontakwali', 'telepon']);

          let isValid = true;
          let errorReason = '';

          if (!rawNis) {
            isValid = false;
            errorReason = 'NIS wajib diisi';
          } else if (!rawName) {
            isValid = false;
            errorReason = 'Nama santri wajib diisi';
          }

          // Normalisasi Gender
          let cleanGender: 'L' | 'P' = 'L';
          if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('AKHWAT') || rawGender.includes('FEMALE') || rawGender === 'F') {
            cleanGender = 'P';
          } else {
            cleanGender = 'L';
          }

          // Resolusi Kelas
          let resolvedClassId = classes[0]?.id || 'class-default';
          let resolvedClassName = classes[0]?.name || 'Kelas Utama';

          if (rawClass && classes.length > 0) {
            const matched = classes.find(
              (c) =>
                c.name.toLowerCase() === rawClass.toLowerCase() ||
                c.id.toLowerCase() === rawClass.toLowerCase() ||
                c.name.toLowerCase().includes(rawClass.toLowerCase()) ||
                rawClass.toLowerCase().includes(c.name.toLowerCase())
            );

            if (matched) {
              resolvedClassId = matched.id;
              resolvedClassName = matched.name;
            } else {
              resolvedClassName = rawClass;
            }
          }

          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          parsedStudents.push({
            nis: rawNis,
            name: rawName.toUpperCase(),
            gender: cleanGender,
            classId: resolvedClassId,
            className: resolvedClassName,
            parentName: rawParentName,
            parentPhone: rawParentPhone,
            isValid,
            errorReason,
          });
        }

        resolve({
          parsedStudents,
          totalRows: parsedStudents.length,
          validCount,
          invalidCount,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal membaca berkas Excel. Pastikan format sesuai template.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Terjadi kesalahan saat membaca file.'));
    };

    reader.readAsArrayBuffer(file);
  });
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
