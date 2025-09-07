export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    focus_reminders: boolean;
    break_reminders: boolean;
    daily_summary: boolean;
  };
  focus_settings?: {
    default_duration: number; // in minutes
    auto_start_break: boolean;
    break_duration: number; // in minutes
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

