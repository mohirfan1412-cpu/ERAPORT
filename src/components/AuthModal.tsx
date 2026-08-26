import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Storage, DEFAULT_USERS } from '../utils/storage';
import { ShieldCheck, UserCheck, GraduationCap, Users, X, KeyRound, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  onSelectUser: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [emailInput, setEmailInput] = useState<string>(currentUser.email);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleQuickSwitch = (u: UserAccount) => {
    onSelectUser(u);
    Storage.setCurrentUser(u);
    onClose();
  };

  const handleParentLogin = () => {
    const parentUser: UserAccount = {
      id: 'user-parent',
      name: 'Wali Santri / Orang Tua',
      email: 'walisantri@ortu.com',
      role: 'parent',
    };
    onSelectUser(parentUser);
    Storage.setCurrentUser(parentUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white text-slate-800 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-base text-emerald-950">Ganti Akun & Hak Akses</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-500 font-medium">
            Pilih peran pengguna untuk menguji hak akses otentikasi:
          </p>

          {/* Quick Account Switcher Buttons */}
          <div className="space-y-2.5">
            {/* Super Admin / Koordinator */}
            <button
              onClick={() => handleQuickSwitch(users.find((u) => u.role === 'super_admin') || DEFAULT_USERS[0])}
              className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all shadow-xs ${
                currentUser.role === 'super_admin'
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30'
                  : 'border-emerald-100/80 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-xs">Koordinator / Super Admin</div>
                  <div className="text-[11px] text-slate-500">Akses penuh: Pantau real-time semua kelas & backup</div>
                </div>
              </div>
              {currentUser.role === 'super_admin' && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Aktif
                </span>
              )}
            </button>

            {/* Guru Pengajar UMMI */}
            {users
              .filter((u) => u.role === 'teacher')
              .map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => handleQuickSwitch(teacher)}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all shadow-xs ${
                    currentUser.id === teacher.id
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/30'
                      : 'border-emerald-100/80 bg-white/70 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-xs">Guru: {teacher.name}</div>
                      <div className="text-[11px] text-slate-500">Input nilai, capaian hafalan & cetak raport</div>
                    </div>
                  </div>
                  {currentUser.id === teacher.id && (
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Aktif
                    </span>
                  )}
                </button>
              ))}

            {/* Wali Santri / Orang Tua Portal */}
            <button
              onClick={handleParentLogin}
              className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all shadow-xs ${
                currentUser.role === 'parent'
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30'
                  : 'border-emerald-100/80 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-xs">Wali Santri / Orang Tua</div>
                  <div className="text-[11px] text-slate-500">Portal publik: Cek & unduh raport Ananda via NIS</div>
                </div>
              </div>
              {currentUser.role === 'parent' && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Aktif
                </span>
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-emerald-900/10 flex justify-end">
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
