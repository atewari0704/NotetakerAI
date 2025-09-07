import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from './app';

const supabaseUrl = APP_CONFIG.api.baseUrl;
const supabaseAnonKey = APP_CONFIG.api.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks',
  FOCUS_SESSIONS: 'focus_sessions',
  CHAT_CONTEXT: 'chat_context',
  USER_ANALYTICS: 'user_analytics',
  CATEGORIES: 'categories',
  NOTIFICATIONS: 'notifications',
} as const;

// RPC function names
export const FUNCTIONS = {
  UPDATE_USER_ANALYTICS: 'update_user_analytics',
} as const;
