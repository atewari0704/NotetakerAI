import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useCallback } from 'react';
import { Logo, HoverButton } from '@/components/ui';
import { colors } from '@/config';

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
        <View style={styles.logoContainer}>
          <Logo size={80} />
        </View>
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

          <HoverButton
            title={isLoading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />

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
    backgroundColor: colors.background.primary,
    padding: 24,
    justifyContent: 'center',
  },
  surface: {
    padding: 32,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
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
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: colors.text.secondary,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.background.primary,
  },
  button: {
    backgroundColor: colors.button.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral.silver,
  },
  buttonText: {
    color: colors.text.inverse,
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
    color: colors.text.secondary,
  },
  link: {
    color: colors.button.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 4,
  },
  errorHint: {
    color: colors.button.primary,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});