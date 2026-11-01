import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Issue, IssueStatus } from '../types';
import { Bug, Sparkles, CheckSquare, MessageSquare } from 'lucide-react';

interface ListViewProps {
  onSelectIssue: (issue: Issue) => void;
}

export const ListView: React.FC<ListViewProps> = ({ onSelectIssue }) => {
  const { issues, activeProject, updateIssueStatus } = useProject();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'FEATURE':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500 text-sm">
        Select a project to view the list.
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {issues.map(issue => (
              <tr
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="hover:bg-slate-800/40 cursor-pointer transition"
              >
                <td className="py-3 px-4 font-mono font-medium text-slate-400 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5">
                    {getTypeIcon(issue.type)}
                    <span>{issue.key}</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-200">
                  {issue.title}
                </td>
                <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={issue.status}
                    onChange={(e) => updateIssueStatus(issue.id, e.target.value as IssueStatus)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${getPriorityBadge(
                      issue.priority
                    )}`}
                  >
                    {issue.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                  {issue.assigneeName || <span className="text-slate-600 italic">Unassigned</span>}
                </td>
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                  {issue.dueDate || '—'}
                </td>
                <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                  <div className="inline-flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>{issue.commentCount || 0}</span>
                  </div>
                </td>
              </tr>
            ))}

            {issues.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                  No issues match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
