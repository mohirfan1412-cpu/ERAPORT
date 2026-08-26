import React, { useState } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Folder,
  FileSpreadsheet,
  UploadCloud,
  DownloadCloud,
  FileText,
  AlertCircle,
  LogOut,
  ShieldCheck,
  Zap,
  HardDrive,
  Check,
  FolderArchive,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  GoogleUserProfile,
  GoogleWorkspaceDatabaseState,
  Student,
  ClassRoom,
  StudentReport,
  SchoolSettings,
  UserAccount,
} from '../types';
import {
  signInWithGoogle,
  signOutGoogle,
  syncLocalToGoogleSheets,
  pullDataFromGoogleSheets,
  uploadReportPdfToGoogleDrive,
  saveGoogleDatabaseState,
  migrateEntireDatabaseToGoogleWorkspace,
  MigrationStepProgress,
} from '../utils/googleWorkspace';
import { generateReportPdfBlob } from '../utils/exportUtils';
import { Storage } from '../utils/storage';

interface GoogleDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleProfile: GoogleUserProfile | null;
  googleToken: string | null;
  dbState: GoogleWorkspaceDatabaseState;
  onUpdateDbState: (state: Partial<GoogleWorkspaceDatabaseState>) => void;
  onProfileChange: (profile: GoogleUserProfile | null, token: string | null) => void;
  students: Student[];
  classes: ClassRoom[];
  reports: StudentReport[];
  settings: SchoolSettings;
  users: UserAccount[];
  onDataRestored: () => void;
}

