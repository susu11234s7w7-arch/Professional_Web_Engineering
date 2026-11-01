import React from 'react';
import { useProject } from '../context/ProjectContext';
import { CheckCircle2, Clock, AlertCircle, Flame, BarChart2 } from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  const { activeProject } = useProject();

  if (!activeProject || !activeProject.metrics) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
        Select a project to view metrics.
      </div>
    );
  }

  const { metrics } = activeProject;
  const openCount = metrics.totalIssues - metrics.completedIssues;

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-5xl">
      {/* Project Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activeProject.key}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">{activeProject.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {activeProject.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/60 border border-slate-800 rounded-lg p-3 shrink-0">
            <div className="text-center">
              <span className="text-2xl font-bold text-white font-mono">{metrics.completionPercentage}%</span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Issues</span>
            <BarChart2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{metrics.totalIssues}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Tasks</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{openCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{metrics.completedIssues}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Urgent Priority</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">{metrics.byPriority.URGENT}</p>
        </div>
      </div>

      {/* Distribution Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Issue Status Pipeline
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(metrics.byStatus).map(([status, count]) => {
              const pct = metrics.totalIssues > 0 ? Math.round((count / metrics.totalIssues) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Priority Breakdown
          </h3>
          <div className="space-y-3 text-xs">
            {Object.entries(metrics.byPriority).map(([priority, count]) => {
              const pct = metrics.totalIssues > 0 ? Math.round((count / metrics.totalIssues) * 100) : 0;
              const colorClass =
                priority === 'URGENT'
                  ? 'bg-rose-500'
                  : priority === 'HIGH'
                  ? 'bg-amber-500'
                  : priority === 'MEDIUM'
                  ? 'bg-blue-500'
                  : 'bg-slate-500';

              return (
                <div key={priority} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span className="capitalize">{priority.toLowerCase()}</span>
                    <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${colorClass} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
