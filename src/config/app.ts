export const APP_CONFIG = {
  name: 'DeepWorkAI',
  version: '1.0.0',
  description: 'AI-powered productivity app for focused work',
  
  // Focus session defaults
  focus: {
    defaultDuration: 25 * 60, // 25 minutes in seconds
    minDuration: 5 * 60, // 5 minutes in seconds
    maxDuration: 120 * 60, // 2 hours in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    longBreakDuration: 15 * 60, // 15 minutes in seconds
  },
  
  // AI settings
  ai: {
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    priorityUpdateInterval: 5 * 60 * 1000, // 5 minutes
  },
  
  // Storage keys
  storage: {
    authToken: 'auth_token',
    userPreferences: 'user_preferences',
    focusSettings: 'focus_settings',
    lastSync: 'last_sync',
  },
  
  // API endpoints
  api: {
    baseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bwlerzmwevvaeiropxcj.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3bGVyem13ZXZ2YWVpcm9weGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTQ0ODUsImV4cCI6MjA3MjI3MDQ4NX0.0U1jlE1PtJduMw35qfD3NsoSqM7hzuZQZPrk6AulHA0',
  },
  
  // DeepSeek API
  deepseek: {
    apiKey: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
    baseUrl: 'https://api.deepseek.com/v1',
  },
} as const;

export const THEME_CONFIG = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Background colors
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',
    
    // Text colors
    text: '#1e293b',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    
    // Dark theme colors
    darkBackground: '#0f172a',
    darkSurface: '#1e293b',
    darkSurfaceVariant: '#334155',
    darkText: '#f8fafc',
    darkTextSecondary: '#cbd5e1',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
} as const;

// React Native Paper theme
export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    disabled: '#94a3b8',
    placeholder: '#64748b',
  },
  roundness: 8,
};