export const GoogleDatabaseModal: React.FC<GoogleDatabaseModalProps> = ({
  isOpen,
  onClose,
  googleProfile,
  googleToken,
  dbState,
  onUpdateDbState,
  onProfileChange,
  students,
  classes,
  reports,
  settings,
  users,
  onDataRestored,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [backupProgress, setBackupProgress] = useState<{ current: number; total: number } | null>(null);
  
  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStepProgress[]>([]);

  if (!isOpen) return null;

  // 1. Google Sign-In & Automatic Workspace Database Provisioning
  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Menghubungkan ke Akun Google & menyiapkan Google Drive & Spreadsheet secara otomatis...' });
    try {
      const { profile, accessToken } = await signInWithGoogle();
      onProfileChange(profile, accessToken);
      await executeMigration(accessToken);
    } catch (err: any) {
      console.error('Google Workspace Connect Error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghubungkan ke Google Workspace. Silakan coba lagi.',
      });
      setIsLoading(false);
      setIsMigrating(false);
    }
  };

  // 2. Migration Execution Logic
  const executeMigration = async (token: string) => {
    setIsMigrating(true);
    setIsLoading(true);
    setMigrationSteps([]);
    setStatusMessage({ type: 'info', text: 'Membuat folder di Google Drive dan Google Spreadsheet Database...' });

    try {
      const result = await migrateEntireDatabaseToGoogleWorkspace(
        token,
        { students, classes, reports, settings, users },
        (step) => {
          setMigrationSteps((prev) => {
            const existingIdx = prev.findIndex((s) => s.stepIndex === step.stepIndex);
            if (existingIdx >= 0) {
              const updated = [...prev];
              updated[existingIdx] = step;
              return updated;
            }
            return [...prev, step];
          });
        }
      );

      const newState = {
        isConnected: true,
        isMigrated: true,
        autoSyncEnabled: true,
        folderId: result.folderId,
        folderUrl: result.folderUrl,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        lastSyncedAt: result.syncedAt,
        isSyncing: false,
        error: null,
      };

      onUpdateDbState(newState);
      saveGoogleDatabaseState(newState);

      setStatusMessage({
        type: 'success',
        text: 'Alhamdulillah! Folder Google Drive dan file Google Spreadsheet Database berhasil dibuat dan terhubung 100% dengan akun Google Anda.',
      });
    } catch (err: any) {
      console.error('Migration error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat memindahkan database ke Google Workspace.',
      });
    } finally {
      setIsLoading(false);
      setIsMigrating(false);
    }
  };

  const handleExecuteFullMigration = async () => {
    let token = googleToken;
    if (!token) {
      setIsLoading(true);
      try {
        const authRes = await signInWithGoogle();
        onProfileChange(authRes.profile, authRes.accessToken);
        token = authRes.accessToken;
      } catch (e: any) {
        setIsLoading(false);
        setStatusMessage({ type: 'error', text: 'Otorisasi Google diperlukan sebelum migrasi.' });
        return;
      }
    }
    await executeMigration(token);
  };

  // 3. Disconnect / Logout Google
  const handleDisconnectGoogle = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan sambungan akun Google dari database?')) return;
    setIsLoading(true);
    try {
      await signOutGoogle();
      onProfileChange(null, null);
      const resetState = {
        isConnected: false,
        isMigrated: false,
        folderId: null,
        folderUrl: null,
        spreadsheetId: null,
        spreadsheetUrl: null,
        lastSyncedAt: null,
      };
      onUpdateDbState(resetState);
      saveGoogleDatabaseState(resetState);
      setStatusMessage({ type: 'info', text: 'Sambungan akun Google telah diputus.' });
    } catch (err: any) {
      console.error('Signout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Push Local to Google Sheets
  const handlePushToSheets = async () => {
    if (!googleToken || !dbState.spreadsheetId) {
      await handleExecuteFullMigration();
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Menyinkronkan seluruh data aplikasi ke Google Sheets...' });
    try {
      const res = await syncLocalToGoogleSheets(googleToken, dbState.spreadsheetId, {
        students,
        classes,
        reports,
        settings,
        users,
      });
      onUpdateDbState({ lastSyncedAt: res.syncedAt, isSyncing: false, error: null });
      setStatusMessage({
        type: 'success',
        text: `Data berhasil disinkronkan ke Google Sheets pada ${new Date(res.syncedAt).toLocaleTimeString('id-ID')} WIB!`,
      });
    } catch (err: any) {
      console.error('Push error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menyimpan ke Google Sheets. Silakan coba hubungkan ulang akun Google Anda.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Pull Data from Google Sheets
  const handlePullFromSheets = async () => {
    if (!googleToken || !dbState.spreadsheetId) {
      await handleConnectGoogle();
      return;
    }

    const confirmPull = window.confirm(
      'Apakah Anda yakin ingin mengambil dan memperbarui data lokal dengan isi terbaru dari Google Sheets?'
    );
    if (!confirmPull) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengambil data santri, kelas, dan raport dari Google Sheets...' });
    try {
      const data = await pullDataFromGoogleSheets(googleToken, dbState.spreadsheetId);

      Storage.saveStudents(data.students);
      Storage.saveClasses(data.classes);
      Storage.saveReports(data.reports);
      Storage.saveSettings(data.settings);
      Storage.saveUsers(data.users);

      onDataRestored();
      setStatusMessage({
        type: 'success',
        text: `Berhasil memuat ${data.students.length} Santri, ${data.classes.length} Kelas, dan ${data.reports.length} Raport dari Google Sheets!`,
      });
    } catch (err: any) {
      console.error('Pull error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mengambil data dari Google Sheets. Pastikan format tabel di Google Sheets tidak terhapus.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Upload Raport PDFs to Google Drive Folder
  const handleBackupPdfsToDrive = async () => {
    if (!googleToken || !dbState.folderId) {
      await handleExecuteFullMigration();
      return;
    }

    setIsLoading(true);
    setBackupProgress({ current: 0, total: students.length });
    setStatusMessage({ type: 'info', text: `Menyiapkan pengunggahan PDF raport ke Google Drive...` });

    try {
      let uploadedCount = 0;
      const targetFolderId = dbState.pdfFolderId || dbState.folderId;
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setBackupProgress({ current: i + 1, total: students.length });
        setStatusMessage({
          type: 'info',
          text: `Membuat & mengunggah PDF (${i + 1}/${students.length}): ${student.name}...`,
        });

        const pdfBlob = await generateReportPdfBlob('official-report-card');
        if (pdfBlob) {
          const fileName = `Raport_UMMI_${student.nis}_${student.name.replace(/\s+/g, '_')}.pdf`;
          await uploadReportPdfToGoogleDrive(googleToken, targetFolderId, fileName, pdfBlob);
          uploadedCount++;
        }
      }

      setStatusMessage({
        type: 'success',
        text: `Berhasil mengunggah ${uploadedCount} berkas PDF Raport ke folder Google Drive!`,
      });
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mengunggah PDF ke Google Drive.',
      });
    } finally {
      setIsLoading(false);
      setBackupProgress(null);
    }
  };

  // Toggle Auto-Sync
  const toggleAutoSync = () => {
    const nextVal = !(dbState.autoSyncEnabled ?? true);
    onUpdateDbState({ autoSyncEnabled: nextVal });
    saveGoogleDatabaseState({ autoSyncEnabled: nextVal });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-[#07193b] via-[#0c245c] to-[#000080] text-white">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight">Database Google Drive & Spreadsheets</h2>
                {dbState.isMigrated && dbState.isConnected ? (
                  <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Database Aktif
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Perlu Migrasi
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Penyimpanan cloud terpusat untuk Data Santri, Halaqah Kelas, Nilai Raport, Pengaturan & Arsip PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Status Alert Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 shadow-2xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50/90 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50/90 text-rose-800 border border-rose-200'
                  : 'bg-blue-50/90 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* Migration Banner (Primary CTA) */}
          <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-[#07193b] text-white shadow-xl shadow-blue-950/20 border border-blue-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-400 text-blue-950">
                    Migrasi Penuh Database
                  </span>
                  <span className="text-xs text-blue-200">100% Seluruh Tabel & Berkas</span>
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Pindahkan Keseluruhan Database ke Google Drive & Sheets
                </h3>
                <p className="text-xs text-blue-100/80 leading-relaxed">
                  Membuat struktur 5 lembar kerja Google Spreadsheet (Santri, Kelas, Raport, Pengaturan, Pengguna) dan folder arsip Google Drive di akun Google Anda.
                </p>
              </div>

              <button
                onClick={handleExecuteFullMigration}
                disabled={isLoading || isMigrating}
                className="shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-200 text-blue-950 font-bold text-xs shadow-lg shadow-amber-950/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-950" />
                    <span>Sedang Memindahkan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-blue-950 fill-blue-950" />
                    <span>Migrasikan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Migration Steps Progress Viewer */}
            {isMigrating && migrationSteps.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/15 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Progres Pemindahan Database:</span>
                </div>
                <div className="space-y-1.5 bg-black/25 rounded-2xl p-3 border border-white/10">
                  {migrationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        {step.status === 'completed' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : step.status === 'in-progress' ? (
                          <RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-white/30" />
                        )}
                        <span className={`font-semibold ${step.status === 'completed' ? 'text-emerald-200' : step.status === 'in-progress' ? 'text-amber-200 font-bold' : 'text-blue-200/60'}`}>
                          {step.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-blue-200/70 truncate max-w-[200px]">{step.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Account Card */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {googleProfile?.photoURL ? (
                <img
                  src={googleProfile.photoURL}
                  alt={googleProfile.displayName}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-200">
                  {googleProfile ? googleProfile.displayName[0] : 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {googleProfile ? googleProfile.displayName : 'Akun Google Belum Terhubung'}
                  </span>
                  {googleProfile && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" /> Terverifikasi
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {googleProfile ? googleProfile.email : 'Masuk dengan akun Google untuk mengaktifkan Google Sheets & Drive'}
                </div>
              </div>
            </div>

            {googleProfile ? (
              <button
                onClick={handleDisconnectGoogle}
                disabled={isLoading}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Putuskan Akun
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isLoading}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl border border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2.5 active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Masuk dengan Google
              </button>
            )}
          </div>

          {/* Database Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Santri Terdaftar</div>
              <div className="text-lg font-black text-blue-950 mt-0.5">{students.length} Santri</div>
              <div className="text-[10px] text-slate-500">Lembar 'Santri'</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Halaqah Kelas</div>
              <div className="text-lg font-black text-blue-950 mt-0.5">{classes.length} Kelas</div>
              <div className="text-[10px] text-slate-500">Lembar 'Kelas'</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nilai Raport</div>
              <div className="text-lg font-black text-blue-950 mt-0.5">{reports.length} Rekap</div>
              <div className="text-[10px] text-slate-500">Lembar 'Raport'</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guru & Pimpinan</div>
              <div className="text-lg font-black text-blue-950 mt-0.5">{users.length} Akun</div>
              <div className="text-[10px] text-slate-500">Lembar 'Pengguna'</div>
            </div>
          </div>

          {/* Connected Cloud Assets */}
          {googleProfile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Aset Database di Akun Google Anda
                </h3>
                {dbState.lastSyncedAt && (
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Terakhir Sinkron: {new Date(dbState.lastSyncedAt).toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Spreadsheet Card */}
                <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        Google Spreadsheet Database
                      </div>
                      <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        5 Lembar
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {dbState.spreadsheetTitle || 'Database E-Raport Al-Qur\'an (Metode UMMI & Tahfidz)'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Santri • Kelas • Raport • Pengaturan • Pengguna
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-emerald-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-800 font-medium">Google Sheets Live</span>
                    {dbState.spreadsheetUrl ? (
                      <a
                        href={dbState.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors"
                      >
                        Buka Spreadsheet <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={handleExecuteFullMigration}
                        className="text-[11px] font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs"
                      >
                        Buat Spreadsheet
                      </button>
                    )}
                  </div>
                </div>

                {/* Google Drive Folder Card */}
                <div className="bg-blue-50/60 border border-blue-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <Folder className="w-4 h-4 text-blue-700" />
                        Folder Google Drive Utama
                      </div>
                      <span className="text-[10px] bg-blue-200/70 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                        Cloud Storage
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      E-Raport Al-Qur'an UMMI & Tahfidz
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Folder /Arsip_PDF_Raport & /Cadangan_Database_JSON
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-blue-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-blue-800 font-medium">Google Drive Storage</span>
                    {dbState.folderUrl ? (
                      <a
                        href={dbState.folderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:text-blue-950 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-2xs hover:bg-blue-50 transition-colors"
                      >
                        Buka Folder Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={handleExecuteFullMigration}
                        className="text-[11px] font-bold text-blue-800 bg-white px-3 py-1.5 rounded-xl border border-blue-300 shadow-2xs"
                      >
                        Buat Folder Drive
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto Sync Switcher */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Sinkronisasi Otomatis Realtime</div>
                    <div className="text-[10px] text-slate-500">
                      Menyimpan data otomatis ke Google Sheets setiap kali ada perubahan pada raport, santri, atau pengaturan.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleAutoSync}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    dbState.autoSyncEnabled !== false ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      dbState.autoSyncEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Action Operations */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 px-1">
              Aksi Sinkronisasi Manual & Pencadangan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Push Button */}
              <button
                onClick={handlePushToSheets}
                disabled={isLoading}
                className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white hover:border-indigo-400 hover:shadow-xs transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Unggah / Timpa Data ke Google Sheets
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Menulis seluruh data santri, kelas, dan rekap raport terbaru ke dalam Google Spreadsheet.
                  </div>
                </div>
              </button>

              {/* Pull Button */}
              <button
                onClick={handlePullFromSheets}
                disabled={isLoading}
                className="p-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white hover:border-emerald-400 hover:shadow-xs transition-all text-left flex items-start gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Tarik Data dari Google Sheets
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Memuat kembali perubahan data yang Anda edit langsung di lembar Google Spreadsheet ke aplikasi.
                  </div>
                </div>
              </button>
            </div>

            {/* Backup All PDFs to Drive */}
            <button
              onClick={handleBackupPdfsToDrive}
              disabled={isLoading || !googleProfile}
              className="w-full p-3.5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-blue-50/80 hover:border-blue-400 hover:shadow-xs transition-all text-left flex items-center justify-between group disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-700 text-white shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    Cadangkan Semua Lembar PDF Raport ke Google Drive
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Menghasilkan file PDF resmi F4 untuk seluruh santri dan menyimpannya di folder Google Drive.
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-white px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Mulai Cadangkan PDF
              </span>
            </button>

            {backupProgress && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                <div className="flex justify-between font-semibold text-blue-900 mb-1">
                  <span>Mengunggah PDF ke Google Drive...</span>
                  <span>
                    {backupProgress.current} / {backupProgress.total} Santri
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(backupProgress.current / backupProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <span>Integrasi Langsung Google Workspace API (Drive & Sheets)</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-2xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
