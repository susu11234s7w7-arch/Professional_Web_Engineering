import React from 'react';
import { Issue, IssueStatus } from '../types';
import { IssueCard } from './IssueCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: IssueStatus;
  title: string;
  dotColor: string;
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onStatusChange: (issueId: string, newStatus: IssueStatus) => void;
  onQuickAdd: (status: IssueStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  dotColor,
  issues,
  onSelectIssue,
  onStatusChange,
  onQuickAdd
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId) {
      onStatusChange(issueId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 min-w-[270px] max-w-[340px] bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-col max-h-full"
    >
      {/* Column Header */}
      <div className="p-3 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="text-xs font-semibold text-slate-200">{title}</h3>
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {issues.length}
          </span>
        </div>
        <button
          onClick={() => onQuickAdd(status)}
          title={`Add issue to ${title}`}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Scrollable Container */}
      <div className="p-2 space-y-2 flex-1 overflow-y-auto min-h-[150px]">
        {issues.map(issue => (
          <div
            key={issue.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', issue.id);
            }}
          >
            <IssueCard
              issue={issue}
              onClick={() => onSelectIssue(issue)}
              onStatusChange={(newStatus) => onStatusChange(issue.id, newStatus)}
            />
          </div>
        ))}

        {issues.length === 0 && (
          <div className="h-28 border border-dashed border-slate-800/60 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs">
            <p>No issues</p>
          </div>
        )}
      </div>
    </div>
  );
};
