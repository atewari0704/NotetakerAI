import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/auth';

export const useAuthListener = () => {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            console.log('User signed in, fetching profile...');
            const user = await authApi.getCurrentUser();
            setUser(user);
            setLoading(false);
            setError(null);
          } catch (error) {
            console.error('Error getting user on sign in:', error);
            setUser(null);
            setLoading(false);
            setError('Failed to load user profile');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setLoading(false);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          try {
            console.log('Token refreshed, updating user...');
            const user = await authApi.getCurrentUser();
            setUser(user);
            setLoading(false);
            setError(null);
          } catch (error) {
            console.error('Error refreshing user on token refresh:', error);
            // Don't clear user on refresh error, just log it
          }
        } else if (event === 'INITIAL_SESSION') {
          console.log('Initial session check:', !!session);
          if (session?.user) {
            try {
              const user = await authApi.getCurrentUser();
              setUser(user);
              setLoading(false);
              setError(null);
            } catch (error) {
              console.error('Error getting user on initial session:', error);
              setUser(null);
              setLoading(false);
              setError('Failed to load user profile');
            }
          } else {
            setUser(null);
            setLoading(false);
            setError(null);
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setError]);
};
