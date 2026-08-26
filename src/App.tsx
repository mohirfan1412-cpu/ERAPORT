import React, { useState, useEffect } from 'react';
import { UserAccount, Student, ClassRoom, StudentReport, SchoolSettings, GoogleUserProfile, GoogleWorkspaceDatabaseState } from './types';
import { Storage } from './utils/storage';
import { Navbar } from './components/Navbar';
import { CoordinatorDashboard } from './components/CoordinatorDashboard';
import { ReportCardEditor } from './components/ReportCardEditor';
import { StudentManager } from './components/StudentManager';
import { ClassManager } from './components/ClassManager';
import { ParentPortal } from './components/ParentPortal';
import { SettingsModal } from './components/SettingsModal';
import { BackupModal } from './components/BackupModal';
import { AuthModal } from './components/AuthModal';
import { GoogleDatabaseModal } from './components/GoogleDatabaseModal';
import { getSavedGoogleDatabaseState, initGoogleAuth, getCachedAccessToken, triggerAutoSyncToGoogleSheets } from './utils/googleWorkspace';
import { CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => Storage.getCurrentUser());
  const [settings, setSettings] = useState<SchoolSettings>(() => Storage.getSettings());
  const [users, setUsers] = useState<UserAccount[]>(() => Storage.getUsers());
  const [classes, setClasses] = useState<ClassRoom[]>(() => Storage.getClasses());
  const [students, setStudents] = useState<Student[]>(() => Storage.getStudents());
  const [reports, setReports] = useState<StudentReport[]>(() => Storage.getReports());

  // Google Workspace & Sheets Database State
  const [googleProfile, setGoogleProfile] = useState<GoogleUserProfile | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(() => getCachedAccessToken());
  const [googleDbState, setGoogleDbState] = useState<GoogleWorkspaceDatabaseState>(() =>
    getSavedGoogleDatabaseState()
  );
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Navigation View State
  const [activeView, setActiveView] = useState<'dashboard' | 'editor' | 'students' | 'classes' | 'parent'>(() => {
    const user = Storage.getCurrentUser();
    if (user.role === 'parent') return 'parent';
    if (user.role === 'teacher') return 'editor';
    return 'dashboard';
  });

  // Active student for editor
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const st = Storage.getStudents();
    return st[0]?.id || '';
  });

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGoogleDbOpen, setIsGoogleDbOpen] = useState(false);

  // Initialize Google Auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (profile, token) => {
        setGoogleProfile(profile);
        setGoogleToken(token);
        setGoogleDbState((prev) => ({ ...prev, isConnected: true }));
      },
      () => {
        setGoogleProfile(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper to trigger background auto-sync to Google Sheets
  const triggerSync = (
    customStudents?: Student[],
    customClasses?: ClassRoom[],
    customReports?: StudentReport[],
    customSettings?: SchoolSettings,
    customUsers?: UserAccount[]
  ) => {
    if (googleToken && googleDbState.spreadsheetId && googleDbState.autoSyncEnabled !== false) {
      triggerAutoSyncToGoogleSheets(
        googleToken,
        googleDbState.spreadsheetId,
        {
          students: customStudents || students,
          classes: customClasses || classes,
          reports: customReports || reports,
          settings: customSettings || settings,
          users: customUsers || users,
        },
        (syncedAt) => {
          setGoogleDbState((prev) => ({ ...prev, lastSyncedAt: syncedAt }));
          setSyncToast(`Data tersinkronisasi otomatis ke Google Sheets (${new Date(syncedAt).toLocaleTimeString('id-ID')})`);
          setTimeout(() => setSyncToast(null), 3500);
        }
      );
    }
  };

  // Sync state if currentUser changes
  const handleSelectUser = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'parent') {
      setActiveView('parent');
    } else if (user.role === 'teacher') {
      setActiveView('editor');
    } else {
      setActiveView('dashboard');
    }
  };

  // Reload data after backup or Google Sheets sync
  const handleDataRestored = () => {
    setSettings(Storage.getSettings());
    setUsers(Storage.getUsers());
    setClasses(Storage.getClasses());
    const reloadedStudents = Storage.getStudents();
    setStudents(reloadedStudents);
    setReports(Storage.getReports());
    if (reloadedStudents.length > 0) {
      setSelectedStudentId(reloadedStudents[0].id);
    }
  };

  // Save report
  const handleSaveReport = (updatedReport: StudentReport) => {
    Storage.saveOrUpdateReport(updatedReport);
    const updatedReports = Storage.getReports();
    setReports(updatedReports);
    triggerSync(undefined, undefined, updatedReports);
  };

  // Update students
  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    triggerSync(newStudents);
  };

  // Update classes
  const handleUpdateClasses = (newClasses: ClassRoom[]) => {
    setClasses(newClasses);
    triggerSync(undefined, newClasses);
  };

  // Update settings
  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    triggerSync(undefined, undefined, undefined, newSettings);
  };

  // Handle open editor for specific student
  const handleOpenStudentEditor = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('editor');
  };

  // Selected student & report
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const activeClass = activeStudent ? classes.find((c) => c.id === activeStudent.classId) : undefined;
  let activeReport = activeStudent ? reports.find((r) => r.studentId === activeStudent.id) : undefined;

  // Create temporary report if not exists yet
  if (activeStudent && !activeReport) {
    activeReport = Storage.createEmptyReportForStudent(activeStudent, activeClass, settings);
  }

  return (
    <div className="min-h-screen bg-[#f1f5fb] flex flex-col font-sans relative overflow-x-hidden text-slate-800" style={{ background: 'radial-gradient(at 0% 0%, #e0eaff 0%, #f1f5fb 50%, #fef3c7 100%)' }}>
      {/* Ambient background glows */}
      <div className="fixed top-8 left-10 w-[420px] h-[420px] bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[460px] h-[460px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/4 w-[380px] h-[380px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={setActiveView}
        settings={settings}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenBackupModal={() => setIsBackupOpen(true)}
        onOpenGoogleDbModal={() => setIsGoogleDbOpen(true)}
        isGoogleConnected={googleDbState.isConnected}
        googleDbState={googleDbState}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'dashboard' && (
          <CoordinatorDashboard
            students={students}
            classes={classes}
            reports={reports}
            settings={settings}
            users={users}
            onOpenStudentEditor={handleOpenStudentEditor}
            onOpenSettingsModal={() => setIsSettingsOpen(true)}
            onOpenBackupModal={() => setIsBackupOpen(true)}
            onOpenGoogleDbModal={() => setIsGoogleDbOpen(true)}
            isGoogleConnected={googleDbState.isConnected}
            googleDbState={googleDbState}
          />
        )}

        {activeView === 'editor' && activeStudent && activeReport && (
          <ReportCardEditor
            students={students}
            currentStudentId={activeStudent.id}
            onSelectStudent={setSelectedStudentId}
            classroom={activeClass}
            initialReport={activeReport}
            settings={settings}
            onSaveReport={handleSaveReport}
          />
        )}

        {activeView === 'students' && (
          <StudentManager
            students={students}
            classes={classes}
            settings={settings}
            onUpdateStudents={handleUpdateStudents}
            onOpenStudentEditor={handleOpenStudentEditor}
          />
        )}

        {activeView === 'classes' && (
          <ClassManager
            classes={classes}
            students={students}
            teachers={users.filter((u) => u.role === 'teacher')}
            onUpdateClasses={handleUpdateClasses}
          />
        )}

        {activeView === 'parent' && (
          <ParentPortal
            students={students}
            classes={classes}
            reports={reports}
            settings={settings}
          />
        )}
      </main>

      {/* Auto-Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-40 bg-[#07193b] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400/40 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={handleDataRestored}
        onOpenGoogleDb={() => setIsGoogleDbOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
      />

      <GoogleDatabaseModal
        isOpen={isGoogleDbOpen}
        onClose={() => setIsGoogleDbOpen(false)}
        googleProfile={googleProfile}
        googleToken={googleToken}
        dbState={googleDbState}
        onUpdateDbState={(updated) => setGoogleDbState((prev) => ({ ...prev, ...updated }))}
        onProfileChange={(profile, token) => {
          setGoogleProfile(profile);
          setGoogleToken(token);
        }}
        students={students}
        classes={classes}
        reports={reports}
        settings={settings}
        users={users}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
}

