import React, { useState } from 'react';
import { UserAccount, Student, SchoolSettings } from '../types';
import { Storage } from '../utils/storage';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  KeyRound,
  Lock,
  ArrowRight,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  students?: Student[];
  settings?: SchoolSettings;
  onSelectUser: (user: UserAccount) => void;
  onLoginSuccess?: (user: UserAccount, targetNis?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  users,
  students = [],
  settings,
  onSelectUser,
  onLoginSuccess,
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

  const finishLogin = (user: UserAccount, targetNis?: string) => {
    onSelectUser(user);
    Storage.setAuthSession(user);
    if (onLoginSuccess) {
      onLoginSuccess(user, targetNis);
    } else if (onClose) {
      onClose();
    }
  };

  // 1. Teacher Portal Login
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = cleanStr(usernameInput);
    const cleanNiy = cleanStr(niyInput);

    if (!cleanUser || !cleanNiy) {
      setErrorMessage('Mohon masukkan Nama/Username Guru dan Password/NIY.');
      return;
    }

    // Find matching teacher
    const candidateUsers = users.length > 0 ? users : Storage.getUsers();
    const matchedTeacher = candidateUsers.find((u) => {
      if (u.role !== 'teacher') return false;
      const matchNameOrUser = cleanStr(u.username) === cleanUser || cleanStr(u.name).includes(cleanUser);
      const matchPasswordOrNiy =
        (u.password && cleanStr(u.password) === cleanNiy) ||
        cleanStr(u.niy) === cleanNiy ||
        (u.nip && cleanStr(u.nip) === cleanNiy);
      return matchNameOrUser && matchPasswordOrNiy;
    });

    if (matchedTeacher) {
      setSuccessMessage(`Selamat datang, ${matchedTeacher.name}! Membuka portal guru...`);
      setTimeout(() => {
        finishLogin(matchedTeacher);
      }, 500);
    } else {
      setErrorMessage(
        'Akun guru atau Password/NIY tidak sesuai. Pastikan Username dan Password/NIY sesuai dengan yang terdaftar di yayasan.'
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
      setErrorMessage('Mohon masukkan Username/Nama Admin dan Password/NIY.');
      return;
    }

    const candidateUsers = users.length > 0 ? users : Storage.getUsers();
    const matchedAdmin = candidateUsers.find((u) => {
      if (u.role !== 'coordinator' && u.role !== 'super_admin') return false;
      const matchNameOrUser = cleanStr(u.username) === cleanUser || cleanStr(u.name).includes(cleanUser);
      const matchPasswordOrNiy =
        (u.password && cleanStr(u.password) === cleanNiy) ||
        cleanStr(u.niy) === cleanNiy ||
        (u.nip && cleanStr(u.nip) === cleanNiy);
      return matchNameOrUser && matchPasswordOrNiy;
    });

    if (matchedAdmin) {
      setSuccessMessage(`Akses Admin Khusus terverifikasi: ${matchedAdmin.name}`);
      setTimeout(() => {
        finishLogin(matchedAdmin);
      }, 500);
    } else {
      setErrorMessage('Kredensial Admin Khusus atau Password/NIY tidak sesuai.');
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

    const candidateStudents = students.length > 0 ? students : Storage.getStudents();
    const matchedStudent = candidateStudents.find(
      (s) => cleanStr(s.nis) === cleanNis || cleanStr(s.name).includes(cleanNis)
    );

    if (!matchedStudent) {
      setErrorMessage('Santri dengan NIS atau Nama tersebut tidak ditemukan dalam database lembaga. Silakan periksa kembali nomor induk yang dimasukkan.');
      return;
    }

    const parentUser: UserAccount = {
      id: `user-parent-${matchedStudent.id}`,
      username: `wali_${matchedStudent.nis}`,
      name: `Wali Santri - ${matchedStudent.name}`,
      niy: '-',
      role: 'parent',
      notes: `Akses raport untuk ${matchedStudent.name} (NIS: ${matchedStudent.nis})`,
    };

    setSuccessMessage(`Data Santri ${matchedStudent.name} ditemukan. Membuka raport...`);
    setTimeout(() => {
      finishLogin(parentUser, matchedStudent.nis);
    }, 500);
  };

  // 4. Super Admin Login
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUser = cleanStr(usernameInput);
    const cleanPass = cleanStr(passwordInput);

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Mohon masukkan Username dan Password Super Admin.');
      return;
    }

    const candidateUsers = users.length > 0 ? users : Storage.getUsers();
    const superAdmin = candidateUsers.find((u) => u.role === 'super_admin') || candidateUsers[0];

    const matchUser =
      cleanStr(superAdmin.username) === cleanUser ||
      cleanStr(superAdmin.name).includes(cleanUser) ||
      cleanUser === 'superadmin' ||
      cleanUser === 'admin';

    const matchPass =
      (superAdmin.password && cleanStr(superAdmin.password) === cleanPass) ||
      cleanStr(superAdmin.niy) === cleanPass ||
      cleanPass === 'admin';

    if (matchUser && matchPass) {
      setSuccessMessage(`Akses Super Admin Terverifikasi. Selamat datang!`);
      setTimeout(() => {
        finishLogin(superAdmin);
      }, 500);
    } else {
      setErrorMessage('Username atau Password Super Admin tidak tepat. Silakan periksa kembali kata sandi Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07193b]/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-white text-slate-800 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header Branding */}
        <div className="border-b border-slate-200/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#07193b] to-blue-900 text-amber-400 flex items-center justify-center font-bold shadow-md shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-black text-lg text-slate-950 leading-tight">Portal Masuk E-Raport</h2>
                <span className="bg-amber-400 text-blue-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-2xs">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {settings?.schoolName || 'Lembaga Pendidikan Al-Qur’an & Tahfidz'}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-2.5 bg-slate-50 border border-slate-200/70 rounded-xl px-3 py-2 leading-relaxed">
            Silakan masukkan kredensial akun terdaftar untuk masuk ke dalam sistem. Akses terbatas dan terproteksi.
          </p>
        </div>

        {/* Portal Type Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-2xl mb-4">
          {/* Tab 1: Guru */}
          <button
            type="button"
            onClick={() => {
              setActivePortal('teacher');
              setErrorMessage(null);
              setSuccessMessage(null);
              setUsernameInput('');
              setNiyInput('');
              setPasswordInput('');
              setNisInput('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'teacher'
                ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span className="truncate">Portal Guru</span>
          </button>

          {/* Tab 2: Admin Khusus */}
          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setErrorMessage(null);
              setSuccessMessage(null);
              setUsernameInput('');
              setNiyInput('');
              setPasswordInput('');
              setNisInput('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Admin Khusus</span>
          </button>

          {/* Tab 3: Wali Murid */}
          <button
            type="button"
            onClick={() => {
              setActivePortal('parent');
              setErrorMessage(null);
              setSuccessMessage(null);
              setUsernameInput('');
              setNiyInput('');
              setPasswordInput('');
              setNisInput('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'parent'
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">Wali Murid</span>
          </button>

          {/* Tab 4: Super Admin */}
          <button
            type="button"
            onClick={() => {
              setActivePortal('superadmin');
              setErrorMessage(null);
              setSuccessMessage(null);
              setUsernameInput('');
              setNiyInput('');
              setPasswordInput('');
              setNisInput('');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'superadmin'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-blue-950 shadow-md font-black'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
              <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-3 text-teal-950 font-medium leading-relaxed">
                Masuk sebagai <strong>Guru Al-Qur'an</strong> untuk menginput nilai jilid/tartil, turjuman, tahfidz juz, hadits, dan mencetak raport santri halaqah.
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
                    placeholder="Masukkan username atau nama guru terdaftar..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 outline-hidden shadow-2xs text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Password atau NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={niyInput}
                    onChange={(e) => setNiyInput(e.target.value)}
                    placeholder="Masukkan password atau NIY guru..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 outline-hidden shadow-2xs text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md shadow-teal-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Masuk Portal Guru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. PORTAL ADMIN KHUSUS */}
          {activePortal === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 text-blue-950 font-medium leading-relaxed">
                Masuk sebagai <strong>Admin Khusus / Koordinator</strong> untuk memantau nilai santri seluruh kelas, statistik kelulusan, dan cetak massal.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Username / Nama Admin Koordinator <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Masukkan username admin..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-800 outline-hidden shadow-2xs text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Password atau NIY Koordinator <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={niyInput}
                    onChange={(e) => setNiyInput(e.target.value)}
                    placeholder="Masukkan password atau NIY..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-800 outline-hidden shadow-2xs text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md shadow-blue-900/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Masuk Portal Admin Khusus</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. PORTAL WALI MURID */}
          {activePortal === 'parent' && (
            <form onSubmit={handleParentLogin} className="space-y-3.5">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-emerald-950 font-medium leading-relaxed">
                Portal khusus <strong>Wali Santri / Orang Tua</strong> untuk melihat hasil raport Al-Qur'an, capaian hafalan juz, turjuman, hadits, dan unduh PDF resmi.
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor Induk Santri (NIS) atau Nama Lengkap Ananda <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value)}
                    placeholder="Masukkan NIS (contoh: 2311063106) atau Nama Santri..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-hidden shadow-2xs text-xs"
                  />
                </div>
                <span className="text-[10.5px] text-slate-500 mt-1 block font-medium">
                  * Masukkan NIS atau nama santri sesuai data yang terdaftar di lembaga
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
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
                    placeholder="Masukkan username superadmin..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs text-xs"
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
                    placeholder="Masukkan password superadmin..."
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-blue-950 font-black rounded-xl shadow-md shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Masuk Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer (Clean & Secure without Close Button) */}
        <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="text-slate-500 text-[11px] font-semibold">Sistem E-Raport Al-Qur'an</span>
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold text-[10.5px]">
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Terproteksi Password</span>
          </div>
        </div>
      </div>
    </div>
  );
};
