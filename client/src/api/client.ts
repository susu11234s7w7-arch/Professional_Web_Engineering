import { User, Project, Issue, Comment, ActivityLog } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('devpulse_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('devpulse_token', token);
    } else {
      localStorage.removeItem('devpulse_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      const message = data.error?.message || data.message || 'Request failed';
      throw new Error(message);
    }

    return data.data;
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    this.setToken(data.token);
    return data;
  }

  async register(details: { email: string; password: string; fullName: string }): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details)
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/auth/users');
  }

  // Projects
  async getProjects(search?: string): Promise<Project[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<Project[]>(`/projects${query}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(payload: { name: string; key: string; description?: string }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  async getProjectActivity(projectId: string): Promise<ActivityLog[]> {
    return this.request<ActivityLog[]>(`/projects/${projectId}/activity`);
  }

  // Issues
  async getIssues(projectId: string, filters: Record<string, string> = {}): Promise<Issue[]> {
    const params = new URLSearchParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<Issue[]>(`/projects/${projectId}/issues${qs}`);
  }

  async getIssue(id: string): Promise<Issue> {
    return this.request<Issue>(`/issues/${id}`);
  }

  async createIssue(projectId: string, payload: Partial<Issue>): Promise<Issue> {
    return this.request<Issue>(`/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateIssue(id: string, payload: Partial<Issue>): Promise<Issue> {
    return this.request<Issue>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async deleteIssue(id: string): Promise<void> {
    await this.request(`/issues/${id}`, { method: 'DELETE' });
  }

  async addComment(issueId: string, content: string): Promise<Comment> {
    return this.request<Comment>(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }
}

export const api = new ApiClient();

