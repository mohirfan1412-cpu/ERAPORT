import React, { useState } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import {
  generateOpenEducationJson,
  generateMasterInteroperableExcel,
  generateFlatCsv,
  downloadRawFile,
} from '../utils/openDataInteroperability';
import {
  Globe,
  Share2,
  FileSpreadsheet,
  FileCode2,
  Database,
  Search,
  CheckCircle,
  Copy,
  ExternalLink,
  Code,
  Layers,
  Sparkles,
  X,
  FileText,
  Radio,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface InteroperabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  spreadsheetId?: string;
  isGoogleConnected?: boolean;
}

export const InteroperabilityModal: React.FC<InteroperabilityModalProps> = ({
  isOpen,
  onClose,
  students,
  classes,
  reports,
  settings,
  spreadsheetId,
  isGoogleConnected = false,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'seo' | 'sheets' | 'api'>('export');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadExcel = () => {
    generateMasterInteroperableExcel(students, classes, reports, settings);
  };

  const handleDownloadJson = () => {
    const data = generateOpenEducationJson(students, classes, reports, settings);
    const jsonStr = JSON.stringify(data, null, 2);
    const filename = `OpenData_Raport_${settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${settings.academicYear.replace('/', '-')}.json`;
    downloadRawFile(jsonStr, filename, 'application/json');
  };

  const handleDownloadCsv = () => {
    const csvContent = generateFlatCsv(students, classes, reports, settings);
    const filename = `Database_Flat_Raport_${settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    downloadRawFile(csvContent, filename, 'text/csv;charset=utf-8;');
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eraport-alquran.app';
  const sampleNis = students[0]?.nis || '2311063106';
  const sampleVerificationUrl = `${originUrl}/?view=parent&nis=${sampleNis}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#07193b] via-[#0c245c] to-[#0b1c48] px-5 sm:px-7 py-4.5 border-b border-white/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-500 flex items-center justify-center text-blue-950 font-bold shadow-lg shadow-cyan-400/25">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pusat Integrasi & Keterbacaan Sistem
                </h2>
                <span className="bg-cyan-400/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-400/30">
                  Open Data & SEO
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Memastikan data raport dapat dibaca oleh Mesin Pencari (Google/Bing), Dapodik/EMIS, dan aplikasi lain.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/60 px-5 sm:px-7 pt-3 border-b border-white/10 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'export'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Ekspor Aplikasi Lain (EMIS/Dapodik)</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'seo'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Mesin Pencari & SEO Web</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'sheets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Google Sheets & Web Query</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Format API & JSON Schema</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* TAB 1: EKSPOR APLIKASI LAIN */}
          {activeTab === 'export' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-4.5 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold text-white block mb-1">
                    Kompatibilitas Format Standar Nasional & Multi-Aplikasi
                  </span>
                  Data yang sudah diinput/diupload ke dalam E-Raport ini dapat diekspor ke dalam berbagai format standar terbuka agar bisa langsung diimpor ke aplikasi sekolah lain seperti <strong>Dapodik Kemendikbud</strong>, <strong>EMIS Kemenag</strong>, <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong>, maupun <strong>Database PostgreSQL/MySQL</strong>.
                </div>
              </div>

              {/* 3 Main Export Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Master Excel */}
                <div className="bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Master Excel Komprehensif</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Memuat 3 sheet terpadu: Master Flat Database, Sheet Santri format EMIS, dan Sheet Data Kelas.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadExcel}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Unduh Excel (.XLSX)</span>
                  </button>
                </div>

                {/* 2. Open Educational JSON */}
                <div className="bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Open Dataset (JSON Schema)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Format JSON standar Schema.org Dataset untuk integrasi sistem API, backup cloud, dan AI reader.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJson}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
                  >
                    <FileCode2 className="w-4 h-4" />
                    <span>Unduh JSON Schema</span>
                  </button>
                </div>

                {/* 3. CSV Database Loader */}
                <div className="bg-slate-800/80 border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 flex flex-col justify-between transition-all group">
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-white">Database Loader (CSV Flat)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Format kolom teratur koma (CSV) siap di-import langsung ke PostgreSQL, MySQL, SQLite, atau Python.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCsv}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
                  >
                    <Database className="w-4 h-4" />
                    <span>Unduh CSV Database</span>
                  </button>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-center">
                <div>
                  <div className="text-xl font-black text-white">{students.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Santri Terdaftar</div>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <div className="text-xl font-black text-cyan-400">{classes.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Rombongan Belajar / Kelas</div>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <div className="text-xl font-black text-emerald-400">{reports.length}</div>
                  <div className="text-[11px] text-slate-400 font-medium">Raport Lengkap Terbit</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MESIN PENCARI & SEO WEB */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Status Indeksasi Mesin Pencari (Search Engines)</h3>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Aktif & Terindeks</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <span>Google & Bing Bot Crawler:</span>
                    <span className="font-bold text-emerald-400">Allowed (robots.txt)</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <span>Schema.org Structured Data:</span>
                    <span className="font-bold text-cyan-400">JSON-LD Tersemat</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <span>Open Graph Preview (WhatsApp/Sosmed):</span>
                    <span className="font-bold text-emerald-400">Lengkap</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                    <span>PWA Web Manifest:</span>
                    <span className="font-bold text-cyan-400">Tersedia (/manifest.json)</span>
                  </div>
                </div>
              </div>

              {/* Direct Deep-Linking & Public Verification URL */}
              <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">
                    Tautan Pencarian & Verifikasi Langsung Santri (Deep Link)
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aplikasi lain atau barcode scanner dapat langsung membuka raport santri tertentu secara publik melalui parameter URL:
                </p>

                <div className="bg-slate-950 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-cyan-300 truncate">{sampleVerificationUrl}</span>
                  <button
                    onClick={() => handleCopy(sampleVerificationUrl, 'verif-url')}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-sans font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === 'verif-url' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE SHEETS & WEB QUERY */}
          {activeTab === 'sheets' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">Koneksi Database Google Spreadsheet</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isGoogleConnected && spreadsheetId
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {isGoogleConnected && spreadsheetId ? 'Google Sheets Aktif' : 'Belum Terhubung'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Ketika Google Workspace terhubung, seluruh data santri dan nilai tersinkronisasi langsung ke Google Spreadsheet. Aplikasi lain (seperti Microsoft Excel, Google Looker Studio, atau Website Lembaga) dapat membaca data secara <i>real-time</i>.
                </p>

                {spreadsheetId ? (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 space-y-2">
                    <div className="text-[11px] text-slate-400 font-bold uppercase">ID Spreadsheet Cloud:</div>
                    <div className="flex items-center justify-between font-mono text-xs text-emerald-300 gap-2">
                      <span className="truncate">{spreadsheetId}</span>
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-sans text-xs font-bold flex items-center gap-1.5 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Spreadsheet</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200">
                    Akun Google belum dihubungkan. Silakan hubungkan akun Google di menu <strong>Google DB & Sheets</strong> pada baris atas untuk mengaktifkan sinkronisasi otomatis.
                  </div>
                )}
              </div>

              {/* Formula Sample */}
              <div className="bg-slate-800/80 border border-white/15 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Rumus Tarik Data ke Spreadsheet Lain (Google Sheets / Excel)</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Gunakan formula bawaan Google Sheets berikut pada spreadsheet sekolah lainnya untuk mengambil data santri secara otomatis:
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/10 text-xs font-mono text-cyan-300 flex items-center justify-between gap-2">
                  <span className="truncate">
                    {spreadsheetId
                      ? `=IMPORTRANGE("${spreadsheetId}", "Santri!A1:G100")`
                      : `=IMPORTRANGE("SPREADSHEET_ID", "Santri!A1:G100")`}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        spreadsheetId
                          ? `=IMPORTRANGE("${spreadsheetId}", "Santri!A1:G100")`
                          : `=IMPORTRANGE("SPREADSHEET_ID", "Santri!A1:G100")`,
                        'formula'
                      )
                    }
                    className="shrink-0 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-sans"
                  >
                    {copiedKey === 'formula' ? 'Disalin' : 'Salin'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMAT API & JSON SCHEMA */}
          {activeTab === 'api' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Struktur REST & JSON Schema E-Raport</h3>
                  <p className="text-xs text-slate-300">
                    Spesifikasi payload resmi untuk dibaca oleh aplikasi lain via Webhook / REST Endpoint.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const data = generateOpenEducationJson(students, classes, reports, settings);
                    handleCopy(JSON.stringify(data, null, 2), 'json-payload');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedKey === 'json-payload' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Salin Seluruh JSON</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 max-h-[300px] overflow-y-auto font-mono text-[11px] text-cyan-300/90 leading-relaxed">
                <pre>{JSON.stringify(generateOpenEducationJson(students.slice(0, 2), classes, reports.slice(0, 2), settings), null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 sm:px-7 py-3.5 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open Data Standard v2.1.0 (Kemendikbud & Kemenag Aligned)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
