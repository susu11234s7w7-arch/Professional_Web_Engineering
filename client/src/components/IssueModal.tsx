import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, IssuePriority, IssueType, Comment, ActivityLog } from '../types';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { X, MessageSquare, History, Trash2, Send, Calendar, User, Tag, Clock } from 'lucide-react';

interface IssueModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ issue: initialIssue, onClose }) => {
  const { users, updateIssue, deleteIssue, addComment } = useProject();
  const { user } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(initialIssue);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch complete details (comments and activity)
  useEffect(() => {
    if (!initialIssue) return;
    const loadDetails = async () => {
      try {
        setLoading(true);
        const detailed = await api.getIssue(initialIssue.id);
        setIssue(detailed);
      } catch (err) {
        console.error('Failed to load issue details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [initialIssue?.id]);

  if (!issue) return null;

  const handleStatusChange = async (newStatus: IssueStatus) => {
    const updated = await updateIssue(issue.id, { status: newStatus });
    setIssue(prev => (prev ? { ...prev, status: newStatus, activity: updated.activity } : null));
    // Reload full details for updated activity stream
    const detailed = await api.getIssue(issue.id);
    setIssue(detailed);
  };

  const handlePriorityChange = async (newPriority: IssuePriority) => {
    await updateIssue(issue.id, { priority: newPriority });
    const detailed = await api.getIssue(issue.id);
    setIssue(detailed);
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    const val = newAssigneeId === '' ? null : newAssigneeId;
    await updateIssue(issue.id, { assigneeId: val });
    const detailed = await api.getIssue(issue.id);
    setIssue(detailed);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await addComment(issue.id, commentText.trim());
      setCommentText('');
      const detailed = await api.getIssue(issue.id);
      setIssue(detailed);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${issue.key}?`)) {
      await deleteIssue(issue.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-indigo-400 border border-slate-700">
              {issue.key}
            </span>
            <span className="text-xs text-slate-400">Created by {issue.reporterName}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              title="Delete Issue"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Left: Description/Comments, Right: Meta Fields) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Main Column */}
          <div className="md:col-span-2 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">{issue.title}</h2>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                {issue.description || <span className="text-slate-600 italic">No description provided.</span>}
              </div>
            </div>

            {/* Tabs: Comments / Activity */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-4 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex items-center space-x-1.5 pb-2 text-xs font-medium border-b-2 transition ${
                    activeTab === 'comments'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({issue.comments?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center space-x-1.5 pb-2 text-xs font-medium border-b-2 transition ${
                    activeTab === 'activity'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Trail ({issue.activity?.length || 0})</span>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'comments' ? (
                <div className="space-y-4">
                  {/* Comments List */}
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {issue.comments && issue.comments.length > 0 ? (
                      issue.comments.map(c => (
                        <div key={c.id} className="bg-slate-950/40 border border-slate-800/70 rounded-lg p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-200">{c.authorName}</span>
                            <span className="text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic py-2">No comments yet.</p>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Activity Stream */
                <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs">
                  {issue.activity && issue.activity.length > 0 ? (
                    issue.activity.map(a => (
                      <div key={a.id} className="flex items-start space-x-2.5 text-slate-400 py-1 border-b border-slate-800/40">
                        <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-300">
                            <span className="font-semibold text-slate-200">{a.userName}</span>{' '}
                            {a.action === 'STATUS_CHANGED' && `changed status from ${a.oldValue} to ${a.newValue}`}
                            {a.action === 'PRIORITY_CHANGED' && `changed priority to ${a.newValue}`}
                            {a.action === 'ASSIGNEE_CHANGED' && `updated assignee`}
                            {a.action === 'ISSUE_CREATED' && `created this issue`}
                            {a.action === 'COMMENT_ADDED' && `commented: "${a.newValue}"`}
                          </p>
                          <span className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No activity recorded.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Meta Column */}
          <div className="p-6 space-y-5 bg-slate-900/50 text-xs">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={issue.status}
                onChange={e => handleStatusChange(e.target.value as IssueStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                value={issue.priority}
                onChange={e => handlePriorityChange(e.target.value as IssuePriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assignee</label>
              <select
                value={issue.assigneeId || ''}
                onChange={e => handleAssigneeChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Issue Type</label>
              <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-300 font-medium">
                {issue.type}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
              <div className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-slate-300 flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{issue.dueDate || 'No due date'}</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-slate-800 space-y-1 text-[10px] text-slate-500">
              <p>Created: {new Date(issue.createdAt).toLocaleString()}</p>
              <p>Updated: {new Date(issue.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
