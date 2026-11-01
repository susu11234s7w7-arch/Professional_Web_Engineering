import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Issue, IssueStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  onSelectIssue: (issue: Issue) => void;
  onQuickAdd: (status: IssueStatus) => void;
}

const COLUMNS: Array<{ status: IssueStatus; title: string; dotColor: string }> = [
  { status: 'BACKLOG', title: 'Backlog', dotColor: 'bg-slate-400' },
  { status: 'TODO', title: 'To Do', dotColor: 'bg-indigo-400' },
  { status: 'IN_PROGRESS', title: 'In Progress', dotColor: 'bg-amber-400' },
  { status: 'IN_REVIEW', title: 'In Review', dotColor: 'bg-purple-400' },
  { status: 'DONE', title: 'Done', dotColor: 'bg-emerald-400' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onSelectIssue, onQuickAdd }) => {
  const { issues, updateIssueStatus, activeProject } = useProject();

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <p className="text-sm">Please select or create a project to view the Kanban board.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-x-auto flex gap-4 min-h-0 items-start">
      {COLUMNS.map(col => {
        const columnIssues = issues.filter(i => i.status === col.status);
        return (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            dotColor={col.dotColor}
            issues={columnIssues}
            onSelectIssue={onSelectIssue}
            onStatusChange={updateIssueStatus}
            onQuickAdd={onQuickAdd}
          />
        );
      })}
    </div>
  );
};
