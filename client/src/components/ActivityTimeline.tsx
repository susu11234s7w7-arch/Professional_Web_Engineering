import React, { useEffect, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../api/client';
import { ActivityLog } from '../types';
import { Clock, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';

export const ActivityTimeline: React.FC = () => {
  const { activeProject } = useProject();
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeProject) return;
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await api.getProjectActivity(activeProject.id);
        setActivity(data);
      } catch (err) {
        console.error('Failed to load project activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activeProject?.id]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-xs">
        Select a project to view the activity timeline.
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGED':
        return <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />;
      case 'ISSUE_CREATED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white">Project Activity Audit Stream</h2>
          <p className="text-xs text-slate-400">Chronological history of changes across {activeProject.name}</p>
        </div>
        <span className="text-xs font-mono text-slate-500">{activity.length} events</span>
      </div>

      <div className="space-y-3">
        {activity.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex items-start space-x-3 shadow-sm hover:border-slate-700 transition"
          >
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
              {getActionBadge(item.action)}
            </div>

            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-200">{item.userName}</span>
                  {item.issueKey && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                      {item.issueKey}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {item.action === 'STATUS_CHANGED' && (
                  <span>
                    Moved status from <span className="font-medium text-slate-200 font-mono">{item.oldValue}</span> to{' '}
                    <span className="font-medium text-emerald-400 font-mono">{item.newValue}</span>
                  </span>
                )}
                {item.action === 'PRIORITY_CHANGED' && (
                  <span>
                    Changed priority from <span className="font-medium text-slate-200">{item.oldValue}</span> to{' '}
                    <span className="font-medium text-amber-400">{item.newValue}</span>
                  </span>
                )}
                {item.action === 'ISSUE_CREATED' && <span>Created issue &bull; Initial status: {item.newValue}</span>}
                {item.action === 'COMMENT_ADDED' && (
                  <span>
                    Added comment: <span className="italic text-slate-400">"{item.newValue}"</span>
                  </span>
                )}
                {item.action === 'ASSIGNEE_CHANGED' && <span>Updated assignment</span>}
              </p>
            </div>
          </div>
        ))}

        {activity.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            No activity recorded in this project yet.
          </div>
        )}
      </div>
    </div>
  );
};
