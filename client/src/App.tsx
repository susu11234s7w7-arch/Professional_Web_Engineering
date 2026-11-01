import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { ProjectOverview } from './components/ProjectOverview';
import { ActivityTimeline } from './components/ActivityTimeline';
import { IssueModal } from './components/IssueModal';
import { CreateIssueModal } from './components/CreateIssueModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AuthModal } from './components/AuthModal';
import { Issue, IssueStatus } from './types';
import { Shield, Sparkles, Layers, Terminal, ArrowRight, Phone, Mail, UserCheck, ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { activeProject } = useProject();

  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [createIssueInitialStatus, setCreateIssueInitialStatus] = useState<IssueStatus>('TODO');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const handleQuickAdd = (status: IssueStatus) => {
    setCreateIssueInitialStatus(status);
    setIsCreateIssueOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Navigation */}
      <Navbar
        onOpenCreateIssue={() => {
          setCreateIssueInitialStatus('TODO');
          setIsCreateIssueOpen(true);
        }}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* Main Workspace Body */}
      {user ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCreateProject={() => setIsCreateProjectOpen(true)}
          />

          {/* View Container */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
            {/* Show filter bar on Kanban & List views */}
            {(activeTab === 'kanban' || activeTab === 'list') && <FilterBar />}

            <div className="flex-1 flex overflow-hidden">
              {activeTab === 'kanban' && (
                <KanbanBoard
                  onSelectIssue={setSelectedIssue}
                  onQuickAdd={handleQuickAdd}
                />
              )}
              {activeTab === 'list' && (
                <ListView onSelectIssue={setSelectedIssue} />
              )}
              {activeTab === 'metrics' && <ProjectOverview />}
              {activeTab === 'activity' && <ActivityTimeline />}
            </div>
          </main>
        </div>
      ) : (
        /* Guest Welcome / Showcase Hero */
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-7 my-auto">
            {/* Engineer Ownership & Copyright Banner */}
            <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 shadow-xl shadow-indigo-950/40 w-full max-w-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-right sm:text-left">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400/30 shrink-0">
                    SA
                  </div>
                  <div className="space-y-0.5 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white tracking-wide">سهيل الحاج | Suhail Alhaj</span>
                      <span title="Verified Author & Engineer">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    </div>
                    <p className="text-xs text-indigo-300 font-medium">مهندس ومطور النظام الرئيسي &bull; Lead Software Engineer</p>
                    <p className="text-[11px] text-slate-400">تم تصميم وبرمجة هذا النظام بالكامل بكافة متطلباته الهندسية</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
                  <a
                    href="tel:773850911"
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">773850911</span>
                  </a>
                  <a
                    href="mailto:sboymohmmed@gmail.com"
                    className="inline-flex items-center justify-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] text-slate-400 hover:text-slate-200 transition"
                  >
                    <Mail className="w-3 h-3" />
                    <span>sboymohmmed@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>نظام إدارة وتتبع المهام الهندسية الاحترافي &bull; Production Workspace</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
                DevPulse Agile Engineering Platform
              </h1>

              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                منصة هندسية متكاملة لإدارة المشاريع وفرق التطوير التقنية بتقنيات الويب الحديثة (React, Express, TypeScript, SQLite)، لوحات كانبان تفاعلية، وسجل تدقيق غير قابل للتعديل.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>دخول النظام والتجربة (Explore Demo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                إنشاء حساب جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-800/80 text-left w-full max-w-3xl">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white">Full-Stack Type Safety</h3>
                <p className="text-[11px] text-slate-400">Strict TypeScript 5.x throughout, with Zod schema verification on all REST endpoints.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white">Security by Design</h3>
                <p className="text-[11px] text-slate-400">Salted bcrypt password hashes, JWT authorization, rate limiting, and parameterized queries.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-white">Reproducible DevOps</h3>
                <p className="text-[11px] text-slate-400">One-command setup, automated Vitest test suite, and GitHub Actions continuous integration.</p>
              </div>
            </div>
          </div>

          {/* Copyright Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/90 py-3.5 px-4 text-center text-xs text-slate-400">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px]">
                جميع حقوق الملكية والتطوير محفوظة &copy; {new Date().getFullYear()} <strong>سهيل الحاج (Suhail Alhaj)</strong>
              </p>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-slate-500">للتواصل المباشر:</span>
                <a href="tel:773850911" className="text-emerald-400 hover:text-emerald-300 font-mono font-semibold">
                  773850911
                </a>
                <span className="text-slate-700">&bull;</span>
                <a href="mailto:sboymohmmed@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                  sboymohmmed@gmail.com
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <AuthModal />

      {isCreateIssueOpen && (
        <CreateIssueModal
          initialStatus={createIssueInitialStatus}
          onClose={() => setIsCreateIssueOpen(false)}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
        />
      )}

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainLayout />
      </ProjectProvider>
    </AuthProvider>
  );
};

