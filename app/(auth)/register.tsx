import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, error, clearError } = useAuthStore();

  // Clear errors when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      clearError();
    }, [clearError])
  );

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      await register({ email, password, full_name: fullName });
      router.replace('/(main)/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = error || 'Registration failed. Please try again.';
      
      // Check if the error suggests the user already has an account
      if (errorMessage.includes('already exists') || errorMessage.includes('try logging in')) {
        Alert.alert(
          'Account Already Exists',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In', 
              onPress: () => router.push('/(auth)/login'),
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert('Registration Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.title}>
          Create Account
        </Text>
        <Text style={styles.subtitle}>
          Start your focused productivity journey
        </Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            style={styles.input}
          />

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

          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {(error.includes('already exists') || error.includes('try logging in')) && (
                <Text style={styles.errorHint}>
                  💡 Already have an account? Tap "Sign In" below to log in!
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Sign In</Text>
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