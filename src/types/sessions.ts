export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string;
  session_name?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  target_duration: number; // planned duration in minutes
  status: SessionStatus;
  interruptions: number;
  notes?: string;
  mood_rating?: number; // 1-5
  productivity_rating?: number; // 1-5
  created_at: string;
  updated_at: string;
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'interrupted';

export interface CreateSessionData {
  task_id?: string;
  session_name?: string;
  target_duration: number;
}

export interface UpdateSessionData {
  status?: SessionStatus;
  end_time?: string;
  duration_minutes?: number;
  interruptions?: number;
  notes?: string;
  mood_rating?: number;
  productivity_rating?: number;
}

export interface SessionStats {
  total_sessions: number;
  total_focus_time: number; // in minutes
  average_session_length: number; // in minutes
  completion_rate: number; // percentage
  current_streak: number; // days
  longest_streak: number; // days
}

export interface SessionTimer {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number; // in seconds
  targetTime: number; // in seconds
  remainingTime: number; // in seconds
  progress: number; // 0-1
}

