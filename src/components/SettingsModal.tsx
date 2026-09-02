import React, { useState } from 'react';
import { SchoolSettings, HaditsItemScores } from '../types';
import { Storage } from '../utils/storage';
import { KopLogo, SecondaryLogo } from './KopLogo';
import { HADITS_LIST, getHaditsList, HADITS_PRESET_TEMPLATES } from '../utils/reportCalculations';
import { Settings, X, Save, CheckCircle2, Upload, RotateCcw, Image, Sparkles, Sliders, ToggleLeft, ToggleRight, Eye, EyeOff, BookOpen, Edit3 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'logo' | 'format' | 'institution'>('logo');

  if (!isOpen) return null;

  // Handle Primary Logo (Left)
  const handlePrimaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle Secondary Logo (Right / Logo yang satunya)
  const handleSecondaryLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, secondaryLogoUrl: event.target.result as string, showSecondaryLogo: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPrimaryLogo = () => {
    setFormData({ ...formData, logoUrl: undefined });
  };

  const handleResetSecondaryLogo = () => {
    setFormData({ ...formData, secondaryLogoUrl: undefined, showSecondaryLogo: true });
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
    <div className="fixed inset-0 z-50 bg-emerald-950/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white animate-in fade-in zoom-in duration-150 text-slate-800 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/10 flex items-center justify-center text-emerald-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-950">Pengaturan Raport & Lembaga</h3>
              <p className="text-[11px] text-slate-500">Sesuaikan logo kop, format hafalan hadits, dan identitas lembaga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mb-4 bg-emerald-50/60 p-1 rounded-2xl border border-emerald-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logo'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100/50'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Atur Logo (Kiri & Kanan)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('format')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'format'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Format Hadits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('institution')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'institution'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-900 hover:bg-emerald-100/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Data Lembaga</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: PENGATURAN LOGO KOP */}
          {activeTab === 'logo' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Preview Kop Header */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-inner">
                <div className="text-[10px] font-bold text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview Kop Raport</span>
                </div>
                <div className="bg-white text-black p-3 rounded-xl flex items-center gap-3 border border-slate-200">
                  <KopLogo logoUrl={formData.logoUrl} size={48} />
                  <div className="flex-1 text-center leading-tight">
                    <div className="font-bold text-[10px] uppercase text-slate-900 truncate">
                      {formData.schoolName || 'LEMBAGA PENDIDIKAN ISLAM'}
                    </div>
                    <div className="font-extrabold text-[11px] text-[#000080]">
                      RAPORT AL-QUR'AN & TAHFIDZ
                    </div>
                    <div className="text-[8.5px] text-slate-600">
                      T.P {formData.academicYear} &bull; {formData.semester}
                    </div>
                  </div>
                  <SecondaryLogo
                    logoUrl={formData.secondaryLogoUrl}
                    size={48}
                    show={formData.showSecondaryLogo !== false}
                  />
                </div>
              </div>

              {/* Logo Kiri (Logo Sekolah) */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Logo Utama / Logo Kiri (Logo Sekolah/Yayasan)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-2xl border border-emerald-200 shadow-xs shrink-0 flex items-center justify-center">
                    <KopLogo logoUrl={formData.logoUrl} size={54} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Sekolah</span>
                        <input type="file" accept="image/*" onChange={handlePrimaryLogoUpload} className="hidden" />
                      </label>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={handleResetPrimaryLogo}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Default</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Disarankan PNG transparan persegi. Muncul di sudut kiri atas kop raport resmi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo Kanan (Logo Yang Satunya / UMMI / Kemenag / Mitra) */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Logo Kedua / Logo Yang Satunya (Logo Kanan)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, showSecondaryLogo: !formData.showSecondaryLogo })}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] flex items-center gap-1 transition-all ${
                      formData.showSecondaryLogo !== false
                        ? 'bg-emerald-200/70 text-emerald-900'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {formData.showSecondaryLogo !== false ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3" />}
                    <span>{formData.showSecondaryLogo !== false ? 'Ditampilkan' : 'Disembunyikan'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-2xl border border-emerald-200 shadow-xs shrink-0 flex items-center justify-center">
                    <SecondaryLogo
                      logoUrl={formData.secondaryLogoUrl}
                      size={54}
                      show={formData.showSecondaryLogo !== false}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-semibold rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Kanan Baru</span>
                        <input type="file" accept="image/*" onChange={handleSecondaryLogoUpload} className="hidden" />
                      </label>
                      {formData.secondaryLogoUrl && (
                        <button
                          type="button"
                          onClick={handleResetSecondaryLogo}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset ke Preset</span>
                        </button>
                      )}
                    </div>

                    {/* Presets Selector */}
                    <div>
                      <span className="block text-[10.5px] font-bold text-slate-600 mb-1">
                        Atau Pilih Logo Preset Cepat:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, secondaryLogoUrl: undefined, showSecondaryLogo: true })}
                          className={`p-1.5 border rounded-xl text-[10px] font-semibold transition-all text-center ${
                            !formData.secondaryLogoUrl
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          Badge Mutu UMMI
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, secondaryLogoUrl: 'preset:ummi_vector', showSecondaryLogo: true })}
                          className={`p-1.5 border rounded-xl text-[10px] font-semibold transition-all text-center ${
                            formData.secondaryLogoUrl === 'preset:ummi_vector'
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          Logo Resmi UMMI
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, secondaryLogoUrl: 'preset:kemenag', showSecondaryLogo: true })}
                          className={`p-1.5 border rounded-xl text-[10px] font-semibold transition-all text-center ${
                            formData.secondaryLogoUrl === 'preset:kemenag'
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          Kemenag RI
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, secondaryLogoUrl: 'preset:kemendikbud', showSecondaryLogo: true })}
                          className={`p-1.5 border rounded-xl text-[10px] font-semibold transition-all text-center ${
                            formData.secondaryLogoUrl === 'preset:kemendikbud'
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          Kemendikbud
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN FORMAT HAFALAN HADITS */}
          {activeTab === 'format' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Box 1: Toggle Hadits On/Off */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">
                      Tampilkan Format Hafalan Hadits di Raport
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Aktifkan atau nonaktifkan bagian hafalan hadits pada lembar cetak/PDF raport.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, showHaditsSection: !formData.showHaditsSection })}
                    className={`shrink-0 p-2 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all shadow-xs ${
                      formData.showHaditsSection
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {formData.showHaditsSection ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        <span>Format Hadits AKTIF</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        <span>Format Hadits NONAKTIF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`p-2.5 rounded-xl border text-[11.5px] leading-relaxed transition-all ${
                  formData.showHaditsSection
                    ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  {formData.showHaditsSection ? (
                    <div>
                      <span className="font-bold">✓ Format Hadits Aktif:</span> Lembar raport mencantumkan 3 bagian: (I) Pembelajaran Al-Qur'an, (II) Hafalan Al-Qur'an, dan (III) {formData.haditsSectionTitle || 'Hafalan Hadits'}.
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold">&#x2717; Format Hadits Dihilangkan:</span> Lembar raport tampil berfokus pada (I) Pembelajaran Al-Qur'an dan (II) Hafalan Al-Qur'an.
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: Kustomisasi Judul Bagian Hadits */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-xs text-emerald-950">
                      Format Judul Bagian Hadits
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Ubah format teks judul sesuai kurikulum sekolah (contoh: <em>III. HAFALAN HADITS</em> atau <em>III. HADITS PILIHAN & DOA</em>)
                    </p>
                  </div>
                  {formData.haditsSectionTitle && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, haditsSectionTitle: undefined })}
                      className="text-[10.5px] text-emerald-700 hover:text-emerald-900 font-semibold underline"
                    >
                      Reset Judul Bawaan
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.haditsSectionTitle || ''}
                  onChange={(e) => setFormData({ ...formData, haditsSectionTitle: e.target.value })}
                  placeholder="III. HAFALAN HADITS"
                  className="w-full bg-emerald-50/30 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              {/* Box 3: Pilihan Preset Cepat Nama Hadits */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preset Template Nama Hadits Siap Pakai</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {HADITS_PRESET_TEMPLATES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          haditsSectionTitle: preset.sectionTitle,
                          haditsNames: { ...preset.haditsNames },
                        })
                      }
                      className="p-2 text-left rounded-xl border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                    >
                      <div className="font-bold text-[11px] text-emerald-900 group-hover:text-emerald-950">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {preset.sectionTitle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 4: Kustomisasi 10 Nama Hadits Satu per Satu */}
              <div className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-50 pb-2">
                  <div>
                    <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Ubah Nama-Nama Hadits (1 s/d 10)</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Ketikkan nama hadits, doa, atau materi hafalan sesuai keinginan Anda
                    </p>
                  </div>
                  {formData.haditsNames && Object.keys(formData.haditsNames).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, haditsNames: undefined })}
                      className="text-[10.5px] text-rose-600 hover:text-rose-800 font-semibold underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Semua ke Default</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HADITS_LIST.map((h, idx) => {
                    const currentVal = formData.haditsNames?.[h.key] ?? '';
                    return (
                      <div key={h.key} className="bg-slate-50/70 p-2 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10.5px] font-bold text-slate-700">
                            Hadits #{idx + 1}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono">
                            Bawaan: {h.title}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => {
                            const newNames = { ...(formData.haditsNames || {}) };
                            newNames[h.key] = e.target.value;
                            setFormData({ ...formData, haditsNames: newNames });
                          }}
                          placeholder={h.title}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden shadow-2xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 5: Live Preview Header Tabel Hadits */}
              <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800">
                <div className="text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pratinjau Tabel Raport: {formData.haditsSectionTitle || 'III. HAFALAN HADITS'}</span>
                </div>
                <div className="overflow-x-auto bg-white text-black p-2 rounded-xl border border-slate-300">
                  <table className="w-full border-collapse border border-black text-[8.5px]">
                    <thead>
                      <tr className="bg-[#000080] text-white font-bold text-center">
                        <th className="border border-black px-1 py-0.5 w-6">No</th>
                        <th className="border border-black px-1.5 py-0.5 w-24 text-left">JENIS EVALUASI</th>
                        {getHaditsList(formData.haditsNames).map((h) => (
                          <th key={h.key} className="border border-black px-1 py-0.5 font-semibold">
                            {h.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-center">
                        <td className="border border-black py-0.5">1</td>
                        <td className="border border-black text-left px-1.5">Hafalan Hadits</td>
                        {getHaditsList(formData.haditsNames).map((h) => (
                          <td key={h.key} className="border border-black py-0.5 text-slate-700">
                            85
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA LEMBAGA & PENGESAHAN */}
          {activeTab === 'institution' && (
            <div className="space-y-4 animate-in fade-in duration-200">
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
            </div>
          )}

          {/* Footer Submit Action */}
          <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 italic">
              Pengaturan akan otomatis diterapkan pada semua tampilan dan lembar cetak
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-950/10 hover:bg-emerald-950/15 text-emerald-950 font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
