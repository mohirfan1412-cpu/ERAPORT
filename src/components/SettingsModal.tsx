import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { Storage } from '../utils/storage';
import { KopLogo } from './KopLogo';
import { Settings, X, Save, CheckCircle2, Upload, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, logoUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setFormData({ ...formData, logoUrl: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    Storage.saveSettings(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white animate-in fade-in zoom-in duration-150 text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-emerald-950">Pengaturan Raport & Lembaga</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Logo Kop Section */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5">
            <label className="block font-bold text-emerald-950">Logo Kop Raport</label>
            <div className="flex items-center gap-3.5">
              <div className="p-1 bg-white rounded-2xl border border-emerald-200 shadow-xs shrink-0">
                <KopLogo logoUrl={formData.logoUrl} size={54} />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap gap-2">
                  <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Sekolah</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Pakai Logo Default</span>
                    </button>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500">
                  Format PNG/JPEG transparan. Logo akan ditampilkan di bagian kiri Kop Raport resmi.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-emerald-950 mb-1">Nama Lembaga / Sekolah</label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Tahun Pelajaran</label>
              <input
                type="text"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2025/2026"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'GANJIL' | 'GENAP' })}
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              >
                <option value="GENAP">GENAP</option>
                <option value="GANJIL">GANJIL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Kota Penerbitan</label>
              <input
                type="text"
                required
                value={formData.issueCity}
                onChange={(e) => setFormData({ ...formData, issueCity: e.target.value })}
                placeholder="Balikpapan"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Tanggal Masehi</label>
              <input
                type="text"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                placeholder="02 Juni 2026"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Tanggal Hijriyah</label>
              <input
                type="text"
                required
                value={formData.hijriDate}
                onChange={(e) => setFormData({ ...formData, hijriDate: e.target.value })}
                placeholder="16 Dzulhijjah 1447 H"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Koordinator Al-Qur'an</label>
              <input
                type="text"
                value={formData.coordinatorName}
                onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                placeholder="Ustadz Ahmad Fauzi, Al-Hafidz"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Kepala Sekolah</label>
              <input
                type="text"
                value={formData.headmasterName}
                onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                placeholder="Drs. H. Abdullah Masykur, M.Pd.I"
                className="w-full bg-white border border-emerald-100 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-900/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-950/10 hover:bg-emerald-950/15 text-emerald-950 font-semibold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
