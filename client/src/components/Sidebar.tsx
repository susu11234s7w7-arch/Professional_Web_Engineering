import React from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, ListTodo, BarChart3, History, Plus, FolderKanban } from 'lucide-react';

export type ActiveTab = 'kanban' | 'list' | 'metrics' | 'activity';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenCreateProject }) => {
  const { user } = useAuth();
  const { projects, activeProject, setActiveProject } = useProject();

  const navItems = [
    { id: 'kanban' as ActiveTab, label: 'Kanban Board', icon: LayoutGrid },
    { id: 'list' as ActiveTab, label: 'List View', icon: ListTodo },
    { id: 'metrics' as ActiveTab, label: 'Project Health', icon: BarChart3 },
    { id: 'activity' as ActiveTab, label: 'Activity Feed', icon: History }
  ];

  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-900/40 flex flex-col justify-between p-3 shrink-0">
      <div className="space-y-6">
        {/* Navigation Views */}
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Views
          </p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        {user && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Projects
              </p>
              <button
                onClick={onOpenCreateProject}
                title="New Project"
                className="text-slate-400 hover:text-indigo-400 hover:bg-slate-800 p-1 rounded transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {projects.map(proj => {
                const isCurrent = activeProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => setActiveProject(proj)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${
                      isCurrent
                        ? 'bg-slate-800 text-white font-medium border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FolderKanban className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                      {proj.key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Ownership */}
      <div className="p-3 border border-slate-800/80 rounded-lg bg-slate-900/60 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-200">DevPulse Platform</p>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">v1.0</span>
        </div>
        <p className="text-[10px] text-slate-400">
          تطوير المهندس: <span className="text-white font-medium">سهيل الحاج</span>
        </p>
        <p className="text-[10px] text-emerald-400 font-mono font-medium flex items-center space-x-1">
          <span>هاتف:</span>
          <a href="tel:773850911" className="hover:underline">773850911</a>
        </p>
        <p className="text-[9px] text-slate-500 pt-1 border-t border-slate-800">
          حقوق الملكية محفوظة &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
};

