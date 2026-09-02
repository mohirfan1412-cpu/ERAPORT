import React from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { HADITS_LIST, JUZ_LIST, getHaditsList } from '../utils/reportCalculations';
import { KopLogo, SecondaryLogo } from './KopLogo';

interface ReportCardViewProps {
  student: Student;
  classroom?: ClassRoom;
  report: StudentReport;
  settings: SchoolSettings;
  elementId?: string;
  className?: string;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  student,
  classroom,
  report,
  settings,
  elementId = 'official-report-card',
  className = '',
}) => {
  const quranData = report.pembelajaranAlQuran;
  const hafalanData = report.hafalanAlQuran;
  const haditsData = report.hafalanHadits;
  const haditsList = getHaditsList(settings.haditsNames);

  // Navy blue color matching official UMMI report standard
  const navyBg = 'bg-[#000080] text-white';
  const tableBorder = 'border border-black';
  const cellBorder = 'border border-black px-1.5 py-1 text-center text-[12px] leading-tight';
  const isHaditsEnabled = settings.showHaditsSection === true;

  return (
    <div
      id={elementId}
      className={`bg-white text-black font-sans w-full max-w-[816px] mx-auto p-5 sm:p-7 select-text print:p-0 print:m-0 print:w-full box-border flex flex-col justify-start ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Content: KOP, Data Siswa, Pembelajaran Quran, Hafalan Quran & Hadits */}
      <div className="space-y-3">
        {/* 1. Header Document Title (KOP RAPOT RESMI) */}
        <div className="flex items-center justify-between gap-4 border-b-2 border-black pb-3">
          {/* Left: Official Logo (Logo Lembaga/Sekolah) */}
          <div className="shrink-0 w-[86px] h-[86px] flex items-center justify-center">
            <KopLogo logoUrl={settings.logoUrl} size={86} />
          </div>

          {/* Center: Title & Institution Text */}
          <div className="flex-1 text-center px-1">
            <div className="font-bold text-[14px] uppercase tracking-wider text-slate-900 leading-tight">
              {settings.schoolName || 'LEMBAGA PENDIDIKAN ISLAM / PESANTREN TAHFIDZ'}
            </div>
            <h1 className="font-extrabold text-[14px] uppercase tracking-wide leading-tight mt-0.5">
              LAPORAN PERKEMBANGAN KOMPETENSI
            </h1>
            <h2 className="font-extrabold text-[14px] uppercase tracking-wide leading-tight text-[#000080]">
              AL-QUR'AN METODE UMMI DAN TAHFIDZ
            </h2>
            <h3 className="font-bold text-[12px] uppercase tracking-wider text-slate-800 mt-0.5">
              TAHUN PELAJARAN {report.academicYear || settings.academicYear} &bull; SEMESTER {report.semester || settings.semester}
            </h3>
          </div>

          {/* Right: Secondary Logo (Logo Yang Satunya / UMMI / Kemenag / Mitra) */}
          <div className="shrink-0 w-[86px] h-[86px] flex items-center justify-center">
            <SecondaryLogo
              logoUrl={settings.secondaryLogoUrl}
              size={86}
              show={settings.showSecondaryLogo !== false}
            />
          </div>
        </div>

        {/* 2. Student Metadata */}
        <div className="grid grid-cols-2 gap-3.5 text-[12px] font-bold px-0.5 py-0.5">
          <div className="space-y-1">
            <div className="flex">
              <span className="w-28 text-slate-700">Nama Siswa</span>
              <span className="mr-2">:</span>
              <span className="uppercase text-slate-950 font-extrabold">{student.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-700">Kelas</span>
              <span className="mr-2">:</span>
              <span className="uppercase">{classroom?.name || student.classId}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex">
              <span className="w-24 text-slate-700">NIS</span>
              <span className="mr-2">:</span>
              <span className="font-mono font-bold">{student.nis}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-slate-700">Semester</span>
              <span className="mr-2">:</span>
              <span className="uppercase">{report.semester || settings.semester}</span>
            </div>
          </div>
        </div>

        {/* 3. Section I: PEMBELAJARAN AL-QUR'AN */}
        <div>
          <div className="font-extrabold text-[14px] mb-1.5 text-[#000080]">I. PEMBELAJARAN AL-QUR'AN</div>

          {/* Table Jilid & Tartil */}
          <table className={`w-full ${tableBorder} border-collapse mb-2 text-[12px]`}>
            <thead>
              <tr className={`${navyBg} font-bold text-center`}>
                <th className={`${cellBorder} w-8 py-1.5 font-bold`}>NO</th>
                <th className={`${cellBorder} w-40 font-bold`}>Pembelajaran Al-Qur'an</th>
                <th className={`${cellBorder} w-28 font-bold`}>Target<br />Semester ini</th>
                <th className={`${cellBorder} w-24 font-bold`}>Prestasi<br />Belajar</th>
                <th colSpan={4} className={`${cellBorder} py-1 font-bold`}>
                  Aspek Penilaian
                  <div className="grid grid-cols-4 border-t border-white/80 mt-1 pt-0.5 font-bold text-[11.5px]">
                    <span>M</span>
                    <span>Mad</span>
                    <span>T</span>
                    <span>K</span>
                  </div>
                </th>
                <th className={`${cellBorder} w-36 font-bold`}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellBorder}>1</td>
                <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>JILID</td>
                <td rowSpan={2} className={`${cellBorder} align-middle font-medium`}>
                  {quranData.jilid.targetSemester || 'Pasca'}
                </td>
                <td className={cellBorder}>{quranData.jilid.prestasiBelajar || '-'}</td>
                <td className={`${cellBorder} w-8`}>{quranData.jilid.m || '-'}</td>
                <td className={`${cellBorder} w-8`}>{quranData.jilid.mad || '-'}</td>
                <td className={`${cellBorder} w-8`}>{quranData.jilid.t || '-'}</td>
                <td className={`${cellBorder} w-8`}>{quranData.jilid.k || '-'}</td>
                <td className={cellBorder}>{quranData.jilid.keterangan || '-'}</td>
              </tr>
              <tr>
                <td className={cellBorder}>2</td>
                <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>TARTIL</td>
                <td className={cellBorder}>{quranData.tartil.prestasiBelajar || '-'}</td>
                <td className={cellBorder}>{quranData.tartil.m || '-'}</td>
                <td className={cellBorder}>{quranData.tartil.mad || '-'}</td>
                <td className={cellBorder}>{quranData.tartil.t || '-'}</td>
                <td className={cellBorder}>{quranData.tartil.k || '-'}</td>
                <td className={cellBorder}>{quranData.tartil.keterangan || '-'}</td>
              </tr>
              <tr>
                <td colSpan={2} className={`${cellBorder} font-bold italic text-center py-1.5 bg-gray-50/70`}>
                  Deskripsi
                </td>
                <td colSpan={7} className={`${cellBorder} text-center py-1.5 px-3 text-[11.5px] leading-snug`}>
                  {quranData.deskripsiJilidTartil || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Table Turjuman */}
          <table className={`w-full ${tableBorder} border-collapse text-[12px]`}>
            <thead>
              <tr className={`${navyBg} font-bold text-center`}>
                <th className={`${cellBorder} w-8 py-1.5 font-bold`}>NO</th>
                <th className={`${cellBorder} w-40 font-bold`}>Pembelajaran Al-Qur'an</th>
                <th className={`${cellBorder} w-28 font-bold`}>Target<br />Semester ini</th>
                <th className={`${cellBorder} w-24 font-bold`}>Prestasi<br />Belajar</th>
                <th className={`${cellBorder} w-16 font-bold`}>per kata</th>
                <th className={`${cellBorder} w-16 font-bold`}>per<br />kalimat</th>
                <th className={`${cellBorder} w-16 font-bold`}>intisari</th>
                <th className={`${cellBorder} w-16 font-bold`}>imla'</th>
                <th className={`${cellBorder} w-36 font-bold`}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellBorder}>3</td>
                <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>TURJUMAN</td>
                <td className={cellBorder}>{quranData.turjuman.targetSemester || 'Turjuman 5'}</td>
                <td className={`${cellBorder} font-bold`}>{quranData.turjuman.prestasiBelajar || 'LULUS'}</td>
                <td className={cellBorder}>{quranData.turjuman.perKata ?? 90}</td>
                <td className={cellBorder}>{quranData.turjuman.perKalimat ?? 90}</td>
                <td className={cellBorder}>{quranData.turjuman.intisari ?? 87}</td>
                <td className={cellBorder}>{quranData.turjuman.imla ?? '-'}</td>
                <td className={`${cellBorder} font-semibold`}>{quranData.turjuman.keterangan || 'Jayyid Jiddan'}</td>
              </tr>
              <tr>
                <td colSpan={2} className={`${cellBorder} font-bold italic text-center py-1.5 bg-gray-50/70`}>
                  Deskripsi
                </td>
                <td colSpan={7} className={`${cellBorder} text-left py-1.5 px-3 leading-snug text-[11.5px]`}>
                  {quranData.deskripsiTurjuman ||
                    "Alhamdulillah Ananda memiliki kemampuan yang baik dalam mempelajari dan memahami arti perkata, perkalimat dan Intisari surah-surah pendek dalam Al-Qur'an. Harapannya Ananda dapat terus berinteraksi terhadap Al-Qur'an dengan tilawah dan selalu memuroja'ah hafalannya."}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Section II: HAFALAN AL-QUR'AN */}
        <div>
          <div className="font-extrabold text-[14px] mb-1.5 text-[#000080]">II. HAFALAN AL-QUR'AN</div>

          {/* Target Hafalan Kelas bar */}
          <table className={`w-full ${tableBorder} border-collapse mb-1.5 text-[12px]`}>
            <tbody>
              <tr>
                <td className={`${cellBorder} font-bold text-left pl-3 w-64 py-1`}>
                  TARGET HAFALAN KELAS
                </td>
                <td className={`${cellBorder} font-bold text-center py-1`}>
                  {hafalanData.targetHafalanKelas || classroom?.targetHafalan || 'Juz 2'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Capaian Hafalan Siswa Grid */}
          <table className={`w-full ${tableBorder} border-collapse mb-1.5 text-[12px]`}>
            <thead>
              <tr className={`${navyBg} font-bold text-center`}>
                <th colSpan={14} className={`${cellBorder} py-1 tracking-wider uppercase font-bold text-[12px]`}>
                  CAPAIAN HAFALAN SISWA
                </th>
              </tr>
              <tr className={`${navyBg} font-bold text-center text-[11px]`}>
                <th className={`${cellBorder} w-8 py-1`}>No</th>
                {JUZ_LIST.map((j) => (
                  <th key={j.key} className={`${cellBorder} min-w-[30px]`}>{j.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cellBorder}>1</td>
                {JUZ_LIST.map((j) => {
                  const isPassed = hafalanData.capaianHafalan[j.key as keyof typeof hafalanData.capaianHafalan];
                  return (
                    <td key={j.key} className={`${cellBorder} font-bold text-[12px] py-1`}>
                      {isPassed ? '√' : '-'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* Evaluation Table: Munaqosyah & Ujian Semester */}
          <table className={`w-full ${tableBorder} border-collapse mb-1.5 text-[12px]`}>
            <thead>
              <tr className={`${navyBg} font-bold text-center text-[11px]`}>
                <th className={`${cellBorder} w-8 py-1`}>No</th>
                <th className={`${cellBorder} w-36 text-left pl-2.5 font-bold`}>JENIS EVALUASI</th>
                {JUZ_LIST.map((j) => (
                  <th key={j.key} className={`${cellBorder} min-w-[30px]`}>{j.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Munaqosyah */}
              <tr>
                <td className={cellBorder}>1</td>
                <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>Munaqosyah</td>
                {JUZ_LIST.map((j) => {
                  const val = hafalanData.munaqosyah[j.key as keyof typeof hafalanData.munaqosyah];
                  return (
                    <td key={j.key} className={cellBorder}>
                      {val !== undefined && val !== '' ? val : '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Ujian Semester + Legend */}
              <tr>
                <td className={cellBorder}>2</td>
                <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>Ujian Semester</td>
                <td colSpan={4} className={`${cellBorder} text-left pl-2.5 py-1.5`}>
                  <div className="flex justify-between items-center pr-2">
                    <span className="font-semibold text-[11.5px]">Nilai :</span>
                    <span className="font-bold text-[12px]">{hafalanData.ujianSemester.nilai ?? 89}</span>
                  </div>
                  <div className="flex justify-between items-center pr-2 mt-0.5">
                    <span className="font-semibold text-[11.5px]">Predikat :</span>
                    <span className="font-bold text-[11.5px]">{hafalanData.ujianSemester.predikat || 'Jayyid'}</span>
                  </div>
                </td>
                <td colSpan={9} className={`${cellBorder} text-left p-1.5 text-[10.5px] leading-tight font-sans italic bg-gray-50/50`}>
                  <div><strong>Mumtaz (100)</strong> : Istimewa | <strong>Jayyid Jiddan (90-99)</strong> : Sangat Memuaskan</div>
                  <div><strong>Jayyid (80-89)</strong> : Memuaskan | <strong>Maqbul (70-79)</strong> : Cukup Memuaskan</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan Guru */}
          <div className={`${tableBorder} p-2 text-[12px]`}>
            <div className="font-bold mb-1 text-[12px]">CATATAN GURU</div>
            <div className="px-0.5 text-[11.5px] leading-snug">
              {hafalanData.catatanGuru ||
                "Alhamdulillah Ananda telah menyelesaikan ujian tahfidz juz 30 surah An-Naas sampai surah An-Naba'. Semoga Ananda istiqomah dalam memuroja'ah dan menambah hafalannya."}
            </div>
          </div>
        </div>

        {/* 5. Section III: HAFALAN HADITS (Dapat Dihilangkan atau Dibuat Ada Sesuai Pengaturan) */}
        {isHaditsEnabled && (
          <div>
            <div className="font-extrabold text-[14px] mb-1.5 text-[#000080]">
              {settings.haditsSectionTitle || 'III. HAFALAN HADITS'}
            </div>

            <table className={`w-full ${tableBorder} border-collapse text-[12px]`}>
              <thead>
                <tr className={`${navyBg} font-bold text-center text-[11px]`}>
                  <th className={`${cellBorder} w-8 py-1`}>No</th>
                  <th className={`${cellBorder} w-32 text-left pl-2 font-bold`}>JENIS EVALUASI</th>
                  {haditsList.map((h) => (
                    <th key={h.key} className={`${cellBorder} max-w-[58px] px-1 font-semibold leading-tight`}>
                      {h.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cellBorder}>1</td>
                  <td className={`${cellBorder} text-left pl-2.5 font-semibold`}>Hafalan Hadits</td>
                  {haditsList.map((h) => {
                    const sc = haditsData.scores[h.key];
                    return (
                      <td key={h.key} className={cellBorder}>
                        {sc !== undefined && sc !== '' ? sc : 85}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td colSpan={2} className={`${cellBorder} font-bold text-center bg-gray-50/70 py-1.5`}>
                    Keterangan
                  </td>
                  <td colSpan={3} className={`${cellBorder} text-left pl-2.5 text-[11px]`}>
                    <div className="flex justify-between pr-2">
                      <span className="font-semibold">Nilai :</span>
                      <span className="font-bold text-[12px]">{haditsData.rataRata ?? 85}</span>
                    </div>
                    <div className="flex justify-between pr-2 mt-0.5">
                      <span className="font-semibold">Predikat :</span>
                      <span className="font-bold">{haditsData.predikat || 'Jayyid'}</span>
                    </div>
                  </td>
                  <td colSpan={7} className={`${cellBorder} text-left p-1.5 text-[10px] leading-tight italic bg-gray-50/50`}>
                    <div><strong>Mumtaz (100)</strong> : Istimewa | <strong>Jayyid Jiddan (90-99)</strong> : Sangat Memuaskan</div>
                    <div><strong>Jayyid (80-89)</strong> : Memuaskan | <strong>Maqbul (70-79)</strong> : Cukup Memuaskan</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct Adjacent Bottom Section: Tanggal, Kriteria, dan Tanda Tangan Tanpa Jeda/Spasi Kosong */}
      <div className="text-[12px] mt-3 pt-2.5 border-t border-slate-300">
        {/* Top footer row: Issue Place/Date + Kriteria Penilaian + Aspek Penilaian */}
        <div className="flex justify-between items-start mb-3">
          {/* Left: Diberikan di & Tanggal */}
          <div className="space-y-1 w-64 pt-0.5 text-[12px]">
            <div className="flex">
              <span className="w-24 font-bold text-slate-700">Diberikan di</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{report.issueCity || settings.issueCity || 'Balikpapan'}</span>
            </div>
            <div className="flex items-start">
              <span className="w-24 font-bold text-slate-700">Tanggal</span>
              <span className="mr-2">:</span>
              <div>
                <div className="underline underline-offset-1 font-bold">{report.issueDate || settings.issueDate || '02 Juni 2026'}</div>
                <div className="italic text-[11px] mt-0.5 text-slate-700">{report.hijriDate || settings.hijriDate || '16 Dzulhijjah 1447 H'}</div>
              </div>
            </div>
          </div>

          {/* Right: 2 Tables side-by-side (Kriteria Penilaian & Aspek Penilaian) */}
          <div className="flex gap-2.5">
            {/* Table 1: Kriteria Penilaian */}
            <div>
              <div className="font-bold text-[11px] text-center mb-0.5">Kriteria Penilaian</div>
              <table className={`${tableBorder} border-collapse text-[11px]`}>
                <thead>
                  <tr className={`${navyBg} font-bold text-center`}>
                    <th className={`${cellBorder} px-2 py-0.5 font-bold`}>Predikat</th>
                    <th className={`${cellBorder} px-2.5 py-0.5 font-bold`}>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>A</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Sangat Baik</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>B</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Baik</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>C</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Cukup</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>D</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Kurang</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 2: Aspek Penilaian */}
            <div>
              <div className="font-bold text-[11px] text-center mb-0.5">Aspek Penilaian</div>
              <table className={`${tableBorder} border-collapse text-[11px]`}>
                <thead>
                  <tr className={`${navyBg} font-bold text-center`}>
                    <th colSpan={2} className={`${cellBorder} px-2.5 py-0.5 font-bold`}>Akronim</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${cellBorder} font-bold w-9 py-0.5`}>M</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Makhroj</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>Mad</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Panjang/Pendek</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>T</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Tajwid</td>
                  </tr>
                  <tr>
                    <td className={`${cellBorder} font-bold py-0.5`}>K</td>
                    <td className={`${cellBorder} font-semibold text-left px-2 py-0.5`}>Kelancaran</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Signatures: Orang Tua & Guru Pengajar */}
        <div className="flex justify-between items-end pt-2.5 px-8 pb-1">
          {/* Left Signature: Orang Tua */}
          <div className="text-center w-56">
            <div className="font-bold text-[12px] mb-14">Orang Tua/Wali Siswa</div>
            <div className="border-b border-black w-44 mx-auto"></div>
          </div>

          {/* Right Signature: Guru Pengajar */}
          <div className="text-center w-64">
            <div className="font-bold text-[12px] mb-14">Guru Al-Qur'an UMMI & Tahfidz</div>
            <div className="font-bold underline text-[13px] text-slate-950">
              {report.teacherName || classroom?.teacherName || 'M. Mujiono, S.Pd'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
