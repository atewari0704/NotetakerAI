import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from '@/services/api/auth';
import { supabase } from '@/config/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      isInitialized: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await authApi.login(credentials);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await authApi.register(userData);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      refreshUser: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const updatedUser = await authApi.getCurrentUser();
          set({ user: updatedUser });
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      initializeAuth: async () => {
        const { isInitialized, isLoading } = get();
        
        // Prevent multiple initializations
        if (isInitialized || isLoading) {
          console.log('Auth already initialized or initializing, skipping...');
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Initializing authentication...');
          
          // Check if there's an existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ 
              isLoading: false, 
              isInitialized: true,
              error: error.message 
            });
            return;
          }

          console.log('Session check result:', { hasSession: !!session, hasUser: !!session?.user });

          if (session?.user) {
            // User is authenticated, get their profile
            try {
              console.log('Getting user profile for:', session.user.id);
              const user = await authApi.getCurrentUser();
              console.log('User profile loaded:', user?.email);
              
              if (user) {
                set({
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  isInitialized: true,
                  error: null,
                });
              } else {
                // User profile not found, sign out
                console.log('User profile not found, signing out');
                await supabase.auth.signOut();
                set({
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  isInitialized: true,
                  error: null,
                });
              }
            } catch (error) {
              console.error('Error getting user profile:', error);
              // Session exists but user profile not found, sign out
              await supabase.auth.signOut();
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                error: 'User profile not found',
              });
            }
          } else {
            // No session, user is not authenticated
            console.log('No active session, user not authenticated');
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Failed to initialize authentication',
          });
        }
      },
}));
