import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings, UserAccount, GoogleWorkspaceDatabaseState } from '../types';
import { exportClassMasterExcel, exportReportToPdf, exportReportToExcel } from '../utils/exportUtils';
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Settings,
  Database,
  RefreshCw,
  Eye,
  Edit,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Folder,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface CoordinatorDashboardProps {
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  users: UserAccount[];
  onOpenStudentEditor: (studentId: string) => void;
  onOpenSettingsModal: () => void;
  onOpenBackupModal: () => void;
  onOpenGoogleDbModal?: () => void;
  isGoogleConnected?: boolean;
  googleDbState?: GoogleWorkspaceDatabaseState;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  students,
  classes,
  reports,
  settings,
  users,
  onOpenStudentEditor,
  onOpenSettingsModal,
  onOpenBackupModal,
  onOpenGoogleDbModal,
  isGoogleConnected = false,
  googleDbState,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute stats
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const completedReportsCount = reports.filter(
    (r) => r.pembelajaranAlQuran.turjuman.perKata && r.hafalanAlQuran.ujianSemester.nilai
  ).length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedReportsCount / totalStudents) * 100) : 0;

  // Grade distributions
  const gradeStats = useMemo(() => {
    let mumtaz = 0;
    let jayyidJiddan = 0;
    let jayyid = 0;
    let maqbul = 0;
    let other = 0;

    reports.forEach((r) => {
      const pred = r.hafalanAlQuran.ujianSemester.predikat;
      if (pred === 'Mumtaz') mumtaz++;
      else if (pred === 'Jayyid Jiddan') jayyidJiddan++;
      else if (pred === 'Jayyid') jayyid++;
      else if (pred === 'Maqbul') maqbul++;
      else other++;
    });

    return { mumtaz, jayyidJiddan, jayyid, maqbul, other };
  }, [reports]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Class filter
      if (selectedClassFilter !== 'ALL' && s.classId !== selectedClassFilter) {
        return false;
      }

      // Status filter
      const report = reports.find((r) => r.studentId === s.id);
      const isCompleted = Boolean(report && report.hafalanAlQuran.ujianSemester.nilai);
      if (statusFilter === 'COMPLETED' && !isCompleted) return false;
      if (statusFilter === 'PENDING' && isCompleted) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesNis = s.nis.toLowerCase().includes(q);
        return matchesName || matchesNis;
      }

      return true;
    });
  }, [students, reports, selectedClassFilter, statusFilter, searchQuery]);

  // Handle Class Excel Download
  const handleExportClassExcel = (classroom: ClassRoom) => {
    const classStudents = students.filter((s) => s.classId === classroom.id);
    exportClassMasterExcel(classroom, classStudents, reports, settings);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-slate-800">
      {/* Top Banner / Header in Royal Blue & Warm Yellow Glass */}
      <div className="bg-gradient-to-r from-[#07193b]/95 via-[#0c245c]/90 to-[#0b1c48]/95 backdrop-blur-2xl text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-950/20 border border-white/20 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Building className="w-4 h-4" />
              <span>{settings.schoolName || 'Lembaga Pendidikan Al-Qur’an'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Dashboard Koordinator Al-Qur'an & Tahfidz
            </h1>
            <p className="text-blue-100/80 text-xs md:text-sm mt-1">
              Pemantauan Real-Time Perkembangan Raport Santri Semester {settings.semester} TP {settings.academicYear}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenGoogleDbModal && (
              <button
                id="btn-open-google-db"
                onClick={onOpenGoogleDbModal}
                className="flex items-center gap-2 text-xs font-bold bg-emerald-600/90 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl border border-emerald-400/40 backdrop-blur-xl transition-all active:scale-95 shadow-md shadow-emerald-950/20"
              >
                <span className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-emerald-300 animate-pulse' : 'bg-white/60'}`} />
                <span>Google Drive & Sheets</span>
              </button>
            )}

            <button
              id="btn-open-settings"
              onClick={onOpenSettingsModal}
              className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-xl transition-all active:scale-95 shadow-sm"
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>Pengaturan Raport</span>
            </button>

            <button
              id="btn-open-backup"
              onClick={onOpenBackupModal}
              className="flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-400/25 border border-amber-200/60 transition-all active:scale-95 hover:scale-[1.02]"
            >
              <Database className="w-4 h-4 text-blue-950" />
              <span>Backup & Restore Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Drive & Sheets Database Status / Action Banner */}
      {googleDbState?.isMigrated && isGoogleConnected ? (
        <div className="bg-gradient-to-r from-emerald-900/90 via-teal-900/85 to-[#07193b]/95 backdrop-blur-xl text-white rounded-3xl p-4 md:p-5 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Database Utama: Google Spreadsheets & Google Drive</span>
                <span className="text-[10px] uppercase font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Aktif & Auto-Sync
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                5 Lembar Kerja (Santri, Kelas, Raport, Pengaturan, Pengguna) •{' '}
                {googleDbState.lastSyncedAt
                  ? `Terakhir sinkron ${new Date(googleDbState.lastSyncedAt).toLocaleTimeString('id-ID')} WIB`
                  : 'Siap sinkron'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {googleDbState.spreadsheetUrl && (
              <a
                href={googleDbState.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-950 px-3.5 py-2 rounded-xl shadow-xs hover:bg-emerald-50 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Buka Spreadsheet</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {googleDbState.folderUrl && (
              <a
                href={googleDbState.folderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-800/80 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl border border-emerald-400/30 transition-colors"
              >
                <Folder className="w-3.5 h-3.5 text-emerald-300" />
                <span>Folder Drive</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>
            )}
            {onOpenGoogleDbModal && (
              <button
                onClick={onOpenGoogleDbModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-xs font-semibold"
                title="Kelola Database Google"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/15 via-blue-900/40 to-indigo-950/60 backdrop-blur-xl border border-amber-400/40 rounded-3xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Pindahkan Keseluruhan Database ke Google Drive & Sheets
                </span>
                <span className="text-[10px] uppercase font-black bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full">
                  Disarankan
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Simpan seluruh data raport, santri, kelas, dan cadangan PDF langsung ke akun Google Anda secara terpusat.
              </p>
            </div>
          </div>

          {onOpenGoogleDbModal && (
            <button
              onClick={onOpenGoogleDbModal}
              className="shrink-0 inline-flex items-center gap-2 text-xs font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-blue-950 px-4 py-2.5 rounded-2xl shadow-md shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-blue-950" />
              <span>Migrasikan Database Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Santri */}
        <div className="bg-white/75 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm hover:shadow-md hover:bg-white/90 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Santri</p>
            <h3 className="text-2xl font-black text-blue-950 mt-1">{totalStudents}</h3>
            <div className="mt-1 text-xs text-blue-800 flex items-center font-bold">
              <span>Terdaftar di semua kelas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shadow-xs border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Rombel / Kelas */}
        <div className="bg-white/75 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm hover:shadow-md hover:bg-white/90 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Kelas</p>
            <h3 className="text-2xl font-black text-blue-950 mt-1">{totalClasses}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Halaqah Al-Qur'an</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-xs border border-amber-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Progress Pengisian */}
        <div className="bg-white/75 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm hover:shadow-md hover:bg-white/90 transition-all flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raport Terisi</p>
            <h3 className="text-2xl font-black text-blue-950 mt-1">
              {completedReportsCount} <span className="text-xs font-normal text-slate-500">/ {totalStudents}</span>
            </h3>
            <div className="w-28 bg-slate-200/80 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center shadow-xs border border-blue-100">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Status Sistem & Mumtaz */}
        <div className="bg-gradient-to-br from-[#0c245c] to-[#07193b] backdrop-blur-xl text-white p-5 rounded-3xl shadow-lg shadow-blue-950/15 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300 uppercase font-bold tracking-wider">Predikat Mumtaz</p>
            <h3 className="text-2xl font-black text-white mt-1">{gradeStats.mumtaz} Santri</h3>
            <div className="mt-1.5 text-xs flex items-center gap-1.5 text-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Nilai Sempurna 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center border border-white/20 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base font-bold text-blue-950 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-800" />
            Distribusi Predikat Ujian Tahfidz Santri
          </h2>
          <span className="text-xs text-slate-500 font-medium">Total data dinilai: {completedReportsCount}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
          <div className="bg-amber-400/15 border border-amber-300/40 backdrop-blur-xs p-4 rounded-2xl">
            <div className="text-blue-950 font-bold">Mumtaz (100)</div>
            <div className="text-xl font-black text-amber-700 mt-1">{gradeStats.mumtaz} Santri</div>
            <div className="text-[11px] text-amber-800 font-semibold">Istimewa</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-300/40 backdrop-blur-xs p-4 rounded-2xl">
            <div className="text-blue-950 font-bold">Jayyid Jiddan (90-99)</div>
            <div className="text-xl font-black text-blue-800 mt-1">{gradeStats.jayyidJiddan} Santri</div>
            <div className="text-[11px] text-blue-700 font-semibold">Sangat Memuaskan</div>
          </div>

          <div className="bg-sky-500/10 border border-sky-300/40 backdrop-blur-xs p-4 rounded-2xl">
            <div className="text-blue-950 font-bold">Jayyid (80-89)</div>
            <div className="text-xl font-black text-sky-800 mt-1">{gradeStats.jayyid} Santri</div>
            <div className="text-[11px] text-sky-700 font-semibold">Memuaskan</div>
          </div>

          <div className="bg-slate-500/10 border border-slate-300/40 backdrop-blur-xs p-4 rounded-2xl">
            <div className="text-blue-950 font-bold">Maqbul (70-79)</div>
            <div className="text-xl font-black text-slate-800 mt-1">{gradeStats.maqbul} Santri</div>
            <div className="text-[11px] text-slate-600 font-semibold">Cukup Memuaskan</div>
          </div>
        </div>
      </div>

      {/* Classes Progress & Batch Export Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-800" />
            Rekapitulasi & Progres Tiap Kelas
          </h2>
          <span className="text-xs text-slate-500 font-medium">Klik download untuk mengambil Rekapitulasi Excel resmi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            const classReports = reports.filter(
              (r) => r.classId === cls.id && r.hafalanAlQuran.ujianSemester.nilai
            );
            const percent =
              classStudents.length > 0 ? Math.round((classReports.length / classStudents.length) * 100) : 0;

            return (
              <div
                key={cls.id}
                className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:bg-white/85 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-blue-950 text-sm">{cls.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Guru: {cls.teacherName}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-blue-900 rounded-full border border-blue-200">
                      Target: {cls.targetHafalan}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Kelengkapan Nilai</span>
                      <span className="font-bold text-blue-950">
                        {classReports.length}/{classStudents.length} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percent === 100 ? 'bg-emerald-600' : percent > 50 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-900/10 flex items-center gap-2">
                  <button
                    id={`btn-export-excel-class-${cls.id}`}
                    onClick={() => handleExportClassExcel(cls)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl shadow-sm shadow-blue-900/20 active:scale-95 transition-all"
                    title="Export Rekap Nilai Excel Kelas Ini"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      if (classStudents.length > 0) {
                        onOpenStudentEditor(classStudents[0].id);
                      }
                    }}
                    className="flex items-center justify-center p-2 text-blue-900 bg-white hover:bg-blue-50 border border-blue-200 rounded-2xl shadow-xs transition-all active:scale-95"
                    title="Buka Kelas Ini"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Santri Master Table with Real-time Search & Filters */}
      <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 md:p-5 border-b border-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-950/5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-blue-950">Data Santri & Status Raport</h2>
            <span className="text-xs bg-amber-400/20 text-blue-950 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              {filteredStudents.length} Santri
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-2xl text-xs w-44 sm:w-56 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden shadow-xs transition-all font-medium"
              />
            </div>

            {/* Class Filter */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-white border border-blue-100 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-xs transition-all"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-blue-100 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-xs transition-all"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Sudah Lengkap</option>
              <option value="PENDING">Belum Lengkap</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-950/5 text-slate-600 uppercase font-bold text-[10.5px] border-b border-blue-900/10">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Santri</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Turjuman</th>
                <th className="py-3.5 px-4 text-center">Ujian Tahfidz</th>
                <th className="py-3.5 px-4 text-center">Hadits</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                    Tidak ada santri yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const classroom = classes.find((c) => c.id === s.classId);
                  const report = reports.find((r) => r.studentId === s.id);
                  const isCompleted = Boolean(report && report.hafalanAlQuran.ujianSemester.nilai);

                  return (
                    <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{s.nis}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-950 uppercase">{s.name}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{classroom?.name || s.classId}</td>
                      <td className="py-3.5 px-4 text-center">
                        {report?.pembelajaranAlQuran.turjuman.keterangan ? (
                          <span className="font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {report.pembelajaranAlQuran.turjuman.keterangan}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold">
                        {report?.hafalanAlQuran.ujianSemester.nilai ? (
                          <span className="text-blue-950 bg-gradient-to-r from-amber-400/20 to-yellow-300/30 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                            {report.hafalanAlQuran.ujianSemester.nilai} ({report.hafalanAlQuran.ujianSemester.predikat})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold">
                        {report?.hafalanHadits.rataRata ? (
                          <span className="text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                            {report.hafalanHadits.rataRata} ({report.hafalanHadits.predikat})
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Belum Lengkap
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-open-editor-${s.id}`}
                            onClick={() => onOpenStudentEditor(s.id)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 rounded-xl transition-all font-bold flex items-center gap-1 text-[11px] active:scale-95 shadow-2xs"
                            title="Input / Edit Raport"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-800" />
                            <span>Edit</span>
                          </button>

                          {report && (
                            <button
                              onClick={() => exportReportToExcel(s, classroom, report, settings)}
                              className="p-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-xl transition-all active:scale-95 shadow-2xs"
                              title="Download Raport Excel"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
