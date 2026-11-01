export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueType = 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt?: string;
}

export interface ProjectMetrics {
  totalIssues: number;
  completedIssues: number;
  completionPercentage: number;
  byStatus: Record<IssueStatus, number>;
  byPriority: Record<IssuePriority, number>;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  issueCount?: number;
  memberCount?: number;
  createdAt: string;
  metrics?: ProjectMetrics;
}

export interface Issue {
  id: string;
  projectId: string;
  issueNumber: number;
  key: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId?: string | null;
  assigneeName?: string;
  assigneeEmail?: string;
  reporterId: string;
  reporterName?: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  comments?: Comment[];
  activity?: ActivityLog[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  issueId?: string;
  issueKey?: string;
  issueTitle?: string;
  userName: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}
