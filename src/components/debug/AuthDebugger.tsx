import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores';
import { supabase } from '@/config/supabase';

export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, isLoading, isInitialized, error, initializeAuth } = useAuthStore();

  const testAuth = async () => {
    console.log('=== AUTH DEBUG TEST ===');
    
    // Test 1: Check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { session: !!session, error: sessionError });
    
    // Test 2: Check Supabase user
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    console.log('Auth user check:', { user: !!authUser, error: userError });
    
    // Test 3: Check users table
    if (authUser) {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      console.log('Database user check:', { user: !!dbUser, error: dbError });
    }
    
    console.log('=== END AUTH DEBUG ===');
  };

  const clearAuth = async () => {
    await supabase.auth.signOut();
    console.log('Auth cleared');
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debugger</Text>
      
      <View style={styles.status}>
        <Text style={styles.label}>Initialized:</Text>
        <Text style={styles.value}>{isInitialized ? 'Yes' : 'No'}</Text>
      </View>
      
      <View style={styles.status}>
        <Text style={styles.label}>Loading:</Text>
        <Text style={styles.value}>{isLoading ? 'Yes' : 'No'}</Text>
      </View>
      
      <View style={styles.status}>
        <Text style={styles.label}>Authenticated:</Text>
        <Text style={styles.value}>{isAuthenticated ? 'Yes' : 'No'}</Text>
      </View>
      
      {user && (
        <View style={styles.status}>
          <Text style={styles.label}>User:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.status}>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={testAuth}>
          <Text style={styles.buttonText}>Test Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={initializeAuth}>
          <Text style={styles.buttonText}>Re-init Auth</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAuth}>
          <Text style={styles.buttonText}>Clear Auth</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  error: {
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
});
