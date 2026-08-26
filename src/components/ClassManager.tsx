import React, { useState } from 'react';
import { ClassRoom, UserAccount, Student } from '../types';
import { Storage } from '../utils/storage';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  Target,
  X,
  GraduationCap,
} from 'lucide-react';

interface ClassManagerProps {
  classes: ClassRoom[];
  students: Student[];
  teachers: UserAccount[];
  onUpdateClasses: (classes: ClassRoom[]) => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({
  classes,
  students,
  teachers,
  onUpdateClasses,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    gradeLevel: string;
    targetHafalan: string;
    teacherName: string;
  }>({
    name: '',
    gradeLevel: '9',
    targetHafalan: 'Juz 2',
    teacherName: 'M. Mujiono, S.Pd',
  });

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      gradeLevel: '9',
      targetHafalan: 'Juz 2',
      teacherName: teachers[0]?.name || 'M. Mujiono, S.Pd',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassRoom) => {
    setEditingClass(c);
    setFormData({
      name: c.name,
      gradeLevel: c.gradeLevel,
      targetHafalan: c.targetHafalan,
      teacherName: c.teacherName,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id
          ? {
              ...c,
              name: formData.name.trim().toUpperCase(),
              gradeLevel: formData.gradeLevel,
              targetHafalan: formData.targetHafalan.trim(),
              teacherName: formData.teacherName.trim(),
            }
          : c
      );
      onUpdateClasses(updated);
      Storage.saveClasses(updated);
    } else {
      const newClass: ClassRoom = {
        id: `class-${Date.now()}`,
        name: formData.name.trim().toUpperCase(),
        gradeLevel: formData.gradeLevel,
        targetHafalan: formData.targetHafalan.trim(),
        teacherId: 'teacher-custom',
        teacherName: formData.teacherName.trim(),
      };
      const updated = [...classes, newClass];
      onUpdateClasses(updated);
      Storage.saveClasses(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (classId: string) => {
    const studentCount = students.filter((s) => s.classId === classId).length;
    if (studentCount > 0) {
      alert(`Tidak dapat menghapus kelas ini karena masih memiliki ${studentCount} santri terdaftar.`);
      return;
    }
    if (window.confirm('Hapus kelas ini?')) {
      const updated = classes.filter((c) => c.id !== classId);
      onUpdateClasses(updated);
      Storage.saveClasses(updated);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-blue-950 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            <span>Manajemen Kelas / Halaqah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Atur nama rombel, target capaian hafalan semester, dan guru pengajar UMMI/Tahfidz.
          </p>
        </div>

        <button
          id="btn-add-new-class"
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-blue-950 text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-400/25 border border-amber-300/60 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-950" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.classId === cls.id);
          return (
            <div
              key={cls.id}
              className="bg-white/75 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl flex flex-col justify-between space-y-5 hover:shadow-2xl hover:bg-white/90 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 bg-gradient-to-r from-amber-400/25 to-yellow-300/30 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
                    Tingkat {cls.gradeLevel}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 text-slate-500 hover:text-blue-950 hover:bg-blue-100/60 rounded-xl transition-all"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition-all"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-black text-blue-950 mt-3">{cls.name}</h3>

                <div className="mt-4 space-y-2.5 text-xs text-slate-600 bg-white/70 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-50">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span>Target Hafalan: <strong className="text-blue-950 font-bold">{cls.targetHafalan}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-800" />
                    <span>Guru: <strong className="text-blue-950 font-bold">{cls.teacherName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-700" />
                    <span>Jumlah Santri: <strong className="text-blue-950 font-bold">{classStudents.length} Orang</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-blue-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-blue-900/10 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-blue-950">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-blue-950 mb-1">Nama Kelas / Halaqah*</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: IX A - AL HAITAMI"
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs uppercase font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blue-950 mb-1">Tingkat</label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    placeholder="Contoh: 9"
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-blue-950 mb-1">Target Hafalan Semester</label>
                  <input
                    type="text"
                    value={formData.targetHafalan}
                    onChange={(e) => setFormData({ ...formData, targetHafalan: e.target.value })}
                    placeholder="Contoh: Juz 2"
                    className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-blue-950 mb-1">Guru Pengajar Al-Qur'an & Tahfidz</label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Contoh: M. Mujiono, S.Pd"
                  className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                />
              </div>

              <div className="pt-3 border-t border-blue-900/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-white font-bold rounded-xl shadow-md shadow-blue-950/20 active:scale-95 transition-all"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
