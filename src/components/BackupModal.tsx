import React, { useState } from 'react';
import { Storage } from '../utils/storage';
import { Database, Download, Upload, RefreshCw, X, CheckCircle2, AlertTriangle, Cloud, FileSpreadsheet } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onOpenGoogleDb?: () => void;
  onCloudSync?: () => Promise<void>;
  onPullCloud?: () => Promise<void>;
  lastCloudSyncTime?: string | null;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onOpenGoogleDb,
  onCloudSync,
  onPullCloud,
  lastCloudSyncTime,
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isPullingCloud, setIsPullingCloud] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const dataStr = Storage.exportDatabaseBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_ERaport_AlQuran_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = Storage.importDatabaseBackup(content);
      if (success) {
        setImportStatus('success');
        onDataRestored();
        setTimeout(() => {
          setImportStatus('idle');
          onClose();
        }, 1200);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin menginisialisasi ulang seluruh data aplikasi? Tindakan ini akan mengembalikan susunan database ke pengaturan awal lembaga.')) {
      Storage.resetAllDataToDefault();
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white text-slate-800 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-emerald-950">Offline Backup & Pemulihan Data</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Real-time Multi-device Cloud Sync Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl space-y-2.5 shadow-md shadow-emerald-950/20 border border-emerald-700/50">
            <div className="font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-100">Database Cloud Antar Perangkat</span>
              </div>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold uppercase">
                Aktif & Real-time
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Memastikan seluruh perubahan santri, nilai raport, kelas, dan akun langsung tersimpan ke Cloud dan otomatis tampil sama di HP, laptop, serta akun lainnya.
            </p>
            {lastCloudSyncTime && (
              <div className="text-[10px] text-emerald-300/80 font-medium">
                Sinkronisasi terakhir: <span className="font-bold text-white">{lastCloudSyncTime}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isCloudSyncing}
                onClick={async () => {
                  if (onCloudSync) {
                    setIsCloudSyncing(true);
                    await onCloudSync();
                    setIsCloudSyncing(false);
                  }
                }}
                className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-[11px] cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isCloudSyncing ? 'Mengunggah...' : 'Unggah ke Cloud'}</span>
              </button>

              <button
                type="button"
                disabled={isPullingCloud}
                onClick={async () => {
                  if (onPullCloud) {
                    setIsPullingCloud(true);
                    await onPullCloud();
                    setIsPullingCloud(false);
                  }
                }}
                className="py-2 px-3 bg-emerald-800/80 hover:bg-emerald-700/90 border border-emerald-500/40 active:scale-95 text-emerald-100 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 text-[11px] cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isPullingCloud ? 'Memuat...' : 'Tarik dari Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Google Sheets / Drive Cloud Database Option */}
          {onOpenGoogleDb && (
            <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl space-y-2 shadow-md shadow-blue-950/20 border border-blue-800">
              <div className="font-bold flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Cloud className="w-4 h-4" />
                  <span>Google Spreadsheets & Drive</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Cloud Live
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-relaxed">
                Sinkronkan langsung database santri, kelas, dan nilai raport ke Google Sheets dan Google Drive akun Anda.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenGoogleDb();
                }}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-blue-950 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Buka Pengaturan Google Database</span>
              </button>
            </div>
          )}

          <p className="text-slate-600 leading-relaxed font-medium">
            Atau gunakan pencadangan berkas lokal JSON di bawah ini:
          </p>

          {/* Download Backup */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Unduh Cadangan (Backup JSON)</span>
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              Simpan semua data siswa, kelas, nilai raport, dan pengaturan ke file lokal di perangkat Anda.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20"
            >
              Unduh File Backup
            </button>
          </div>

          {/* Restore / Upload Backup */}
          <div className="p-4 bg-white/70 border border-emerald-100 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-teal-700" />
              <span>Pulihkan Data (Restore)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pilih file cadangan JSON yang pernah Anda unduh sebelumnya untuk memuat kembali semua data.
            </p>
            <label className="block w-full text-center py-2.5 bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-950 font-bold rounded-xl cursor-pointer transition-all shadow-2xs">
              <span>Pilih File Backup (.json)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            {importStatus === 'success' && (
              <div className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Data berhasil dipulihkan!</span>
              </div>
            )}
            {importStatus === 'error' && (
              <div className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Format file tidak valid.</span>
              </div>
            )}
          </div>

          {/* Inisialisasi Ulang Data */}
          <div className="pt-3 border-t border-emerald-900/10 flex justify-between items-center">
            <button
              onClick={handleResetData}
              className="text-rose-700 hover:text-rose-900 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Inisialisasi Ulang Sistem</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-950/10 hover:bg-emerald-950/15 text-emerald-950 font-semibold rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
