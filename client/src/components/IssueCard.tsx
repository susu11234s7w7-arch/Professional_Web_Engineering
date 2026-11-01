import React from 'react';
import { Issue, IssueStatus } from '../types';
import { MessageSquare, Calendar, Bug, Sparkles, CheckSquare, ArrowUpRight } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  onStatusChange: (newStatus: IssueStatus) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, onStatusChange }) => {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'LOW':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case 'FEATURE':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5 relative"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          {getTypeIcon(issue.type)}
          <span className="font-mono text-[11px] font-semibold text-slate-400">
            {issue.key}
          </span>
        </div>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(
            issue.priority
          )}`}
        >
          {issue.priority}
        </span>
      </div>

      <h4 className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-relaxed">
        {issue.title}
      </h4>

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          {issue.dueDate && (
            <div className="flex items-center space-x-1 text-slate-500" title={`Due: ${issue.dueDate}`}>
              <Calendar className="w-3 h-3" />
              <span className="text-[10px]">{issue.dueDate}</span>
            </div>
          )}
          {(issue.commentCount || 0) > 0 && (
            <div className="flex items-center space-x-1 text-slate-500">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px]">{issue.commentCount}</span>
            </div>
          )}
        </div>

        {issue.assigneeName ? (
          <div
            title={`Assigned to ${issue.assigneeName}`}
            className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-[10px] font-bold text-indigo-300 flex items-center justify-center"
          >
            {issue.assigneeName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <span className="text-[10px] text-slate-600 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};

