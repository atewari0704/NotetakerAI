import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/auth';

export const useAuthListener = () => {
  const { setUser, set } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const user = await authApi.getCurrentUser();
            setUser(user);
            set({ isAuthenticated: true, isLoading: false, error: null });
          } catch (error) {
            console.error('Error getting user on sign in:', error);
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: 'Failed to load user profile' 
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          set({ 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            const user = await authApi.getCurrentUser();
            setUser(user);
            set({ isAuthenticated: true, isLoading: false, error: null });
          } catch (error) {
            console.error('Error refreshing user on token refresh:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, set]);
};
