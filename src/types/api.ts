export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: number;
  category?: string;
  estimated_duration?: number;
  due_date?: Date;
  tags?: string[];
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  status?: 'pending' | 'in_progress' | 'completed' | 'archived';
}

export interface FocusSessionCreateRequest {
  task_id?: string;
  session_name?: string;
  target_duration: number;
}

export interface FocusSessionUpdateRequest {
  status?: 'active' | 'paused' | 'completed' | 'interrupted';
  end_time?: Date;
  duration_minutes?: number;
  interruptions?: number;
  notes?: string;
  mood_rating?: number;
  productivity_rating?: number;
}
