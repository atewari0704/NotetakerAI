import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useCallback } from 'react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, clearError } = useAuthStore();

  // Clear errors when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      clearError();
    }, [clearError])
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      await login({ email, password });
      router.replace('/(main)/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = error || 'Login failed. Please try again.';
      
      // Check if the error suggests the user needs to register
      if (errorMessage.includes('register') || errorMessage.includes('account not found')) {
        Alert.alert(
          'Account Not Found',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign Up', 
              onPress: () => router.push('/(auth)/register'),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Login Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.title}>
          Welcome Back
        </Text>
        <Text style={styles.subtitle}>
          Sign in to continue your productivity journey
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {(error.includes('register') || error.includes('account not found')) && (
                <Text style={styles.errorHint}>
                  💡 Don't have an account? Tap "Sign Up" below to create one!
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  surface: {
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#64748b',
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
  },
  link: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 4,
  },
  errorHint: {
    color: '#6366f1',
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});