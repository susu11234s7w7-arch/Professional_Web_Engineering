import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { X, FolderPlus } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
  const { createProject } = useProject();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length < 4) {
      // Auto suggest key from name initials
      const suggested = val
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (suggested) setKey(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!key.trim()) {
      setError('Project key is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createProject(name.trim(), key.trim().toUpperCase(), description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Create New Project</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Project Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Platform API Engine"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Project Key * (Prefix for issues, e.g. ENG-1)</label>
            <input
              type="text"
              required
              maxLength={8}
              placeholder="e.g. ENG"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="What is this project focused on?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

