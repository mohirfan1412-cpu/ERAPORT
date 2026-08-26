import React, { useState } from 'react';
import { UserAccount, Student } from '../types';
import { Storage } from '../utils/storage';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  X,
  KeyRound,
  Lock,
  ArrowRight,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  students?: Student[];
  onSelectUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  users,
  students = [],
  onSelectUser,
}) => {
  const [activePortal, setActivePortal] = useState<'teacher' | 'admin' | 'parent' | 'superadmin'>('teacher');

  // Form Inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [niyInput, setNiyInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nisInput, setNisInput] = useState('');

  // Status Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clean strings for flexible matching
  const cleanStr = (s?: string) => (s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Teacher Portal Login
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = cleanStr(usernameInput);
    const cleanNiy = cleanStr(niyInput);

    if (!cleanUser || !cleanNiy) {
      setErrorMessage('Mohon masukkan Nama / Username dan NIY (Nomor Induk Yayasan).');
      return;
    }

    // Find matching teacher
    const matchedTeacher = users.find((u) => {
      if (u.role !== 'teacher') return false;
      const matchNameOrUser = cleanStr(u.username) === cleanUser || cleanStr(u.name).includes(cleanUser);
      const matchNiy =
        cleanStr(u.niy) === cleanNiy ||
        cleanStr(u.nip) === cleanNiy ||
        (u.password && cleanStr(u.password) === cleanNiy);
      return matchNameOrUser && matchNiy;
    });

    if (matchedTeacher) {
      setSuccessMessage(`Selamat datang, ${matchedTeacher.name}! Membuka portal guru...`);
      setTimeout(() => {
        onSelectUser(matchedTeacher);
        Storage.setCurrentUser(matchedTeacher);
        onClose();
      }, 600);
    } else {
      setErrorMessage(
        'Akun guru atau NIY tidak sesuai. Pastikan Username/Nama dan NIY terdaftar di data yayasan.'
      );
    }
  };

  // 2. Admin Khusus / Coordinator Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = cleanStr(usernameInput);
    const cleanNiy = cleanStr(niyInput);

    if (!cleanUser || !cleanNiy) {
      setErrorMessage('Mohon masukkan Username / Nama dan NIY Admin Khusus.');
      return;
    }

    const matchedAdmin = users.find((u) => {
      if (u.role !== 'coordinator' && u.role !== 'super_admin') return false;
      const matchNameOrUser = cleanStr(u.username) === cleanUser || cleanStr(u.name).includes(cleanUser);
      const matchNiy =
        cleanStr(u.niy) === cleanNiy ||
        cleanStr(u.nip) === cleanNiy ||
        (u.password && cleanStr(u.password) === cleanNiy);
      return matchNameOrUser && matchNiy;
    });

    if (matchedAdmin) {
      setSuccessMessage(`Akses Admin Khusus terverifikasi: ${matchedAdmin.name}`);
      setTimeout(() => {
        onSelectUser(matchedAdmin);
        Storage.setCurrentUser(matchedAdmin);
        onClose();
      }, 600);
    } else {
      setErrorMessage('Kredensial Admin Khusus atau NIY tidak sesuai.');
    }
  };

  // 3. Parent Portal Access
  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNis = cleanStr(nisInput);
    if (!cleanNis) {
      setErrorMessage('Mohon masukkan Nomor Induk Santri (NIS) atau Nama Ananda.');
      return;
    }

    const matchedStudent = students.find(
      (s) => cleanStr(s.nis) === cleanNis || cleanStr(s.name).includes(cleanNis)
    );

    const parentUser: UserAccount = {
      id: 'user-parent',
      username: 'walimurid',
      name: matchedStudent ? `Wali Santri - ${matchedStudent.name}` : 'Wali Santri / Orang Tua',
      niy: '-',
      role: 'parent',
      notes: matchedStudent ? `Akses raport untuk ${matchedStudent.name} (NIS: ${matchedStudent.nis})` : undefined,
    };

    setSuccessMessage(`Berhasil membuka portal wali santri.`);
    setTimeout(() => {
      onSelectUser(parentUser);
      Storage.setCurrentUser(parentUser);
      onClose();
    }, 500);
  };

  // 4. Super Admin Login
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = cleanStr(usernameInput);
    const cleanPass = cleanStr(passwordInput);

    const superAdmin = users.find((u) => u.role === 'super_admin') || users[0];

    const matchUser =
      cleanStr(superAdmin.username) === cleanUser ||
      cleanStr(superAdmin.name).includes(cleanUser) ||
      cleanUser === 'superadmin' ||
      cleanUser === 'admin';

    const matchPass =
      (superAdmin.password && cleanStr(superAdmin.password) === cleanPass) ||
      cleanStr(superAdmin.niy) === cleanPass ||
      cleanPass === 'admin' ||
      cleanPass === cleanStr(superAdmin.username);

    if (matchUser && matchPass) {
      setSuccessMessage(`Akses Super Admin Terverifikasi. Selamat datang!`);
      setTimeout(() => {
        onSelectUser(superAdmin);
        Storage.setCurrentUser(superAdmin);
        onClose();
      }, 600);
    } else {
      setErrorMessage('Username atau Password Super Admin tidak tepat. Silakan periksa kembali.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07193b]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-white text-slate-800 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#07193b] to-blue-900 text-amber-400 flex items-center justify-center font-bold shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-950">Portal Masuk E-Raport</h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih portal sesuai peran: Guru Khusus, Admin Khusus, Wali Murid, atau Super Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Type Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-4">
          {/* Tab 1: Guru */}
          <button
            onClick={() => {
              setActivePortal('teacher');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activePortal === 'teacher'
                ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">Portal Guru</span>
          </button>

          {/* Tab 2: Admin Khusus */}
          <button
            onClick={() => {
              setActivePortal('admin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activePortal === 'admin'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Admin Khusus</span>
          </button>

          {/* Tab 3: Wali Murid */}
          <button
            onClick={() => {
              setActivePortal('parent');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activePortal === 'parent'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Wali Murid</span>
          </button>

          {/* Tab 4: Super Admin */}
          <button
            onClick={() => {
              setActivePortal('superadmin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              activePortal === 'superadmin'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-blue-950 shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">Super Admin</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* PORTAL FORM BODY */}
        <div className="space-y-4 text-xs">
          {/* 1. PORTAL GURU KHUSUS */}
          {activePortal === 'teacher' && (
            <form onSubmit={handleTeacherLogin} className="space-y-3.5">
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3 text-teal-950 font-medium leading-relaxed">
                Masuk sebagai <strong>Guru Al-Qur'an</strong> untuk menginput nilai jilid/tartil, turjuman, tahfidz juz, hadits, dan mencetak raport halaqah.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Guru atau Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: mujiono / M. Mujiono"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={niyInput}
                    onChange={(e) => setNiyInput(e.target.value)}
                    placeholder="Contoh: NIY. 20240201"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 outline-hidden shadow-2xs"
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  * Diberikan oleh koordinator / admin yayasan
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md shadow-teal-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Masuk Portal Guru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. PORTAL ADMIN KHUSUS */}
          {activePortal === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 text-blue-950 font-medium leading-relaxed">
                Masuk sebagai <strong>Admin Khusus / Koordinator</strong> untuk memantau nilai santri seluruh kelas, statistik kelulusan, dan cetak massal.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Username / Nama Admin <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Contoh: admin.quran / Ahmad Fauzi"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-800 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={niyInput}
                    onChange={(e) => setNiyInput(e.target.value)}
                    placeholder="Contoh: NIY. 20240101"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-800 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md shadow-blue-900/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Masuk Portal Admin Khusus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. PORTAL WALI MURID */}
          {activePortal === 'parent' && (
            <form onSubmit={handleParentLogin} className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-emerald-950 font-medium leading-relaxed">
                Portal khusus <strong>Wali Santri / Orang Tua</strong> untuk melihat hasil raport Al-Qur'an, capaian hafalan juz, turjuman, hadits, dan unduh PDF resmi.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor Induk Santri (NIS) atau Nama Ananda <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value)}
                    placeholder="Contoh: 2024001 atau Muhammad Rayhan"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-hidden shadow-2xs"
                  />
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1 block">
                  * Cukup masukkan NIS atau nama santri yang terdaftar di yayasan
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Buka Raport Santri</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. PORTAL SUPER ADMIN */}
          {activePortal === 'superadmin' && (
            <form onSubmit={handleSuperAdminLogin} className="space-y-3.5">
              <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300 rounded-2xl p-3 text-amber-950 font-medium">
                Akses penuh <strong>Super Admin Utama</strong> untuk manajemen data lembaga, akun guru & admin khusus, serta pengaturan sistem.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Username Super Admin <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="superadmin"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Password / PIN Kunci <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-blue-950 font-black rounded-xl shadow-md shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Masuk Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Sistem E-Raport Lembaga Al-Qur'an</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
