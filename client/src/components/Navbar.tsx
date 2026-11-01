import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Plus, LogOut, User, FolderGit2, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onOpenCreateIssue: () => void;
  onOpenCreateProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateIssue, onOpenCreateProject }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { activeProject, projects, setActiveProject } = useProject();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DevPulse
            </span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              v1.0
            </span>
          </div>
        </div>

        {user && projects.length > 0 && (
          <div className="hidden sm:flex items-center space-x-2 pl-4 border-l border-slate-800">
            <FolderGit2 className="w-4 h-4 text-slate-400" />
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find(p => p.id === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <button
              onClick={onOpenCreateIssue}
              disabled={!activeProject}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow-sm hover:shadow-indigo-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Issue</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 mx-1" />

            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-medium text-slate-200">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-medium">{user.fullName}</span>
              <span className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openAuthModal('login')}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition shadow-sm"
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
