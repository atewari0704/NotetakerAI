export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: number;
  status: TaskStatus;
  category?: string;
  estimated_duration?: number; // in minutes
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  ai_metadata: AIMetadata;
  tags: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export interface AIMetadata {
  priority_score?: number;
  category_suggestion?: string;
  estimated_duration?: number;
  complexity_score?: number;
  urgency_score?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  estimated_duration?: number;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: number;
  status?: TaskStatus;
  category?: string;
  estimated_duration?: number;
  due_date?: string;
  tags?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  category?: string;
  priority?: number;
  due_date?: string;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  archived: number;
}

