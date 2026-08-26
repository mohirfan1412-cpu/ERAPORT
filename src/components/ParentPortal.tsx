import React, { useState } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { ReportCardView } from './ReportCardView';
import { exportReportToPdf, exportReportToExcel, printElementDirectly } from '../utils/exportUtils';
import {
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

interface ParentPortalProps {
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  onLogout?: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  classes,
  reports,
  settings,
  onLogout,
}) => {
  const [searchKey, setSearchKey] = useState<string>('2311063106'); // default to Dzakki for instant demo
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(() => {
    return students.find((s) => s.nis === '2311063106') || students[0] || null;
  });
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    const query = searchKey.trim().toLowerCase();
    const found = students.find(
      (s) => s.nis.toLowerCase() === query || s.name.toLowerCase().includes(query)
    );

    setMatchedStudent(found || null);
    setHasSearched(true);
  };

  const currentClass = matchedStudent
    ? classes.find((c) => c.id === matchedStudent.classId)
    : undefined;

  const currentReport = matchedStudent
    ? reports.find((r) => r.studentId === matchedStudent.id)
    : undefined;

  const handleDownloadPdf = async () => {
    if (!matchedStudent || !currentReport) return;
    setIsExporting(true);
    const filename = `Raport_AlQuran_${matchedStudent.nis}_${matchedStudent.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    await exportReportToPdf('parent-report-card', filename);
    setIsExporting(false);
  };

  const handleDownloadExcel = () => {
    if (!matchedStudent || !currentReport) return;
    exportReportToExcel(matchedStudent, currentClass, currentReport, settings);
  };

  return (
    <div className="min-h-[85vh] p-4 md:p-8 max-w-5xl mx-auto space-y-6 text-slate-800">
      {/* Header Banner - Blue & Yellow Glass */}
      <div className="bg-gradient-to-r from-[#07193b]/95 via-[#0c245c]/90 to-[#0b1c48]/95 text-white rounded-3xl p-6 md:p-8 text-center shadow-xl border border-white/20 relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mt-48"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 max-w-xl mx-auto mb-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/15 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Portal Resmi Wali Santri & Orang Tua</span>
            </div>
            {onLogout && (
              <button
                id="btn-logout-parent"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold transition-all shadow-2xs active:scale-95"
                title="Keluar dari Portal Wali Santri"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Keluar</span>
              </button>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Cek & Unduh Raport Al-Qur'an Santri
          </h1>
          <p className="text-blue-100/80 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            Masukkan Nomor Induk Santri (NIS) atau Nama Lengkap Ananda untuk melihat capaian UMMI, Tahfidz, dan Hadits secara real-time.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-6">
            <div className="flex bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-white/90">
              <div className="flex items-center pl-3 text-blue-900/60">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Ketik NIS (contoh: 2311063106) atau Nama Santri..."
                className="w-full px-3 py-2.5 text-xs sm:text-sm text-slate-900 font-bold outline-hidden bg-transparent"
              />
              <button
                id="btn-search-report-portal"
                type="submit"
                className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-blue-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/25"
              >
                <span>Cari Raport</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-blue-200 font-medium">
              <span>Contoh pencarian cepat:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchKey('2311063106');
                  const s = students.find((x) => x.nis === '2311063106');
                  if (s) setMatchedStudent(s);
                }}
                className="underline hover:text-amber-300 font-bold text-amber-200"
              >
                2311063106 (Dzakki)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setSearchKey('2311063108');
                  const s = students.find((x) => x.nis === '2311063108');
                  if (s) setMatchedStudent(s);
                }}
                className="underline hover:text-amber-300 font-bold text-amber-200"
              >
                2311063108 (Aisyah)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Result Section */}
      {hasSearched && (
        <>
          {matchedStudent && currentReport ? (
            <div className="space-y-4">
              {/* Quick Action Bar for Parent */}
              <div className="bg-white/75 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-blue-950 border border-amber-200 flex items-center justify-center font-black text-lg shadow-sm">
                    {matchedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950 text-base">{matchedStudent.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      NIS: <span className="font-mono font-bold text-blue-950">{matchedStudent.nis}</span> • Kelas: <span className="font-bold text-slate-700">{currentClass?.name || matchedStudent.classId}</span> • Semester {currentReport.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-parent-download-pdf"
                    onClick={handleDownloadPdf}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-2xl transition-all shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Membuat PDF...' : 'Unduh Raport PDF (F4)'}</span>
                  </button>

                  <button
                    id="btn-parent-download-excel"
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl transition-all shadow-md shadow-emerald-700/20 active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Unduh Excel</span>
                  </button>

                  <button
                    id="btn-parent-print-report"
                    onClick={() => printElementDirectly('parent-report-card')}
                    className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Raport</span>
                  </button>
                </div>
              </div>

              {/* Exact Report Card Render in Paper Preview Frame */}
              <div className="bg-slate-200/50 p-4 sm:p-8 rounded-3xl border border-slate-300/60 shadow-inner flex flex-col items-center overflow-x-auto">
                <div className="mb-3 flex items-center justify-between w-full max-w-[794px] px-1">
                  <span className="text-xs text-slate-600 font-semibold">Pratinjau Lembar Raport Santri</span>
                  <span className="text-[11px] font-bold text-blue-950 bg-gradient-to-r from-amber-400/30 to-yellow-300/40 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                    Standar Kertas F4 / Folio (21.5 × 33 cm)
                  </span>
                </div>
                <div className="bg-white shadow-2xl rounded-sm">
                  <ReportCardView
                    elementId="parent-report-card"
                    student={matchedStudent}
                    classroom={currentClass}
                    report={currentReport}
                    settings={settings}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto font-bold text-xl shadow-xs">
                !
              </div>
              <h3 className="text-base font-bold text-blue-950">Santri Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Nomor Induk Santri atau Nama yang Anda masukkan tidak terdaftar dalam basis data semester ini. Mohon pastikan NIS sudah benar.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
