import React, { useState, useEffect } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { ReportCardView } from './ReportCardView';
import {
  HADITS_LIST,
  JUZ_LIST,
  getPredicateFromScore,
  calculateHaditsAverage,
  DESKRIPSI_PRESETS_TURJUMAN,
  CATATAN_GURU_PRESETS_TAHFIDZ,
} from '../utils/reportCalculations';
import { exportReportToPdf, exportReportToExcel, printElementDirectly } from '../utils/exportUtils';
import {
  Save,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Eye,
  Sliders,
  Award,
  BookOpen,
  Scroll,
  HelpCircle,
} from 'lucide-react';

interface ReportCardEditorProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (studentId: string) => void;
  classroom?: ClassRoom;
  initialReport: StudentReport;
  settings: SchoolSettings;
  onSaveReport: (report: StudentReport) => void;
}

export const ReportCardEditor: React.FC<ReportCardEditorProps> = ({
  students,
  currentStudentId,
  onSelectStudent,
  classroom,
  initialReport,
  settings,
  onSaveReport,
}) => {
  const [report, setReport] = useState<StudentReport>(initialReport);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Sync state when initialReport changes
  useEffect(() => {
    setReport(initialReport);
    setHasChanges(false);
  }, [initialReport.id, currentStudentId]);

  const currentStudentIndex = students.findIndex((s) => s.id === currentStudentId);
  const currentStudent = students[currentStudentIndex] || students[0];

  const handlePrevStudent = () => {
    if (currentStudentIndex > 0) {
      if (hasChanges) {
        onSaveReport(report);
      }
      onSelectStudent(students[currentStudentIndex - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      if (hasChanges) {
        onSaveReport(report);
      }
      onSelectStudent(students[currentStudentIndex + 1].id);
    }
  };

  const handleSave = () => {
    onSaveReport(report);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Helper for deep state updates
  const updateReport = (updater: (prev: StudentReport) => StudentReport) => {
    setReport((prev) => {
      const next = updater({ ...prev });
      setHasChanges(true);
      return next;
    });
  };

  // Turjuman update
  const handleTurjumanScoreChange = (field: 'perKata' | 'perKalimat' | 'intisari' | 'imla', val: string) => {
    const numVal = val === '' ? '' : isNaN(Number(val)) ? val : Number(val);
    updateReport((prev) => {
      const nextTurjuman = { ...prev.pembelajaranAlQuran.turjuman, [field]: numVal };
      // Auto-compute average & predicate if perKata/perKalimat/intisari available
      const scores = [nextTurjuman.perKata, nextTurjuman.perKalimat, nextTurjuman.intisari]
        .map((s) => (typeof s === 'number' ? s : parseFloat(String(s))))
        .filter((s) => !isNaN(s));

      if (scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        nextTurjuman.keterangan = getPredicateFromScore(avg).predicate;
      }
      return {
        ...prev,
        pembelajaranAlQuran: {
          ...prev.pembelajaranAlQuran,
          turjuman: nextTurjuman,
        },
      };
    });
  };

  // Ujian Semester score change
  const handleUjianSemesterChange = (val: string) => {
    const numVal = val === '' ? '' : isNaN(Number(val)) ? val : Number(val);
    updateReport((prev) => ({
      ...prev,
      hafalanAlQuran: {
        ...prev.hafalanAlQuran,
        ujianSemester: {
          nilai: numVal,
          predikat: getPredicateFromScore(numVal).predicate,
        },
      },
    }));
  };

  // Hadits score change
  const handleHaditsScoreChange = (key: keyof typeof report.hafalanHadits.scores, val: string) => {
    const numVal = val === '' ? '' : isNaN(Number(val)) ? val : Number(val);
    updateReport((prev) => {
      const nextScores = { ...prev.hafalanHadits.scores, [key]: numVal };
      const { average, predicate } = calculateHaditsAverage(nextScores);
      return {
        ...prev,
        hafalanHadits: {
          scores: nextScores,
          rataRata: average,
          predikat: predicate,
        },
      };
    });
  };

  // Quick fill all Hadits scores
  const handleBatchFillHadits = (scoreValue: number) => {
    updateReport((prev) => {
      const nextScores: any = {};
      HADITS_LIST.forEach((h) => {
        nextScores[h.key] = scoreValue;
      });
      const { average, predicate } = calculateHaditsAverage(nextScores);
      return {
        ...prev,
        hafalanHadits: {
          scores: nextScores,
          rataRata: average,
          predikat: predicate,
        },
      };
    });
  };

  // Capaian hafalan toggle
  const toggleCapaianHafalan = (juzKey: keyof typeof report.hafalanAlQuran.capaianHafalan) => {
    updateReport((prev) => ({
      ...prev,
      hafalanAlQuran: {
        ...prev.hafalanAlQuran,
        capaianHafalan: {
          ...prev.hafalanAlQuran.capaianHafalan,
          [juzKey]: !prev.hafalanAlQuran.capaianHafalan[juzKey],
        },
      },
    }));
  };

  // PDF Export
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = `Raport_${currentStudent.nis}_${currentStudent.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const targetId = document.getElementById('editor-preview-card') ? 'editor-preview-card' : 'export-hidden-report-card';
      await exportReportToPdf(targetId, filename);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    exportReportToExcel(currentStudent, classroom, report, settings);
  };

  return (
    <div className="flex flex-col h-full text-slate-800">
      {/* Top Action Bar - Clean Blue & Yellow Glassmorphism */}
      <div className="bg-white/75 backdrop-blur-2xl border-b border-blue-200/60 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Student Navigator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-1 border border-blue-200/80 shadow-xs">
              <button
                id="btn-prev-student"
                onClick={handlePrevStudent}
                disabled={currentStudentIndex <= 0}
                className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-950 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Santri Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <select
                id="select-active-student"
                value={currentStudentId}
                onChange={(e) => {
                  if (hasChanges) onSaveReport(report);
                  onSelectStudent(e.target.value);
                }}
                className="bg-transparent text-xs sm:text-sm font-bold px-2 py-1 outline-hidden text-blue-950 cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              >
                {students.map((s, idx) => (
                  <option key={s.id} value={s.id}>
                    {idx + 1}. {s.name} ({s.nis})
                  </option>
                ))}
              </select>

              <button
                id="btn-next-student"
                onClick={handleNextStudent}
                disabled={currentStudentIndex >= students.length - 1}
                className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-950 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Santri Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs bg-blue-50/80 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200/70 font-semibold shadow-2xs">
              <span>Kelas: <strong className="text-blue-950">{classroom?.name || currentStudent.classId}</strong></span>
              <span className="text-blue-300">•</span>
              <span>Semester: <strong className="text-blue-950">{report.semester}</strong></span>
            </div>
          </div>

          {/* Center: View Switcher Tabs (Glass Pill) */}
          <div className="flex items-center bg-blue-950/10 backdrop-blur-md p-1 rounded-2xl border border-blue-200/50 text-xs font-semibold">
            <button
              id="tab-view-editor"
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Input Nilai</span>
            </button>
            <button
              id="tab-view-split"
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex px-3.5 py-1.5 rounded-xl items-center gap-1.5 transition-all ${
                activeTab === 'split'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              <span>Berdampingan</span>
            </button>
            <button
              id="tab-view-preview"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-slate-600 hover:text-blue-950'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau F4</span>
            </button>
          </div>

          {/* Right: Export & Save Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-save-report"
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 ${
                hasChanges
                  ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400 ring-offset-1 animate-pulse'
                  : 'bg-blue-900 hover:bg-blue-950 text-white shadow-blue-900/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{hasChanges ? 'Simpan Nilai' : 'Simpan'}</span>
                </>
              )}
            </button>

            <button
              id="btn-download-pdf"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl transition-all shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
              title="Download Raport PDF (F4)"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Exporting...' : 'PDF F4'}</span>
            </button>

            <button
              id="btn-download-excel"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all shadow-md shadow-emerald-700/20 active:scale-95"
              title="Download Raport Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              id="btn-print-direct"
              onClick={() => printElementDirectly('editor-preview-card')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all shadow-md active:scale-95"
              title="Cetak Langsung Kertas F4"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div
          className={`max-w-7xl mx-auto ${
            activeTab === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'max-w-4xl mx-auto'
          }`}
        >
          {/* Form Input Section */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div
              className={`${
                activeTab === 'split' ? 'lg:col-span-6' : 'w-full'
              } space-y-6 bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white shadow-xl`}
            >
              {/* Section Header */}
              <div className="border-b border-blue-900/10 pb-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-800" />
                    Formulir Nilai Raport
                  </h2>
                  <span className="text-xs bg-gradient-to-r from-amber-400/20 to-yellow-300/30 text-blue-950 border border-amber-300/80 px-3 py-1 rounded-full font-extrabold shadow-2xs">
                    {currentStudent.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan nilai Al-Qur'an, Ujian Tahfidz, Turjuman, dan Hafalan Hadits sesuai standar resmi.
                </p>
              </div>

              {/* 1. PEMBELAJARAN AL-QUR'AN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-800/30">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    I. Pembelajaran Al-Qur'an
                  </span>
                </div>

                {/* Jilid & Tartil Section */}
                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100/80 shadow-2xs space-y-3">
                  <div className="text-xs font-bold text-blue-950">A. Jilid & Tartil</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Target Semester (Jilid/Tartil)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.targetSemester}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, targetSemester: e.target.value },
                              tartil: { ...prev.pembelajaranAlQuran.tartil, targetSemester: e.target.value },
                            },
                          }))
                        }
                        placeholder="Contoh: Pasca"
                        className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Prestasi Belajar (Jilid)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.prestasiBelajar}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, prestasiBelajar: e.target.value },
                            },
                          }))
                        }
                        placeholder="Contoh: - atau Jilid 6"
                        className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Aspek Penilaian Jilid (M, Mad, T, K) */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5 text-[10px] text-center">M (Makhroj)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.m}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, m: e.target.value },
                            },
                          }))
                        }
                        placeholder="-"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5 text-[10px] text-center">Mad (Panjang)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.mad}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, mad: e.target.value },
                            },
                          }))
                        }
                        placeholder="-"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5 text-[10px] text-center">T (Tajwid)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.t}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, t: e.target.value },
                            },
                          }))
                        }
                        placeholder="-"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-1.5 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-0.5 text-[10px] text-center">K (Kelancaran)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.jilid.k}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              jilid: { ...prev.pembelajaranAlQuran.jilid, k: e.target.value },
                            },
                          }))
                        }
                        placeholder="-"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-1.5 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-xs">Deskripsi Jilid / Tartil</label>
                    <input
                      type="text"
                      value={report.pembelajaranAlQuran.deskripsiJilidTartil}
                      onChange={(e) =>
                        updateReport((prev) => ({
                          ...prev,
                          pembelajaranAlQuran: { ...prev.pembelajaranAlQuran, deskripsiJilidTartil: e.target.value },
                        }))
                      }
                      placeholder="Contoh: -"
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                    />
                  </div>
                </div>

                {/* Turjuman Section */}
                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100/80 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-950">B. Turjuman (Terjemah Al-Qur'an)</div>
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Predikat: {report.pembelajaranAlQuran.turjuman.keterangan || '-'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Target Semester</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.turjuman.targetSemester}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              turjuman: { ...prev.pembelajaranAlQuran.turjuman, targetSemester: e.target.value },
                            },
                          }))
                        }
                        placeholder="Contoh: Turjuman 5"
                        className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Prestasi Belajar</label>
                      <select
                        value={report.pembelajaranAlQuran.turjuman.prestasiBelajar}
                        onChange={(e) =>
                          updateReport((prev) => ({
                            ...prev,
                            pembelajaranAlQuran: {
                              ...prev.pembelajaranAlQuran,
                              turjuman: { ...prev.pembelajaranAlQuran.turjuman, prestasiBelajar: e.target.value },
                            },
                          }))
                        }
                        className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                      >
                        <option value="LULUS">LULUS</option>
                        <option value="BELUM LULUS">BELUM LULUS</option>
                        <option value="-">-</option>
                      </select>
                    </div>
                  </div>

                  {/* Turjuman 4 Sub-Scores */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-0.5 text-[11px] text-center">Per Kata</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={report.pembelajaranAlQuran.turjuman.perKata}
                        onChange={(e) => handleTurjumanScoreChange('perKata', e.target.value)}
                        placeholder="90"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-0.5 text-[11px] text-center">Per Kalimat</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={report.pembelajaranAlQuran.turjuman.perKalimat}
                        onChange={(e) => handleTurjumanScoreChange('perKalimat', e.target.value)}
                        placeholder="90"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-0.5 text-[11px] text-center">Intisari</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={report.pembelajaranAlQuran.turjuman.intisari}
                        onChange={(e) => handleTurjumanScoreChange('intisari', e.target.value)}
                        placeholder="87"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-0.5 text-[11px] text-center">Imla' (Tulis)</label>
                      <input
                        type="text"
                        value={report.pembelajaranAlQuran.turjuman.imla}
                        onChange={(e) => handleTurjumanScoreChange('imla', e.target.value)}
                        placeholder="-"
                        className="w-full text-center bg-white border border-blue-100 rounded-xl py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Deskripsi Turjuman & Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-600 font-medium text-xs">Deskripsi Capaian Turjuman</label>
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-[11px] text-blue-800 hover:text-blue-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pilih Kalimat Otomatis</span>
                        </button>
                        <div className="hidden group-hover:block absolute right-0 z-30 w-80 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl p-3 text-xs space-y-2">
                          <div className="font-bold text-blue-950 text-[11px] pb-1.5 border-b border-blue-900/10">
                            Rekomendasi Deskripsi:
                          </div>
                          {DESKRIPSI_PRESETS_TURJUMAN.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                updateReport((prev) => ({
                                  ...prev,
                                  pembelajaranAlQuran: {
                                    ...prev.pembelajaranAlQuran,
                                    deskripsiTurjuman: preset,
                                  },
                                }))
                              }
                              className="text-left w-full p-2 hover:bg-blue-50 rounded-xl text-slate-700 hover:text-blue-950 text-[11px] leading-snug transition-all"
                            >
                              {preset.substring(0, 75)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={report.pembelajaranAlQuran.deskripsiTurjuman}
                      onChange={(e) =>
                        updateReport((prev) => ({
                          ...prev,
                          pembelajaranAlQuran: { ...prev.pembelajaranAlQuran, deskripsiTurjuman: e.target.value },
                        }))
                      }
                      className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. HAFALAN AL-QUR'AN */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-800/30">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    II. Hafalan Al-Qur'an & Tahfidz
                  </span>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-950">Target Hafalan Kelas</label>
                    <input
                      type="text"
                      value={report.hafalanAlQuran.targetHafalanKelas}
                      onChange={(e) =>
                        updateReport((prev) => ({
                          ...prev,
                          hafalanAlQuran: { ...prev.hafalanAlQuran, targetHafalanKelas: e.target.value },
                        }))
                      }
                      placeholder="Juz 2"
                      className="w-32 text-center bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-950 shadow-2xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  {/* Checklist Capaian Hafalan Siswa */}
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Capaian Hafalan (Checklist Juz yang Lulus):</span>
                      <span className="text-[11px] text-slate-500 font-normal">Klik untuk centang (√)</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {JUZ_LIST.map((j) => {
                        const checked =
                          report.hafalanAlQuran.capaianHafalan[j.key as keyof typeof report.hafalanAlQuran.capaianHafalan];
                        return (
                          <button
                            key={j.key}
                            type="button"
                            onClick={() =>
                              toggleCapaianHafalan(j.key as keyof typeof report.hafalanAlQuran.capaianHafalan)
                            }
                            className={`px-2 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                              checked
                                ? 'bg-blue-950 text-amber-300 border-blue-950 shadow-xs font-bold'
                                : 'bg-white text-slate-600 border-blue-100 hover:border-blue-300'
                            }`}
                          >
                            <span>{j.label}</span>
                            {checked && <span className="font-bold text-amber-300">√</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nilai Munaqosyah per Juz */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nilai Munaqosyah per Juz</label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {JUZ_LIST.map((j) => {
                        const val = report.hafalanAlQuran.munaqosyah[j.key as keyof typeof report.hafalanAlQuran.munaqosyah];
                        return (
                          <div key={j.key} className="text-center">
                            <span className="block text-[10px] text-slate-500 mb-0.5 font-medium">{j.label}</span>
                            <input
                              type="text"
                              value={val !== undefined ? val : '-'}
                              onChange={(e) => {
                                const v = e.target.value;
                                updateReport((prev) => ({
                                  ...prev,
                                  hafalanAlQuran: {
                                    ...prev.hafalanAlQuran,
                                    munaqosyah: {
                                      ...prev.hafalanAlQuran.munaqosyah,
                                      [j.key]: v,
                                    },
                                  },
                                }));
                              }}
                              placeholder="-"
                              className="w-full text-center bg-white border border-blue-100 rounded-xl py-1.5 text-xs font-bold"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ujian Semester Score & Predicate */}
                  <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center shadow-xs">
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">Nilai Ujian Semester</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={report.hafalanAlQuran.ujianSemester.nilai}
                        onChange={(e) => handleUjianSemesterChange(e.target.value)}
                        placeholder="89"
                        className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-base font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">Predikat Otomatis</label>
                      <div className="px-3 py-2 bg-gradient-to-r from-amber-400/20 to-yellow-300/30 border border-amber-300 rounded-xl text-sm font-bold text-blue-950 flex items-center justify-between">
                        <span>{report.hafalanAlQuran.ujianSemester.predikat || 'Jayyid'}</span>
                        <span className="text-xs text-blue-900 font-semibold">
                          {getPredicateFromScore(report.hafalanAlQuran.ujianSemester.nilai).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Guru Tahfidz */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-600 font-medium text-xs">Catatan Guru Tahfidz</label>
                      <div className="relative group">
                        <button
                          type="button"
                          className="text-[11px] text-blue-800 hover:text-blue-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pilih Catatan Otomatis</span>
                        </button>
                        <div className="hidden group-hover:block absolute right-0 z-30 w-80 bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl p-3 text-xs space-y-2">
                          <div className="font-bold text-blue-950 text-[11px] pb-1.5 border-b border-blue-900/10">
                            Rekomendasi Catatan:
                          </div>
                          {CATATAN_GURU_PRESETS_TAHFIDZ.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() =>
                                updateReport((prev) => ({
                                  ...prev,
                                  hafalanAlQuran: { ...prev.hafalanAlQuran, catatanGuru: preset },
                                }))
                              }
                              className="text-left w-full p-2 hover:bg-blue-50 rounded-xl text-slate-700 hover:text-blue-950 text-[11px] leading-snug transition-all"
                            >
                              {preset.substring(0, 75)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={report.hafalanAlQuran.catatanGuru}
                      onChange={(e) =>
                        updateReport((prev) => ({
                          ...prev,
                          hafalanAlQuran: { ...prev.hafalanAlQuran, catatanGuru: e.target.value },
                        }))
                      }
                      className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. HAFALAN HADITS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-950 via-indigo-950 to-blue-900 text-white px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-800/30">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    III. Hafalan Hadits (10 Hadits Pilihan)
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-normal text-blue-200">Isi cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleBatchFillHadits(85)}
                      className="bg-white/20 hover:bg-amber-400 hover:text-blue-950 px-2 py-0.5 rounded-lg text-white font-bold transition-all"
                    >
                      85
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchFillHadits(90)}
                      className="bg-white/20 hover:bg-amber-400 hover:text-blue-950 px-2 py-0.5 rounded-lg text-white font-bold transition-all"
                    >
                      90
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatchFillHadits(95)}
                      className="bg-white/20 hover:bg-amber-400 hover:text-blue-950 px-2 py-0.5 rounded-lg text-white font-bold transition-all"
                    >
                      95
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100/80 shadow-2xs space-y-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {HADITS_LIST.map((h, hIdx) => {
                      const val = report.hafalanHadits.scores[h.key];
                      return (
                        <div key={h.key} className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs">
                          <label className="block text-[10.5px] font-bold text-slate-700 leading-tight mb-1 truncate" title={h.title}>
                            {hIdx + 1}. {h.title}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={val !== undefined ? val : 85}
                            onChange={(e) => handleHaditsScoreChange(h.key, e.target.value)}
                            placeholder="85"
                            className="w-full text-center bg-blue-50/40 border border-blue-200 rounded-lg py-1 text-xs font-bold text-blue-950"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Hadits Average & Predicate Bar */}
                  <div className="bg-white/90 p-3.5 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                      <div>
                        <span className="text-slate-500 font-normal mr-1">Rata-rata Hadits:</span>
                        <span className="text-sm font-bold text-blue-950">{report.hafalanHadits.rataRata ?? 85}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-normal mr-1">Predikat:</span>
                        <span className="text-sm font-bold text-blue-900">{report.hafalanHadits.predikat || 'Jayyid'}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 italic">
                      Mumtaz (100) | Jayyid Jiddan (90-99) | Jayyid (80-89) | Maqbul (70-79)
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. TANGGAL & TANDA TANGAN */}
              <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-blue-100/80 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-blue-950">Data Titimangsa & Tanda Tangan</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Kota Penerbitan</label>
                    <input
                      type="text"
                      value={report.issueCity}
                      onChange={(e) => updateReport((prev) => ({ ...prev, issueCity: e.target.value }))}
                      placeholder="Balikpapan"
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tanggal Masehi</label>
                    <input
                      type="text"
                      value={report.issueDate}
                      onChange={(e) => updateReport((prev) => ({ ...prev, issueDate: e.target.value }))}
                      placeholder="02 Juni 2026"
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tanggal Hijriyah</label>
                    <input
                      type="text"
                      value={report.hijriDate}
                      onChange={(e) => updateReport((prev) => ({ ...prev, hijriDate: e.target.value }))}
                      placeholder="16 Dzulhijjah 1447 H"
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">Nama Guru Al-Qur'an & Tahfidz</label>
                  <input
                    type="text"
                    value={report.teacherName}
                    onChange={(e) => updateReport((prev) => ({ ...prev, teacherName: e.target.value }))}
                    placeholder="M. Mujiono, S.Pd"
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold text-blue-950"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live Preview Section */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'w-full'} flex flex-col items-center`}>
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
                  <Eye className="w-4 h-4 text-blue-800" />
                  <span>Pratinjau Format Standar Resmi</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-950 bg-gradient-to-r from-amber-400/30 to-yellow-300/40 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
                  <span>Format Kertas F4 / Folio (21.5 × 33 cm)</span>
                </div>
              </div>

              {/* Exact Report Card DOM element in clean preview stage */}
              <div className="w-full overflow-x-auto bg-slate-200/50 p-4 sm:p-8 rounded-3xl border border-slate-300/60 shadow-inner flex justify-center">
                <div className="bg-white shadow-2xl rounded-sm">
                  <ReportCardView
                    elementId="editor-preview-card"
                    student={currentStudent}
                    classroom={classroom}
                    report={report}
                    settings={settings}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Always-mounted off-screen ReportCardView element for 100% reliable PDF and Print generation even when on editor tab */}
      <div
        id="export-hidden-report-container"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '794px',
          backgroundColor: '#ffffff',
          pointerEvents: 'none',
          zIndex: -100,
        }}
      >
        <ReportCardView
          elementId="export-hidden-report-card"
          student={currentStudent}
          classroom={classroom}
          report={report}
          settings={settings}
        />
      </div>
    </div>
  );
};
