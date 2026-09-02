import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { exportReportToPdf, exportReportToExcel } from '../utils/exportUtils';
import {
  Search,
  X,
  GraduationCap,
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  onSelectStudent: (studentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  students,
  classes,
  reports,
  settings,
  onSelectStudent,
}) => {
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'GRADED' | 'UNGRADED'>('ALL');
  const [copiedNis, setCopiedNis] = useState<string | null>(null);

  // Memoized Search Results across multiple fields
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    return students.filter((s) => {
      const cls = classes.find((c) => c.id === s.classId);
      const rep = reports.find((r) => r.studentId === s.id);

      // Class Filter
      if (classFilter !== 'ALL' && s.classId !== classFilter) {
        return false;
      }

      // Graded Status Filter
      if (statusFilter === 'GRADED' && !rep) return false;
      if (statusFilter === 'UNGRADED' && rep) return false;

      if (!q) return true;

      // Match multi-dimensional queries
      const matchNis = s.nis.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      const matchClass = cls?.name.toLowerCase().includes(q);
      const matchTeacher = cls?.teacherName.toLowerCase().includes(q);
      const matchParent = s.parentName?.toLowerCase().includes(q);

      // Match report scores / juz if graded
      const matchJilid = rep?.pembelajaranAlQuran.jilid.prestasiBelajar.toLowerCase().includes(q);
      const matchTurjuman = rep?.pembelajaranAlQuran.turjuman.keterangan.toLowerCase().includes(q);
      const matchTahfidz = rep?.hafalanAlQuran.targetHafalanKelas.toLowerCase().includes(q);
      const matchPredikat = rep?.hafalanAlQuran.ujianSemester.predikat.toLowerCase().includes(q);

      return (
        matchNis ||
        matchName ||
        matchClass ||
        matchTeacher ||
        matchParent ||
        matchJilid ||
        matchTurjuman ||
        matchTahfidz ||
        matchPredikat
      );
    });
  }, [students, classes, reports, query, classFilter, statusFilter]);

  if (!isOpen) return null;

  const handleCopyLink = (nis: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/?view=parent&nis=${encodeURIComponent(nis)}`;
    navigator.clipboard.writeText(url);
    setCopiedNis(nis);
    setTimeout(() => setCopiedNis(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-16 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Search Bar Input Header */}
        <div className="bg-gradient-to-r from-[#07193b] via-[#0c245c] to-[#0b1c48] p-4 sm:p-5 border-b border-white/15 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-400/25">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama santri, NIS, kelas, ustadz, jilid UMMI, juz tahfidz, atau predikat..."
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-2xl px-4 py-2.5 text-sm sm:text-base font-bold text-white placeholder-blue-200/60 outline-hidden transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Kelas:
              </span>
              <button
                onClick={() => setClassFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                  classFilter === 'ALL'
                    ? 'bg-amber-400 text-blue-950'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                Semua ({students.length})
              </button>
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setClassFilter(cls.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${
                    classFilter === cls.id
                      ? 'bg-amber-400 text-blue-950'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>

            {/* Status Graded Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                  statusFilter === 'ALL' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Status
              </button>
              <button
                onClick={() => setStatusFilter('GRADED')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                  statusFilter === 'GRADED' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sudah Dinilai
              </button>
              <button
                onClick={() => setStatusFilter('UNGRADED')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                  statusFilter === 'UNGRADED' ? 'bg-rose-500/30 text-rose-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Belum Dinilai
              </button>
            </div>
          </div>
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-white/10 space-y-3">
          <div className="text-xs text-slate-400 flex items-center justify-between pb-1">
            <span>
              Menampilkan <strong>{filteredResults.length}</strong> data santri
            </span>
            <span className="text-[11px] text-slate-500">Klik santri untuk membuka input/cetak raport</span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-500" />
              <p className="font-bold text-sm text-slate-300">Tidak ada santri yang cocok dengan kata kunci</p>
              <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter kelas.</p>
            </div>
          ) : (
            filteredResults.map((s) => {
              const cls = classes.find((c) => c.id === s.classId);
              const rep = reports.find((r) => r.studentId === s.id);

              return (
                <div
                  key={s.id}
                  className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 p-3 rounded-2xl transition-all group"
                >
                  {/* Student Info */}
                  <div
                    onClick={() => {
                      onSelectStudent(s.id);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white group-hover:text-amber-300 transition-colors uppercase">
                        {s.name}
                      </span>
                      <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md font-bold">
                        NIS: {s.nis}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({s.gender === 'L' ? 'Laki-Laki' : 'Perempuan'})
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>Kelas: <strong className="text-slate-200">{cls?.name || s.classId}</strong></span>
                      <span>•</span>
                      <span>Guru: <strong className="text-slate-200">{cls?.teacherName || '-'}</strong></span>
                      {rep && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.2 rounded text-[10px]">
                            Raport: {rep.pembelajaranAlQuran.turjuman.prestasiBelajar || 'Tercatat'} (Ujian: {rep.hafalanAlQuran.ujianSemester.nilai || '-'})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions for this student */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopyLink(s.nis)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Salin Tautan Raport Santri (Verifikasi Publik)"
                    >
                      {copiedNis === s.nis ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 text-[11px]">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Link</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onSelectStudent(s.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 text-xs font-extrabold flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Buka Raport</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
