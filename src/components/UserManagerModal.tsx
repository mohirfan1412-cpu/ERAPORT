import React, { useState, useRef } from 'react';
import { UserAccount, UserRole, ClassRoom } from '../types';
import { Storage } from '../utils/storage';
import { downloadUserImportTemplate, parseUsersFromExcel } from '../utils/exportUtils';
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
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  FileCheck,
  RefreshCw,
  HelpCircle,
  ArrowRight,
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
  const [activeTab, setActiveTab] = useState<'list' | 'superadmin' | 'add' | 'import'>('list');
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

  // Import Excel state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<
    Array<{
      name: string;
      username: string;
      niy: string;
      role: 'super_admin' | 'coordinator' | 'teacher';
      password?: string;
      assignedClassIds?: string[];
      assignedClassNames?: string[];
      phone?: string;
      email?: string;
      notes?: string;
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

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToToastMessage(msg);
    setTimeout(() => setToToastMessage(null), 3500);
  };

  const handleDownloadTemplate = () => {
    try {
      downloadUserImportTemplate(classes);
      showToast('Template Excel Pengguna berhasil diunduh!');
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
      const res = await parseUsersFromExcel(file, classes);
      setImportPreviewData(res.parsedUsers);
      setImportSummary({
        total: res.totalRows,
        valid: res.validCount,
        invalid: res.invalidCount,
      });
      if (res.totalRows === 0) {
        showToast('Tidak ada baris data pengguna yang terdeteksi di file.');
      } else {
        showToast(`Berhasil membaca ${res.totalRows} baris (${res.validCount} valid).`);
      }
    } catch (err: any) {
      alert(err?.message || 'Gagal membaca berkas Excel.');
      setImportPreviewData([]);
      setImportSummary({ total: 0, valid: 0, invalid: 0 });
    } finally {
      setIsProcessingFile(false);
      // Reset input agar bisa re-upload file yang sama jika diedit
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = () => {
    const validUsersToImport = importPreviewData.filter((u) => u.isValid);
    if (validUsersToImport.length === 0) {
      alert('Tidak ada data pengguna yang valid untuk diimpor.');
      return;
    }

    let updatedUsers = [...users];
    let addedCount = 0;
    let updatedCount = 0;

    validUsersToImport.forEach((imported) => {
      const existingIndex = updatedUsers.findIndex(
        (u) =>
          u.username.toLowerCase() === imported.username.toLowerCase() ||
          u.niy.toLowerCase() === imported.niy.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Jangan timpa role Super Admin aktif menjadi guru biasa kecuali akun yang memang diimpor
        const existing = updatedUsers[existingIndex];
        if (mergeStrategy === 'update') {
          updatedUsers[existingIndex] = {
            ...existing,
            name: imported.name,
            username: imported.username,
            niy: imported.niy,
            role: imported.role,
            password: imported.password || existing.password || 'guru',
            assignedClassIds:
              imported.assignedClassIds && imported.assignedClassIds.length > 0
                ? imported.assignedClassIds
                : existing.assignedClassIds || [],
            phone: imported.phone || existing.phone || '',
            email: imported.email || existing.email || '',
            notes: imported.notes || existing.notes || '',
          };
          updatedCount++;
        }
      } else {
        // Tambah Akun Baru
        const newUser: UserAccount = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: imported.name,
          username: imported.username,
          niy: imported.niy,
          role: imported.role,
          password: imported.password || 'guru',
          assignedClassIds: imported.assignedClassIds || [],
          phone: imported.phone || '',
          email: imported.email || '',
          notes: imported.notes || '',
        };
        updatedUsers.push(newUser);
        addedCount++;
      }
    });

    // Simpan ke Storage & Sync
    Storage.saveUsers(updatedUsers);
    onUpdateUsers(updatedUsers);

    // Reset preview
    setImportPreviewData([]);
    setSelectedFileName(null);
    setImportSummary({ total: 0, valid: 0, invalid: 0 });
    setActiveTab('list');

    showToast(
      `Sukses mengimpor pengguna! (+${addedCount} akun baru, ${updatedCount} diperbarui)`
    );
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
        <div className="flex items-center gap-1.5 sm:gap-2 mt-4 p-1 bg-slate-100/90 rounded-2xl shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditingUserId(null);
            }}
            className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'list'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Daftar User ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setEditingUserId(null);
            }}
            className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'import'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/60 font-black'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold border border-emerald-300">
              Bulk
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('superadmin');
              setEditingUserId(null);
            }}
            className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'superadmin'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Super Admin</span>
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
            className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'add'
                ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>{editingUserId ? 'Edit Akun' : '+ Tambah'}</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl p-3">
                <div className="flex items-center gap-2 text-blue-950 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    Masuk ke portal menggunakan <strong>Username</strong> dan <strong>NIY</strong>.
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  <button
                    onClick={handleDownloadTemplate}
                    className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs text-[11.5px]"
                    title="Unduh format template Excel untuk tambah banyak user"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Template Excel</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('import')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs text-[11.5px]"
                    title="Upload file Excel untuk import akun massal"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('add');
                      setEditingUserId(null);
                    }}
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs text-[11.5px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
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

          {/* TAB 4: IMPORT EXCEL MASSAL */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Step 1 & 2 Instructions Banner */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300/80 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                      <span>Tambah Pengguna Massal via Berkas Excel (.xlsx)</span>
                    </h4>
                    <p className="text-slate-600 text-[11.5px] mt-1 leading-relaxed">
                      Tambahkan puluhan akun Guru Al-Qur'an, Koordinator/Admin, dan Super Admin sekaligus dalam hitungan detik menggunakan format spreadsheet resmi.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Template Excel</span>
                  </button>
                </div>

                {/* Workflow steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-emerald-950 block">Unduh Template</strong>
                      <span className="text-slate-500">Klik tombol download template di atas untuk format baku.</span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-emerald-950 block">Isi Data Pengguna</strong>
                      <span className="text-slate-500">Isi Nama, Username, NIY, Peran (guru/admin), & kelas diampu.</span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-emerald-950 block">Upload & Simpan</strong>
                      <span className="text-slate-500">Unggah file di bawah, periksa pratinjau, lalu simpan.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone / Picker */}
              <div className="bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl p-5 text-center transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="hidden"
                  id="excel-user-file-input"
                />

                <div className="max-w-md mx-auto space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div>
                    <label
                      htmlFor="excel-user-file-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-xl transition-all shadow-2xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{selectedFileName ? 'Pilih Berkas Lain...' : 'Pilih Berkas Excel (.xlsx / .xls)'}</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {selectedFileName ? (
                      <span className="font-semibold text-emerald-900">
                        Berkas aktif: <strong className="font-mono">{selectedFileName}</strong>
                      </span>
                    ) : (
                      'Format yang didukung: .xlsx atau .xls (Microsoft Excel / Google Sheets / LibreOffice)'
                    )}
                  </p>
                </div>
              </div>

              {/* Import Preview Section */}
              {isProcessingFile && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Membaca dan memvalidasi struktur berkas Excel...</p>
                </div>
              )}

              {importPreviewData.length > 0 && (
                <div className="space-y-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  {/* Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs font-bold">
                        Total: <strong>{importSummary.total}</strong> Baris
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Valid: <strong>{importSummary.valid}</strong></span>
                      </div>
                      {importSummary.invalid > 0 && (
                        <div className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Kurang Lengkap: <strong>{importSummary.invalid}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Merge strategy */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600">Jika akun sudah ada:</span>
                      <select
                        value={mergeStrategy}
                        onChange={(e) => setMergeStrategy(e.target.value as 'update' | 'skip')}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 outline-hidden"
                      >
                        <option value="update">Perbarui Data (Update)</option>
                        <option value="skip">Lewati (Pertahankan Lama)</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="overflow-x-auto max-h-[300px] border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px] text-slate-700">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-900 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-2 text-center w-8">No</th>
                          <th className="py-2 px-3">Nama Lengkap</th>
                          <th className="py-2 px-2">Username</th>
                          <th className="py-2 px-2">NIY</th>
                          <th className="py-2 px-2 text-center">Peran</th>
                          <th className="py-2 px-2">Kelas Diampu</th>
                          <th className="py-2 px-2">Password</th>
                          <th className="py-2 px-2">WhatsApp</th>
                          <th className="py-2 px-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreviewData.map((row, idx) => {
                          const isDuplicate = users.some(
                            (u) =>
                              u.username.toLowerCase() === row.username.toLowerCase() ||
                              u.niy.toLowerCase() === row.niy.toLowerCase()
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
                              <td className="py-2 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-950">
                                <div>{row.name || <span className="text-rose-500 italic">(Kosong)</span>}</div>
                                {row.notes && <div className="text-[9.5px] text-slate-400 font-normal">{row.notes}</div>}
                              </td>
                              <td className="py-2 px-2 font-mono text-blue-900 font-semibold">
                                {row.username || <span className="text-rose-500 italic">(Kosong)</span>}
                              </td>
                              <td className="py-2 px-2 font-mono text-slate-800">
                                {row.niy || <span className="text-rose-500 italic">(Kosong)</span>}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span
                                  className={`text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${
                                    row.role === 'super_admin'
                                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                                      : row.role === 'coordinator'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : 'bg-teal-100 text-teal-900 border-teal-300'
                                  }`}
                                >
                                  {row.role === 'super_admin' ? 'Super Admin' : row.role === 'coordinator' ? 'Koordinator' : 'Guru'}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                {row.assignedClassNames && row.assignedClassNames.length > 0 ? (
                                  <span className="text-[10px] text-slate-700 font-medium">
                                    {row.assignedClassNames.join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">-</span>
                                )}
                              </td>
                              <td className="py-2 px-2 font-mono text-slate-500 text-[10.5px]">
                                {row.password || '(Default NIY)'}
                              </td>
                              <td className="py-2 px-2 font-mono text-slate-600 text-[10px]">
                                {row.phone || '-'}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {row.isValid ? (
                                  isDuplicate ? (
                                    <span className="text-[9.5px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full border border-amber-300">
                                      {mergeStrategy === 'update' ? 'Update Akun' : 'Lewati (Ada)'}
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-full border border-emerald-300">
                                      Siap Tambah
                                    </span>
                                  )
                                ) : (
                                  <span
                                    className="text-[9.5px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full border border-rose-300 cursor-help"
                                    title={row.errorReason}
                                  >
                                    {row.errorReason || 'Tidak Valid'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500 font-medium">
                      * Data yang valid akan otomatis disimpan ke sistem & disinkronkan ke cloud.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setImportPreviewData([]);
                          setSelectedFileName(null);
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        disabled={importSummary.valid === 0}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan {importSummary.valid} Pengguna ke Sistem</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
