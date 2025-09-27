import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useAuthListener } from '@/hooks';
import { AuthDebugger } from '@/components/debug/AuthDebugger';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, user, error } = useAuthStore();
  
  // Set up auth state listener - this handles all auth state management
  useAuthListener();

  useEffect(() => {
    // Redirect based on authentication status
    if (!isLoading) {
      console.log('Auth state:', { isAuthenticated, hasUser: !!user });
      if (isAuthenticated && user) {
        console.log('User is authenticated, redirecting to dashboard');
        router.replace('/(main)/dashboard');
      } else {
        console.log('User is not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Reduced timeout to prevent long loading screens
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Authentication loading timeout, redirecting to login');
        router.replace('/(auth)/login');
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>DeepWorkAI</Text>
        <Text style={styles.subtitle}>Focus on what matters</Text>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        <Text style={styles.loadingText}>
          {isLoading ? 'Checking authentication...' : 'Loading...'}
        </Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
        {__DEV__ && (
          <Text style={styles.debugText}>
            Debug: {isLoading ? 'Loading' : 'Not loading'} | 
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </Text>
        )}
      </View>
      
      {/* Debug component */}
      <AuthDebugger />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  debugText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
