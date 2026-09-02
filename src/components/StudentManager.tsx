import React, { useState, useRef } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { Storage } from '../utils/storage';
import { downloadStudentImportTemplate, parseStudentsFromExcel } from '../utils/exportUtils';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  classes: ClassRoom[];
  settings: SchoolSettings;
  onUpdateStudents: (students: Student[]) => void;
  onOpenStudentEditor: (studentId: string) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  classes,
  settings,
  onUpdateStudents,
  onOpenStudentEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'single' | 'import'>('single');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Import Excel State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<
    Array<{
      nis: string;
      name: string;
      gender: 'L' | 'P';
      classId: string;
      className: string;
      parentName: string;
      parentPhone: string;
      isValid: boolean;
      errorReason?: string;
    }>
  >([]);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    valid: number;
    invalid: number;
  }>({ total: 0, valid: 0, invalid: 0 });
  const [mergeStrategy, setMergeStrategy] = useState<'update' | 'skip'>('update');
  const [toastMessage, setToToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToToastMessage(msg);
    setTimeout(() => setToToastMessage(null), 3500);
  };

  // Form State Single Add/Edit
  const [formData, setFormData] = useState<{
    nis: string;
    name: string;
    classId: string;
    gender: 'L' | 'P';
    parentName: string;
    parentPhone: string;
  }>({
    nis: '',
    name: '',
    classId: classes[0]?.id || '',
    gender: 'L',
    parentName: '',
    parentPhone: '',
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setModalTab('single');
    setFormData({
      nis: '',
      name: '',
      classId: classes[0]?.id || '',
      gender: 'L',
      parentName: '',
      parentPhone: '',
    });
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setEditingStudent(null);
    setModalTab('import');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setModalTab('single');
    setFormData({
      nis: student.nis,
      name: student.name,
      classId: student.classId,
      gender: student.gender,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
    });
    setIsModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    try {
      downloadStudentImportTemplate(classes);
      showToast('Template Excel Santri berhasil diunduh!');
    } catch (err: any) {
      alert('Gagal mengunduh template Excel: ' + (err?.message || 'Error tidak diketahui'));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsProcessingFile(true);

    try {
      const res = await parseStudentsFromExcel(file, classes);
      setImportPreviewData(res.parsedStudents);
      setImportSummary({
        total: res.totalRows,
        valid: res.validCount,
        invalid: res.invalidCount,
      });
      if (res.totalRows === 0) {
        showToast('Tidak ada baris data santri yang terdeteksi di file.');
      } else {
        showToast(`Berhasil membaca ${res.totalRows} data santri (${res.validCount} valid).`);
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal membaca berkas Excel.');
      setImportPreviewData([]);
      setImportSummary({ total: 0, valid: 0, invalid: 0 });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = () => {
    const validStudentsToImport = importPreviewData.filter((s) => s.isValid);
    if (validStudentsToImport.length === 0) {
      alert('Tidak ada data santri yang valid untuk diimpor.');
      return;
    }

    let updatedStudents = [...students];
    let addedCount = 0;
    let updatedCount = 0;

    validStudentsToImport.forEach((imported) => {
      const existingIndex = updatedStudents.findIndex(
        (s) => s.nis.trim().toLowerCase() === imported.nis.trim().toLowerCase()
      );

      if (existingIndex >= 0) {
        if (mergeStrategy === 'update') {
          const existing = updatedStudents[existingIndex];
          updatedStudents[existingIndex] = {
            ...existing,
            name: imported.name.trim().toUpperCase(),
            gender: imported.gender,
            classId: imported.classId || existing.classId,
            parentName: imported.parentName || existing.parentName || '',
            parentPhone: imported.parentPhone || existing.parentPhone || '',
          };
          updatedCount++;
        }
      } else {
        const newStudent: Student = {
          id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          nis: imported.nis.trim(),
          name: imported.name.trim().toUpperCase(),
          gender: imported.gender,
          classId: imported.classId || classes[0]?.id || 'class-default',
          parentName: imported.parentName || '',
          parentPhone: imported.parentPhone || '',
        };
        updatedStudents.push(newStudent);
        addedCount++;
      }
    });

    // Simpan ke Storage & Perbarui State
    Storage.saveStudents(updatedStudents);
    onUpdateStudents(updatedStudents);

    // Reset Preview & Tutup Modal
    setImportPreviewData([]);
    setSelectedFileName(null);
    setImportSummary({ total: 0, valid: 0, invalid: 0 });
    setIsModalOpen(false);

    showToast(
      `Sukses mengimpor data santri! (+${addedCount} santri baru, ${updatedCount} diperbarui)`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nis.trim() || !formData.name.trim()) return;

    if (editingStudent) {
      // Update existing
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              nis: formData.nis.trim(),
              name: formData.name.trim().toUpperCase(),
              classId: formData.classId,
              gender: formData.gender,
              parentName: formData.parentName.trim(),
              parentPhone: formData.parentPhone.trim(),
            }
          : s
      );
      onUpdateStudents(updated);
      Storage.saveStudents(updated);
      showToast('Data santri berhasil diperbarui!');
    } else {
      // Add new
      const newStudent: Student = {
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        nis: formData.nis.trim(),
        name: formData.name.trim().toUpperCase(),
        classId: formData.classId,
        gender: formData.gender,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
      };
      const updated = [...students, newStudent];
      onUpdateStudents(updated);
      Storage.saveStudents(updated);
      showToast('Santri baru berhasil ditambahkan!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      const updated = students.filter((s) => s.id !== id);
      onUpdateStudents(updated);
      Storage.saveStudents(updated);
      showToast('Data santri telah dihapus.');
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-blue-950 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-500" />
            <span>Manajemen Data Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Kelola data santri, NIS, penempatan kelas, dan kontak wali santri.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Download Template Excel */}
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-2xs transition-all cursor-pointer"
            title="Unduh format template Excel untuk tambah banyak santri"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Template Excel</span>
          </button>

          {/* Upload Excel Bulk */}
          <button
            onClick={openImportModal}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            title="Unggah berkas Excel untuk tambah santri massal"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel</span>
            <span className="text-[9px] bg-emerald-900/60 px-1.5 py-0.2 rounded-full font-bold">
              Bulk
            </span>
          </button>

          {/* Manual Add Student */}
          <button
            id="btn-add-new-student"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-blue-950 text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-400/25 border border-amber-300/60 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-950" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/75 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-900/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Santri / NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-blue-100 rounded-2xl text-xs w-48 sm:w-64 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs font-medium"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-white border border-blue-100 rounded-2xl px-3 py-2 text-xs font-bold text-blue-950 outline-hidden shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Kelas ({students.length})</option>
            {classes.map((c) => {
              const countInClass = students.filter((s) => s.classId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({countInClass} Santri)
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <div>
            Menampilkan: <span className="font-extrabold text-blue-950">{filteredStudents.length}</span> dari{' '}
            <span className="font-extrabold text-slate-700">{students.length}</span> Santri
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-950/5 text-slate-700 uppercase font-bold text-[10.5px] border-b border-blue-900/10">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">No</th>
                <th className="py-3.5 px-3">NIS</th>
                <th className="py-3.5 px-4">Nama Santri</th>
                <th className="py-3.5 px-3 text-center">L/P</th>
                <th className="py-3.5 px-3">Kelas / Halaqah</th>
                <th className="py-3.5 px-4">Nama Orang Tua</th>
                <th className="py-3.5 px-3">Kontak WA</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p>Tidak ada data santri yang sesuai.</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={openImportModal}
                          className="text-emerald-700 hover:text-emerald-900 font-bold underline text-xs"
                        >
                          Import via Excel
                        </button>
                        <span>atau</span>
                        <button
                          onClick={openAddModal}
                          className="text-blue-900 hover:text-blue-950 font-bold underline text-xs"
                        >
                          Tambah Manual
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const classroom = classes.find((c) => c.id === s.classId);
                  return (
                    <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-blue-950">{s.nis}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-950 uppercase">{s.name}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block w-6 h-6 rounded-full text-center text-[11px] leading-6 font-bold shadow-2xs ${
                            s.gender === 'L'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-pink-100 text-pink-900 border border-pink-200'
                          }`}
                        >
                          {s.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">{classroom?.name || s.classId}</td>
                      <td className="py-3.5 px-4 text-slate-600">{s.parentName || '-'}</td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono">{s.parentPhone || '-'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenStudentEditor(s.id)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-900 to-blue-950 text-white hover:from-blue-800 hover:to-blue-900 font-bold rounded-xl text-[11px] transition-all shadow-2xs"
                            title="Input / Periksa Raport"
                          >
                            Raport
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-blue-100/60 rounded-xl transition-all"
                            title="Edit Data Santri"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition-all"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Modal Add/Edit / Import Excel Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-white space-y-4 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>
                  {editingStudent
                    ? 'Edit Data Santri'
                    : modalTab === 'import'
                    ? 'Import Santri Massal via Excel'
                    : 'Tambah Santri'}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs (Hanya ditampilkan jika bukan sedang edit 1 santri spesifik) */}
            {!editingStudent && (
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setModalTab('single')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    modalTab === 'single'
                      ? 'bg-white text-blue-950 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Input Manual (1 Santri)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('import')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    modalTab === 'import'
                      ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200 font-black'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Upload Berkas Excel (Banyak Santri)</span>
                </button>
              </div>
            )}

            {/* TAB 1: FORM INPUT MANUAL */}
            {modalTab === 'single' && (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">NIS (Nomor Induk Santri) *</label>
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="Contoh: 2311063101"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="L">Laki-laki (Ikhwan)</option>
                      <option value="P">Perempuan (Akhwat)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nama Lengkap Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: MUHAMMAD DZAKKI RAMADHAN"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Penempatan Kelas / Halaqah *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Guru: {c.teacherName} (Target: {c.targetHafalan})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Nama Ayah/Ibu"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">No. WhatsApp Wali</label>
                    <input
                      type="text"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-bold shadow-md shadow-blue-950/20 active:scale-95"
                  >
                    {editingStudent ? 'Simpan Perubahan' : 'Tambah Santri'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: IMPORT EXCEL SANTRI MASSAL */}
            {modalTab === 'import' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-200">
                {/* Instructions & Template Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        <span>Panduan Import Data Santri dari Excel</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        Gunakan template resmi untuk mengunggah puluhan hingga ratusan data santri beserta NIS, kelas, dan kontak wali santri secara instan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="shrink-0 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <span><strong>Download:</strong> Unduh template resmi di atas.</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <span><strong>Isi Data:</strong> Salin data santri ke spreadsheet.</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <span><strong>Upload:</strong> Pilih file lalu klik Simpan.</span>
                    </div>
                  </div>
                </div>

                {/* Upload Dropzone */}
                <div className="bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 text-center transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="excel-student-file-input"
                  />

                  <div className="max-w-md mx-auto space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5" />
                    </div>

                    <div>
                      <label
                        htmlFor="excel-student-file-input"
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-all shadow-2xs"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>{selectedFileName ? 'Pilih Berkas Lain...' : 'Pilih Berkas Excel Santri (.xlsx / .xls)'}</span>
                      </label>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {selectedFileName ? (
                        <span className="font-semibold text-emerald-900">
                          Berkas dipilih: <strong className="font-mono">{selectedFileName}</strong>
                        </span>
                      ) : (
                        'Format file didukung: .xlsx atau .xls (Microsoft Excel / Google Sheets)'
                      )}
                    </p>
                  </div>
                </div>

                {/* Processing State */}
                {isProcessingFile && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Membaca dan memvalidasi data santri dari file...</p>
                  </div>
                )}

                {/* Import Preview Table */}
                {importPreviewData.length > 0 && (
                  <div className="space-y-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 text-[11px] font-bold">
                          Total: <strong>{importSummary.total}</strong>
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Valid: <strong>{importSummary.valid}</strong></span>
                        </span>
                        {importSummary.invalid > 0 && (
                          <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Kurang Lengkap: <strong>{importSummary.invalid}</strong></span>
                          </span>
                        )}
                      </div>

                      {/* Merge Strategy */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] font-bold text-slate-600">Jika NIS sudah ada:</span>
                        <select
                          value={mergeStrategy}
                          onChange={(e) => setMergeStrategy(e.target.value as 'update' | 'skip')}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-[10.5px] font-bold text-slate-800 outline-hidden"
                        >
                          <option value="update">Perbarui Data</option>
                          <option value="skip">Lewati (Pertahankan Lama)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preview Table Body */}
                    <div className="overflow-x-auto max-h-[240px] border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px] text-slate-700">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-900 uppercase text-[9.5px]">
                          <tr>
                            <th className="py-2 px-2 text-center w-8">No</th>
                            <th className="py-2 px-2">NIS</th>
                            <th className="py-2 px-3">Nama Santri</th>
                            <th className="py-2 px-2 text-center">L/P</th>
                            <th className="py-2 px-2">Kelas</th>
                            <th className="py-2 px-2">Orang Tua</th>
                            <th className="py-2 px-2">WhatsApp</th>
                            <th className="py-2 px-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {importPreviewData.map((row, idx) => {
                            const isDuplicate = students.some(
                              (s) => s.nis.toLowerCase() === row.nis.toLowerCase()
                            );

                            return (
                              <tr
                                key={idx}
                                className={
                                  !row.isValid
                                    ? 'bg-rose-50/50'
                                    : isDuplicate
                                    ? 'bg-amber-50/40 hover:bg-amber-50/70'
                                    : 'hover:bg-slate-50'
                                }
                              >
                                <td className="py-1.5 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                                <td className="py-1.5 px-2 font-mono font-bold text-blue-950">
                                  {row.nis || <span className="text-rose-500 italic">(Kosong)</span>}
                                </td>
                                <td className="py-1.5 px-3 font-bold text-slate-950 uppercase">
                                  {row.name || <span className="text-rose-500 italic">(Kosong)</span>}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  <span
                                    className={`inline-block w-4 h-4 rounded-full text-center text-[9px] leading-4 font-bold ${
                                      row.gender === 'L'
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'bg-pink-100 text-pink-900'
                                    }`}
                                  >
                                    {row.gender}
                                  </span>
                                </td>
                                <td className="py-1.5 px-2 font-semibold text-slate-800">
                                  {row.className}
                                </td>
                                <td className="py-1.5 px-2 text-slate-600">
                                  {row.parentName || '-'}
                                </td>
                                <td className="py-1.5 px-2 font-mono text-slate-600 text-[10px]">
                                  {row.parentPhone || '-'}
                                </td>
                                <td className="py-1.5 px-2 text-center">
                                  {row.isValid ? (
                                    isDuplicate ? (
                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md border border-amber-300">
                                        {mergeStrategy === 'update' ? 'Update' : 'Lewati'}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-md border border-emerald-300">
                                        Siap Tambah
                                      </span>
                                    )
                                  ) : (
                                    <span
                                      className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md border border-rose-300"
                                      title={row.errorReason}
                                    >
                                      {row.errorReason || 'Error'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setImportPreviewData([]);
                          setSelectedFileName(null);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={importSummary.valid === 0}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan {importSummary.valid} Santri ke Sistem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
