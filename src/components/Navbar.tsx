import React, { useState } from 'react';
import { UserAccount, SchoolSettings, GoogleWorkspaceDatabaseState } from '../types';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  ShieldCheck,
  GraduationCap,
  Search,
  IdCard,
  Settings,
  Database,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  activeView: 'dashboard' | 'editor' | 'students' | 'classes' | 'parent';
  onNavigate: (view: 'dashboard' | 'editor' | 'students' | 'classes' | 'parent') => void;
  settings: SchoolSettings;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBackupModal: () => void;
  onOpenGoogleDbModal?: () => void;
  onOpenUserManager?: () => void;
  onLogout?: () => void;
  isGoogleConnected?: boolean;
  googleDbState?: GoogleWorkspaceDatabaseState;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  settings,
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenBackupModal,
  onOpenGoogleDbModal,
  onOpenUserManager,
  onLogout,
  isGoogleConnected = false,
  googleDbState,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      onOpenAuthModal();
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#07193b] via-[#0c245c] to-[#0b1c48] text-white sticky top-0 z-30 border-b border-white/15 shadow-xl shadow-blue-950/25">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between min-h-[60px] sm:h-16 py-2 sm:py-0 gap-2 sm:gap-4">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-blue-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/25 border border-amber-200/50">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-sm lg:text-base tracking-tight bg-gradient-to-r from-white via-blue-50 to-blue-100 bg-clip-text text-transparent">
                  E-Raport Al-Qur'an
                </span>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase shadow-xs tracking-wider shrink-0">
                  UMMI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-200/80 hidden md:flex items-center gap-1.5 truncate max-w-[240px] lg:max-w-none">
                <span className="font-medium truncate">{settings.schoolName || 'Lembaga Pendidikan Al-Qur’an'}</span>
                <span className="opacity-40">•</span>
                <span className="shrink-0">Smst. {settings.semester} TP {settings.academicYear}</span>
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/25 backdrop-blur-xl p-1 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
            {currentUser.role === 'super_admin' && (
              <button
                id="nav-dashboard"
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                }`}
                title="Dashboard Koordinator"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
            )}

            <button
              id="nav-editor"
              onClick={() => onNavigate('editor')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                activeView === 'editor'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/10'
              }`}
              title="Input Nilai Raport Santri"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Input Nilai</span>
            </button>

            {currentUser.role === 'super_admin' && (
              <>
                <button
                  id="nav-students"
                  onClick={() => onNavigate('students')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                    activeView === 'students'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Manajemen Data Santri"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Santri</span>
                </button>

                <button
                  id="nav-classes"
                  onClick={() => onNavigate('classes')}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                    activeView === 'classes'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Manajemen Data Kelas"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kelas</span>
                </button>
              </>
            )}

            <button
              id="nav-parent"
              onClick={() => onNavigate('parent')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                activeView === 'parent'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/10'
              }`}
              title="Portal Cek Nilai Wali Santri"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Wali Santri</span>
            </button>
          </nav>

          {/* Right: Quick Tools, Role Button, & Logout Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Tools for Super Admin (Desktop/Tablet) */}
            {currentUser.role === 'super_admin' && (
              <div className="hidden sm:flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
                {onOpenGoogleDbModal && (
                  <button
                    id="nav-google-database"
                    onClick={onOpenGoogleDbModal}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      googleDbState?.isMigrated && isGoogleConnected
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/35'
                        : isGoogleConnected
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 hover:bg-amber-500/35 animate-pulse'
                        : 'bg-white/10 text-blue-100 hover:text-white hover:bg-white/20 border border-white/20'
                    }`}
                    title="Database Google Sheets & Google Drive"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        googleDbState?.isMigrated && isGoogleConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isGoogleConnected
                          ? 'bg-amber-400 animate-bounce'
                          : 'bg-slate-400'
                      }`}
                    />
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden xl:inline font-bold">
                      {googleDbState?.isMigrated && isGoogleConnected ? 'Sheets DB' : 'Google DB'}
                    </span>
                  </button>
                )}

                {onOpenUserManager && (
                  <button
                    id="nav-superadmin-user-manager"
                    onClick={onOpenUserManager}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold transition-all shadow-xs active:scale-95"
                    title="Manajemen Akun Guru, Admin Khusus (NIY), dan Kredensial Super Admin"
                  >
                    <IdCard className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden xl:inline">Kelola Akun</span>
                  </button>
                )}

                <button
                  id="nav-quick-settings"
                  onClick={onOpenSettingsModal}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-amber-300 hover:bg-white/10 transition-all"
                  title="Pengaturan Lembaga & Raport"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  id="nav-quick-backup"
                  onClick={onOpenBackupModal}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-amber-300 hover:bg-white/10 transition-all"
                  title="Backup & Restore Data"
                >
                  <Database className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* User Profile Badge (Clickable to view/switch profile) */}
            <button
              id="btn-user-role-badge"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/40 px-2 sm:px-2.5 py-1.5 rounded-xl sm:rounded-2xl transition-all text-left backdrop-blur-xl group shadow-sm active:scale-95"
              title="Profil Pengguna & Portal Masuk"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-blue-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-400/20 shrink-0">
                {currentUser.role === 'super_admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : currentUser.role === 'parent' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight text-white group-hover:text-amber-200 transition-colors truncate max-w-[90px] md:max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] md:text-[10px] text-amber-300/90 font-extrabold tracking-wider flex items-center gap-1">
                  <span className="uppercase">
                    {currentUser.role === 'super_admin'
                      ? 'Super Admin'
                      : currentUser.role === 'coordinator'
                      ? 'Admin'
                      : currentUser.role === 'parent'
                      ? 'Wali'
                      : 'Guru'}
                  </span>
                  {currentUser.niy && currentUser.niy !== '-' && (
                    <span className="opacity-75 font-mono text-[9px] hidden lg:inline">({currentUser.niy})</span>
                  )}
                </div>
              </div>
            </button>

            {/* Logout / Keluar Button */}
            <button
              id="btn-navbar-logout"
              onClick={handleLogoutClick}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-bold transition-all shadow-xs active:scale-95"
              title="Keluar / Ganti Akun & Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Tools Menu Toggle */}
            {currentUser.role === 'super_admin' && (
              <button
                id="btn-mobile-tools-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 transition-colors"
                title="Buka Menu Pengaturan & Alat"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Tools for Super Admin */}
        {mobileMenuOpen && currentUser.role === 'super_admin' && (
          <div className="sm:hidden py-2.5 px-2 mb-2 bg-black/40 rounded-2xl border border-white/20 space-y-1.5 animate-in fade-in slide-in-from-top-2 text-xs">
            <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider px-2 pt-1 pb-0.5">
              Alat Super Admin
            </div>
            {onOpenUserManager && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserManager();
                }}
                className="w-full text-left flex items-center gap-2 p-2 rounded-xl bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30"
              >
                <IdCard className="w-4 h-4 text-amber-300" />
                <span>Kelola Akun Guru & NIY</span>
              </button>
            )}
            {onOpenGoogleDbModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenGoogleDbModal();
                }}
                className="w-full text-left flex items-center gap-2 p-2 rounded-xl bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-400/30"
              >
                <Database className="w-4 h-4 text-emerald-300" />
                <span>Google Drive & Sheets DB</span>
              </button>
            )}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettingsModal();
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300" />
                <span>Pengaturan</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBackupModal();
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span>Backup Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile / Tablet Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 text-xs font-semibold gap-1">
          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeView === 'dashboard'
                  ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                  : 'text-blue-100/70 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-[10px]">Dashboard</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('editor')}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeView === 'editor'
                ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-blue-100/70 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Input Nilai</span>
          </button>

          {currentUser.role === 'super_admin' && (
            <>
              <button
                onClick={() => onNavigate('students')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeView === 'students'
                    ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-blue-100/70 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px]">Santri</span>
              </button>

              <button
                onClick={() => onNavigate('classes')}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeView === 'classes'
                    ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-blue-100/70 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-[10px]">Kelas</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate('parent')}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeView === 'parent'
                ? 'bg-amber-400 text-blue-950 font-bold shadow-md shadow-amber-400/20'
                : 'text-blue-100/70 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px]">Wali Santri</span>
          </button>
        </div>
      </div>
    </header>
  );
};
