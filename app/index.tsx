import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';
import { AuthDebugger } from '@/components/debug/AuthDebugger';

export default function IndexScreen() {
  const { isAuthenticated, isLoading, isInitialized, user, initializeAuth, error } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on app start
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  useEffect(() => {
    // Redirect based on authentication status
    if (isInitialized && !isLoading) {
      if (isAuthenticated && user) {
        router.replace('/(main)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, user]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !isInitialized) {
        console.warn('Authentication initialization timeout, redirecting to login');
        router.replace('/(auth)/login');
      }
    }, 2000); // 2 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, isInitialized]);

  // Force redirect if stuck
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      console.warn('Force redirect to login after 5 seconds');
      router.replace('/(auth)/login');
    }, 5000);

    return () => clearTimeout(forceTimeout);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>DeepWorkAI</Text>
        <Text style={styles.subtitle}>Focus on what matters</Text>
        <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
        <Text style={styles.loadingText}>
          {!isInitialized ? 'Initializing...' : 'Loading...'}
        </Text>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
        {__DEV__ && (
          <Text style={styles.debugText}>
            Debug: {isInitialized ? 'Initialized' : 'Not initialized'} | 
            {isLoading ? 'Loading' : 'Not loading'} | 
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