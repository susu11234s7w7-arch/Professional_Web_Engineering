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
import { Shield, Sparkles, Layers, Terminal, ArrowRight } from 'lucide-react';

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
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production-Grade Agile Engineering Workspace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
              Agile Issue Tracking, Built for Engineering Velocity.
            </h1>

            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              DevPulse delivers interactive Kanban boards, immutable audit logging, and team velocity metrics backed by a lightweight SQLite engine and bulletproof TypeScript REST API.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition shadow-lg shadow-indigo-600/25"
            >
              <span>Explore Demo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-2.5 rounded-lg border border-slate-700 transition"
            >
              Create Account
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-left w-full max-w-3xl">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-white">Full-Stack Type Safety</h3>
              <p className="text-[11px] text-slate-400">Strict TypeScript 5.x throughout, with Zod schema verification on all REST endpoints.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-white">Security by Design</h3>
              <p className="text-[11px] text-slate-400">Salted bcrypt password hashes, JWT authorization, rate limiting, and parameterized queries.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-white">Reproducible DevOps</h3>
              <p className="text-[11px] text-slate-400">One-command setup, automated Vitest test suite, and GitHub Actions continuous integration.</p>
            </div>
          </div>
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
