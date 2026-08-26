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
  Settings,
  Database,
  Sparkles,
  CheckCircle2,
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
  isGoogleConnected = false,
  googleDbState,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#07193b]/90 via-[#0c245c]/85 to-[#0b1c48]/90 backdrop-blur-2xl text-white sticky top-0 z-30 border-b border-white/15 shadow-xl shadow-blue-950/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-blue-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/25 border border-amber-200/50">
              <BookOpen className="w-5 h-5 text-blue-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-blue-50 to-blue-100 bg-clip-text text-transparent">
                  E-Raport Al-Qur'an
                </span>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs tracking-wider">
                  UMMI & Tahfidz
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 hidden sm:flex items-center gap-1.5">
                <span className="font-medium">{settings.schoolName || 'Lembaga Pendidikan Al-Qur’an'}</span>
                <span className="opacity-40">•</span>
                <span>Smst. {settings.semester} TP {settings.academicYear}</span>
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Desktop Glass Bar) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-black/25 backdrop-blur-xl p-1.5 rounded-2xl border border-white/15 text-xs font-semibold shadow-inner">
            {currentUser.role === 'super_admin' && (
              <button
                id="nav-dashboard"
                onClick={() => onNavigate('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}

            <button
              id="nav-editor"
              onClick={() => onNavigate('editor')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                activeView === 'editor'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Input Nilai Raport</span>
            </button>

            {currentUser.role === 'super_admin' && (
              <>
                <button
                  id="nav-students"
                  onClick={() => onNavigate('students')}
                  className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    activeView === 'students'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Data Santri</span>
                </button>

                <button
                  id="nav-classes"
                  onClick={() => onNavigate('classes')}
                  className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                    activeView === 'classes'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Data Kelas</span>
                </button>
              </>
            )}

            <button
              id="nav-parent"
              onClick={() => onNavigate('parent')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all duration-200 ${
                activeView === 'parent'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-blue-950 font-bold shadow-md shadow-amber-400/25 scale-[1.02]'
                  : 'text-blue-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Portal Wali Santri</span>
            </button>
          </nav>

          {/* Right: Quick Tools & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Quick Settings & Backup buttons for Super Admin */}
            {currentUser.role === 'super_admin' && (
              <div className="hidden sm:flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
                {onOpenGoogleDbModal && (
                  <button
                    id="nav-google-database"
                    onClick={onOpenGoogleDbModal}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
                      googleDbState?.isMigrated && isGoogleConnected
                        ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/35'
                        : isGoogleConnected
                        ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 hover:bg-amber-500/35 animate-pulse'
                        : 'bg-white/10 text-blue-100 hover:text-white hover:bg-white/20 border border-white/20'
                    }`}
                    title="Database Google Spreadsheets & Google Drive"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        googleDbState?.isMigrated && isGoogleConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isGoogleConnected
                          ? 'bg-amber-400 animate-bounce'
                          : 'bg-slate-400'
                      }`}
                    />
                    <Database className="w-3.5 h-3.5" />
                    <span className="hidden md:inline font-bold">
                      {googleDbState?.isMigrated && isGoogleConnected
                        ? 'Google Sheets DB'
                        : isGoogleConnected
                        ? 'Migrasi Database'
                        : 'Google DB'}
                    </span>
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

            {/* Offline Status Badge */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/70 border border-amber-400/30 text-amber-300 rounded-xl text-[11px] font-semibold backdrop-blur-md shadow-inner"
              title="Aplikasi dapat beroperasi 100% offline tanpa internet"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Offline Ready</span>
            </div>

            {/* Role / User Button */}
            <button
              id="btn-user-role-badge"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/40 px-3 py-1.5 rounded-2xl transition-all text-left backdrop-blur-xl group shadow-sm active:scale-95"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-blue-950 flex items-center justify-center font-bold text-xs shadow-md shadow-amber-400/20 group-hover:rotate-6 transition-transform">
                {currentUser.role === 'super_admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : currentUser.role === 'parent' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight text-white group-hover:text-amber-200 transition-colors truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-300/90 uppercase font-extrabold tracking-wider">
                  {currentUser.role === 'super_admin'
                    ? 'Koordinator'
                    : currentUser.role === 'parent'
                    ? 'Wali Santri'
                    : 'Guru Pengajar'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-white/10 text-xs font-semibold gap-1">
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
            <span className="text-[10px]">Wali</span>
          </button>
        </div>
      </div>
    </header>
  );
};
