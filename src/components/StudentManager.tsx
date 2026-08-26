import React, { useState } from 'react';
import { Student, ClassRoom, StudentReport, SchoolSettings } from '../types';
import { Storage } from '../utils/storage';
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
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
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

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
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
    } else {
      // Add new
      const newStudent: Student = {
        id: `std-${Date.now()}`,
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
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data santri ini?')) {
      const updated = students.filter((s) => s.id !== id);
      onUpdateStudents(updated);
      Storage.saveStudents(updated);
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

        <button
          id="btn-add-new-student"
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-blue-950 text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-400/25 border border-amber-300/60 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-blue-950" />
          <span>Tambah Santri Baru</span>
        </button>
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
            <option value="ALL">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-extrabold text-blue-950">{filteredStudents.length}</span> Santri
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
                <th className="py-3.5 px-3">Kelas</th>
                <th className="py-3.5 px-4">Nama Orang Tua</th>
                <th className="py-3.5 px-3">Kontak WA</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                    Belum ada data santri.
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
                            s.gender === 'L' ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-pink-100 text-pink-900 border border-pink-200'
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
                            title="Input Raport"
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

      {/* Modal Add/Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>{editingStudent ? 'Edit Data Santri' : 'Tambah Santri Baru'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};
