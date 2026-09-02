import React from 'react';
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
  Sparkles,
  Globe,
  Share2,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount;
  activeView: 'dashboard' | 'editor' | 'students' | 'classes' | 'parent';
  onNavigate: (view: 'dashboard' | 'editor' | 'students' | 'classes' | 'parent') => void;
  settings: SchoolSettings;
  users?: UserAccount[];
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBackupModal: () => void;
  onOpenGoogleDbModal?: () => void;
  onOpenUserManager?: () => void;
  onOpenSearchModal?: () => void;
  onOpenInteroperabilityModal?: () => void;
  onLogout?: () => void;
  isGoogleConnected?: boolean;
  googleDbState?: GoogleWorkspaceDatabaseState;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  settings,
  users = [],
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenBackupModal,
  onOpenGoogleDbModal,
  onOpenUserManager,
  onOpenSearchModal,
  onOpenInteroperabilityModal,
  onLogout,
  isGoogleConnected = false,
  googleDbState,
}) => {
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      onOpenAuthModal();
    }
  };

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCoordinator = currentUser.role === 'coordinator';

  return (
    <header className="bg-gradient-to-r from-[#07193b] via-[#0c245c] to-[#0b1c48] text-white sticky top-0 z-30 border-b border-white/15 shadow-xl shadow-blue-950/25">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-blue-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/25 border border-amber-200/50 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-xs sm:text-sm lg:text-base tracking-tight bg-gradient-to-r from-white via-blue-50 to-blue-100 bg-clip-text text-transparent truncate">
                  E-Raport Al-Qur'an
                </span>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase shadow-xs tracking-wider shrink-0">
                  UMMI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-200/80 hidden md:flex items-center gap-1.5 truncate max-w-[220px] lg:max-w-none">
                <span className="font-medium truncate">{settings.schoolName || 'Lembaga Pendidikan Al-Qur’an'}</span>
                <span className="opacity-40">•</span>
                <span className="shrink-0">Smst. {settings.semester} TP {settings.academicYear}</span>
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/25 backdrop-blur-xl p-1 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
            {(isSuperAdmin || isCoordinator) && (
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
                <span>Dashboard</span>
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

            {isSuperAdmin && (
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

          {/* Right: Search & User Profile & Logout Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Universal Search Quick Button */}
            {onOpenSearchModal && (
              <button
                id="btn-navbar-quick-search"
                onClick={onOpenSearchModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Pencarian Cepat Semua Data Santri & Raport"
              >
                <Search className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Cari Data</span>
              </button>
            )}

            {/* User Profile Badge (Clickable) */}
            <button
              id="btn-user-role-badge"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/40 px-2.5 py-1.5 rounded-xl sm:rounded-2xl transition-all text-left backdrop-blur-xl group shadow-xs active:scale-95 cursor-pointer"
              title="Profil Pengguna & Ganti Akun"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-blue-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-400/20 shrink-0">
                {isSuperAdmin ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : currentUser.role === 'parent' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight text-white group-hover:text-amber-200 transition-colors truncate max-w-[100px] md:max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] md:text-[10px] text-amber-300/90 font-extrabold tracking-wider flex items-center gap-1">
                  <span className="uppercase">
                    {isSuperAdmin
                      ? 'Super Admin'
                      : isCoordinator
                      ? 'Admin Khusus'
                      : currentUser.role === 'parent'
                      ? 'Wali Santri'
                      : 'Guru Khusus'}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Keluar / Buka Portal Login"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Super Admin Dedicated Action Sub-Bar (Moved down so it NEVER gets cut off or clipped) */}
        {isSuperAdmin && (
          <div className="py-2.5 border-t border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0 text-amber-300/90 text-xs font-bold mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Panel Super Admin:</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenInteroperabilityModal && (
                <button
                  id="subnav-superadmin-open-data"
                  onClick={onOpenInteroperabilityModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-cyan-100 bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400/40 text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                  title="Pusat Integrasi & Keterbacaan Data di Sistem Lain (EMIS, Dapodik, SEO, JSON API)"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>Integrasi & Open Data</span>
                  <span className="bg-cyan-400 text-blue-950 text-[9px] font-black px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                    API / SEO
                  </span>
                </button>
              )}

              {onOpenUserManager && (
                <button
                  id="subnav-superadmin-user-manager"
                  onClick={onOpenUserManager}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-100 bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/40 text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                  title="Kelola Akun Guru, Admin Khusus (NIY), dan Kredensial Super Admin"
                >
                  <IdCard className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Kelola Akun & NIY</span>
                  {users.length > 0 && (
                    <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                      {users.length}
                    </span>
                  )}
                </button>
              )}

              {onOpenGoogleDbModal && (
                <button
                  id="subnav-google-database"
                  onClick={onOpenGoogleDbModal}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer ${
                    googleDbState?.isMigrated && isGoogleConnected
                      ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/35'
                      : isGoogleConnected
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 hover:bg-amber-500/35 animate-pulse'
                      : 'bg-white/10 text-blue-100 hover:text-white hover:bg-white/20 border border-white/20'
                  }`}
                  title="Database Cloud Google Sheets & Google Drive"
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
                  <span>
                    {googleDbState?.isMigrated && isGoogleConnected
                      ? 'Google Sheets DB (Tersinkron)'
                      : isGoogleConnected
                      ? 'Google Drive (Migrasi DB)'
                      : 'Google DB & Sheets'}
                  </span>
                </button>
              )}

              <button
                id="subnav-quick-settings"
                onClick={onOpenSettingsModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                title="Pengaturan Lembaga & Raport"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>

              <button
                id="subnav-quick-backup"
                onClick={onOpenBackupModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                title="Backup & Restore Data JSON"
              >
                <Database className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="hidden sm:inline">Backup Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile / Tablet Navigation bar (Bottom tabs) */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 text-xs font-semibold gap-1">
          {(isSuperAdmin || isCoordinator) && (
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

          {isSuperAdmin && (
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

