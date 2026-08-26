import React, { useState } from 'react';
import { UserAccount, UserRole, ClassRoom } from '../types';
import { Storage } from '../utils/storage';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  CheckCircle2,
  KeyRound,
  IdCard,
  Copy,
  Check,
  Lock,
  Sparkles,
  Layers,
  Phone,
  Mail,
  UserPlus,
} from 'lucide-react';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  classes: ClassRoom[];
  currentUser: UserAccount;
  onUpdateUsers: (newUsers: UserAccount[]) => void;
  onSelectUser: (user: UserAccount) => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  users,
  classes,
  currentUser,
  onUpdateUsers,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'superadmin' | 'add'>('list');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Super Admin custom credential form
  const superAdminUser = users.find((u) => u.role === 'super_admin') || currentUser;
  const [superAdminForm, setSuperAdminForm] = useState({
    username: superAdminUser.username || 'superadmin',
    name: superAdminUser.name || 'Super Admin Utama',
    niy: superAdminUser.niy || 'NIY. 20240001',
    password: superAdminUser.password || 'admin',
    email: superAdminUser.email || '',
    phone: superAdminUser.phone || '',
  });

  // Add / Edit user form
  const [userForm, setUserForm] = useState<Partial<UserAccount>>({
    name: '',
    username: '',
    niy: '',
    role: 'teacher',
    password: '',
    assignedClassIds: [],
    email: '',
    phone: '',
    notes: '',
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToToastMessage(msg);
    setTimeout(() => setToToastMessage(null), 3000);
  };

  // Handle Save Super Admin Custom Credentials
  const handleSaveSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSuperAdmin: UserAccount = {
      ...superAdminUser,
      username: superAdminForm.username.trim(),
      name: superAdminForm.name.trim(),
      niy: superAdminForm.niy.trim(),
      password: superAdminForm.password,
      email: superAdminForm.email.trim(),
      phone: superAdminForm.phone.trim(),
      role: 'super_admin',
    };

    const newUsers = users.map((u) => (u.id === superAdminUser.id ? updatedSuperAdmin : u));
    if (!users.some((u) => u.id === superAdminUser.id)) {
      newUsers.push(updatedSuperAdmin);
    }

    Storage.saveUsers(newUsers);
    onUpdateUsers(newUsers);

    if (currentUser.role === 'super_admin' || currentUser.id === superAdminUser.id) {
      Storage.setCurrentUser(updatedSuperAdmin);
      onSelectUser(updatedSuperAdmin);
    }

    showToast('Kredensial Super Admin berhasil diperbarui!');
  };

  // Handle Add or Edit User
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name?.trim() || !userForm.username?.trim() || !userForm.niy?.trim()) {
      alert('Mohon lengkapi Nama, Username, dan NIY (Nomor Induk Yayasan).');
      return;
    }

    const cleanUsername = userForm.username.trim().toLowerCase().replace(/\s+/g, '.');
    const cleanNiy = userForm.niy.trim();

    if (editingUserId) {
      // Update existing user
      const newUsers = users.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              name: userForm.name!.trim(),
              username: cleanUsername,
              niy: cleanNiy,
              role: userForm.role || 'teacher',
              password: userForm.password || '',
              assignedClassIds: userForm.assignedClassIds || [],
              email: userForm.email?.trim() || '',
              phone: userForm.phone?.trim() || '',
              notes: userForm.notes?.trim() || '',
            }
          : u
      );
      Storage.saveUsers(newUsers);
      onUpdateUsers(newUsers);
      setEditingUserId(null);
      showToast('Data akun berhasil diperbarui!');
    } else {
      // Add new user
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: userForm.name.trim(),
        username: cleanUsername,
        niy: cleanNiy,
        role: userForm.role || 'teacher',
        password: userForm.password || 'guru',
        assignedClassIds: userForm.assignedClassIds || [],
        email: userForm.email?.trim() || '',
        phone: userForm.phone?.trim() || '',
        notes: userForm.notes?.trim() || '',
      };
      const newUsers = [...users, newUser];
      Storage.saveUsers(newUsers);
      onUpdateUsers(newUsers);
      showToast(`Akun ${newUser.name} berhasil ditambahkan!`);
    }

    // Reset Form
    setUserForm({
      name: '',
      username: '',
      niy: '',
      role: 'teacher',
      password: '',
      assignedClassIds: [],
      email: '',
      phone: '',
      notes: '',
    });
    setActiveTab('list');
  };

  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      username: user.username,
      niy: user.niy,
      role: user.role,
      password: user.password || '',
      assignedClassIds: user.assignedClassIds || [],
      email: user.email || '',
      phone: user.phone || '',
      notes: user.notes || '',
    });
    setActiveTab('add');
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (user.role === 'super_admin') {
      alert('Akun Super Admin utama tidak boleh dihapus.');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akun "${user.name}" (${user.username})?`)) {
      const newUsers = users.filter((u) => u.id !== user.id);
      Storage.saveUsers(newUsers);
      onUpdateUsers(newUsers);
      showToast(`Akun ${user.name} berhasil dihapus.`);
    }
  };

  const toggleAssignedClass = (classId: string) => {
    const current = userForm.assignedClassIds || [];
    if (current.includes(classId)) {
      setUserForm({ ...userForm, assignedClassIds: current.filter((id) => id !== classId) });
    } else {
      setUserForm({ ...userForm, assignedClassIds: [...current, classId] });
    }
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const text = `KREDENSIAL PORTAL E-RAPORT AL-QUR'AN\n--------------------------------\nNama: ${user.name}\nPeran: ${
      user.role === 'super_admin' ? 'Super Admin' : user.role === 'coordinator' ? 'Koordinator / Admin Khusus' : 'Guru Al-Qur\'an'
    }\nUsername: ${user.username}\nNIY (Nomor Induk Yayasan): ${user.niy}\nPassword/Kunci: ${user.password || '(Gunakan NIY)'}\nKelas Diampu: ${(user.assignedClassIds || [])
      .map((id) => classes.find((c) => c.id === id)?.name || id)
      .join(', ') || '-'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    showToast('Kredensial berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07193b]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-white text-slate-800 animate-in fade-in zoom-in duration-150 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#07193b] to-blue-900 text-amber-400 shadow-md">
              <IdCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-950 flex items-center gap-2">
                <span>Manajemen Pengguna & Portal NIY</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Atur akun Guru Khusus, Admin Khusus (Username & NIY), dan ubah kredensial Super Admin bebas
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100/90 rounded-2xl shrink-0">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditingUserId(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-700" />
            <span>Daftar Guru & Admin ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('superadmin');
              setEditingUserId(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'superadmin'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Kredensial Super Admin (Bebas)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('add');
              if (!editingUserId) {
                setUserForm({
                  name: '',
                  username: '',
                  niy: `NIY. ${new Date().getFullYear()}0${users.length + 1}`,
                  role: 'teacher',
                  password: 'guru',
                  assignedClassIds: [],
                  email: '',
                  phone: '',
                  notes: '',
                });
              }
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'add'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>{editingUserId ? 'Edit Akun' : '+ Tambah Akun'}</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* TAB 1: USER LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-blue-950 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Guru & Admin dapat masuk ke portal masing-masing menggunakan <strong>Nama / Username</strong> dan <strong>NIY (Nomor Induk Yayasan)</strong>.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('add');
                    setEditingUserId(null);
                  }}
                  className="shrink-0 bg-blue-900 hover:bg-blue-950 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map((u) => {
                  const assignedNames = (u.assignedClassIds || [])
                    .map((id) => classes.find((c) => c.id === id)?.name || id)
                    .join(', ');

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-2xl border transition-all relative ${
                        u.role === 'super_admin'
                          ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-300/80 shadow-xs'
                          : u.role === 'coordinator'
                          ? 'bg-gradient-to-br from-blue-500/10 via-slate-500/5 to-transparent border-blue-200 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                              u.role === 'super_admin'
                                ? 'bg-gradient-to-tr from-amber-600 to-yellow-500'
                                : u.role === 'coordinator'
                                ? 'bg-gradient-to-tr from-blue-900 to-indigo-700'
                                : 'bg-gradient-to-tr from-teal-700 to-emerald-600'
                            }`}
                          >
                            {u.role === 'super_admin' ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : u.role === 'coordinator' ? (
                              <KeyRound className="w-4 h-4" />
                            ) : (
                              <GraduationCap className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900 leading-tight flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {currentUser.id === u.id && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              @{u.username}
                            </div>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            u.role === 'super_admin'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : u.role === 'coordinator'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-teal-100 text-teal-900 border-teal-300'
                          }`}
                        >
                          {u.role === 'super_admin'
                            ? 'Super Admin'
                            : u.role === 'coordinator'
                            ? 'Admin Khusus'
                            : 'Guru Khusus'}
                        </span>
                      </div>

                      {/* NIY & Credentials Box */}
                      <div className="mt-3 bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">NIY (Yayasan):</span>
                          <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {u.niy || 'Belum disetel'}
                          </span>
                        </div>
                        {u.assignedClassIds && u.assignedClassIds.length > 0 && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500 font-medium">Halaqah / Kelas:</span>
                            <span className="font-bold text-blue-900 truncate max-w-[170px]" title={assignedNames}>
                              {assignedNames}
                            </span>
                          </div>
                        )}
                        {u.password && (
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                            <span className="text-slate-500 font-medium">Password/PIN:</span>
                            <span className="font-mono text-slate-700 font-semibold">{u.password}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleCopyCredentials(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                          title="Salin Kredensial Akun"
                        >
                          {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === u.id ? 'Tersalin!' : 'Salin Info'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Edit Akun"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SUPER ADMIN CUSTOM CREDENTIALS */}
          {activeTab === 'superadmin' && (
            <form onSubmit={handleSaveSuperAdmin} className="space-y-4">
              <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Kredensial Super Admin Bebas Disesuaikan</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Sebagai Super Admin, Anda memiliki hak penuh untuk mengubah <strong>Username</strong>, <strong>Nama Lengkap</strong>, <strong>NIY</strong>, dan <strong>Password</strong> akun Anda sendiri secara leluasa kapan pun tanpa batasan sistem.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Nama Lengkap Super Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminForm.name}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, name: e.target.value })}
                    placeholder="Contoh: Ustadz M. Irfan, M.Pd"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Username Super Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminForm.username}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, username: e.target.value })}
                    placeholder="Contoh: superadmin / irfan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Digunakan saat login di portal</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminForm.niy}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, niy: e.target.value })}
                    placeholder="Contoh: NIY. 20240001"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Password / PIN Kunci <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={superAdminForm.password}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, password: e.target.value })}
                    placeholder="Password baru bebas"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={superAdminForm.email}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, email: e.target.value })}
                    placeholder="admin@sekolah.sch.id"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP (Opsional)</label>
                  <input
                    type="text"
                    value={superAdminForm.phone}
                    onChange={(e) => setSuperAdminForm({ ...superAdminForm, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-blue-950 font-black rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Kredensial Super Admin</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADD / EDIT GURU & ADMIN */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {editingUserId ? 'Edit Akun Guru / Admin' : 'Tambah Akun Guru / Admin Baru'}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Cukup berikan Username, Nama, dan NIY (Nomor Induk Yayasan) agar guru/admin bisa login mandiri.
                  </p>
                </div>
                {editingUserId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId(null);
                      setActiveTab('list');
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Peran / Hak Akses Akun <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  >
                    <option value="teacher">Guru Al-Qur'an (Halaqah Khusus)</option>
                    <option value="coordinator">Koordinator / Admin Khusus</option>
                    <option value="super_admin">Super Admin (Akses Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Contoh: Ustadz M. Mujiono, S.Pd"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Username Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    placeholder="Contoh: mujiono / ustadz.ahmad"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                  <span className="text-[10.5px] text-slate-400">Huruf kecil tanpa spasi</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    NIY (Nomor Induk Yayasan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userForm.niy}
                    onChange={(e) => setUserForm({ ...userForm, niy: e.target.value })}
                    placeholder="Contoh: NIY. 20240201"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                  <span className="text-[10.5px] text-slate-400">Digunakan sebagai kunci otentikasi portal</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Default: gunakan NIY atau kosongkan"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              {/* Halaqah / Class Assignment (For Teachers) */}
              {userForm.role === 'teacher' && (
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-700" />
                      <span>Pilih Halaqah / Kelas yang Diampu:</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {(userForm.assignedClassIds || []).length} kelas dipilih
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {classes.map((cls) => {
                      const isSelected = (userForm.assignedClassIds || []).includes(cls.id);
                      return (
                        <button
                          type="button"
                          key={cls.id}
                          onClick={() => toggleAssignedClass(cls.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-900 text-white border-blue-900 font-bold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs truncate">{cls.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingUserId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUserId ? 'Simpan Perubahan' : 'Simpan Akun Baru'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            * Data pengguna tersimpan lokal dan otomatis sinkron dengan Google Sheets
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors ml-auto text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
