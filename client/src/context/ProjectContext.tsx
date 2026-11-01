import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Issue, User, IssueStatus, IssuePriority } from '../types';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  issues: Issue[];
  users: User[];
  loading: boolean;
  issuesLoading: boolean;
  filters: {
    search: string;
    status: string;
    priority: string;
    assigneeId: string;
  };
  setActiveProject: (project: Project) => void;
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    status: string;
    priority: string;
    assigneeId: string;
  }>>;
  refreshProjects: () => Promise<void>;
  refreshIssues: () => Promise<void>;
  createProject: (name: string, key: string, description?: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  createIssue: (payload: Partial<Issue>) => Promise<Issue>;
  updateIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (issueId: string) => Promise<void>;
  addComment: (issueId: string, content: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assigneeId: ''
  });

  const refreshProjects = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);

      if (data.length > 0 && !activeProject) {
        // Select first project by default
        const fullProject = await api.getProject(data[0].id);
        setActiveProjectState(fullProject);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeProject]);

  const refreshIssues = useCallback(async () => {
    if (!user || !activeProject) return;
    try {
      setIssuesLoading(true);
      const queryParams: Record<string, string> = {};
      if (filters.search) queryParams.search = filters.search;
      if (filters.status) queryParams.status = filters.status;
      if (filters.priority) queryParams.priority = filters.priority;
      if (filters.assigneeId) queryParams.assigneeId = filters.assigneeId;

      const data = await api.getIssues(activeProject.id, queryParams);
      setIssues(data);

      // Also refresh active project metrics
      const fullProject = await api.getProject(activeProject.id);
      setActiveProjectState(fullProject);
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  }, [user, activeProject?.id, filters]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProjects();
      fetchUsers();
    } else {
      setProjects([]);
      setActiveProjectState(null);
      setIssues([]);
      setUsers([]);
    }
  }, [user]);

  useEffect(() => {
    if (activeProject) {
      refreshIssues();
    }
  }, [activeProject?.id, filters]);

  const setActiveProject = async (proj: Project) => {
    try {
      const full = await api.getProject(proj.id);
      setActiveProjectState(full);
    } catch (err) {
      setActiveProjectState(proj);
    }
  };

  const createProject = async (name: string, key: string, description?: string) => {
    const created = await api.createProject({ name, key, description });
    await refreshProjects();
    setActiveProjectState(created);
    return created;
  };

  const deleteProject = async (id: string) => {
    await api.deleteProject(id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (activeProject?.id === id) {
      if (updated.length > 0) {
        setActiveProject(updated[0]);
      } else {
        setActiveProjectState(null);
        setIssues([]);
      }
    }
  };

  const createIssue = async (payload: Partial<Issue>) => {
    if (!activeProject) throw new Error('No active project');
    const created = await api.createIssue(activeProject.id, payload);
    await refreshIssues();
    return created;
  };

  // Optimistic UI status updates for snappy Kanban dragging/advancing
  const updateIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    const previousIssues = [...issues];

    // Optimistically update local state immediately
    setIssues(prev =>
      prev.map(item => (item.id === issueId ? { ...item, status: newStatus } : item))
    );

    try {
      await api.updateIssue(issueId, { status: newStatus });
      // Update metrics in background
      if (activeProject) {
        const full = await api.getProject(activeProject.id);
        setActiveProjectState(full);
      }
    } catch (err) {
      // Rollback on error
      console.error('Status update failed, rolling back:', err);
      setIssues(previousIssues);
      throw err;
    }
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    const updated = await api.updateIssue(issueId, updates);
    await refreshIssues();
    return updated;
  };

  const deleteIssue = async (issueId: string) => {
    await api.deleteIssue(issueId);
    setIssues(prev => prev.filter(i => i.id !== issueId));
  };

  const addComment = async (issueId: string, content: string) => {
    await api.addComment(issueId, content);
    await refreshIssues();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        issues,
        users,
        loading,
        issuesLoading,
        filters,
        setActiveProject,
        setFilters,
        refreshProjects,
        refreshIssues,
        createProject,
        deleteProject,
        createIssue,
        updateIssueStatus,
        updateIssue,
        deleteIssue,
        addComment
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

