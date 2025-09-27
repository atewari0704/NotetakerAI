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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError, isLoading } = useAuthStore();

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

    // Prevent multiple login attempts
    if (isSubmitting || isLoading) {
      console.log('Login already in progress, ignoring duplicate request');
      return;
    }

    try {
      setIsSubmitting(true);
      clearError();
      console.log('Starting login process...');
      
      await login({ email, password });
      
      console.log('Login successful, redirecting to dashboard');
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
      setIsSubmitting(false);
    }
  };

  const isLoginDisabled = isSubmitting || isLoading || !email || !password;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Logo size={250} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.text.tertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.text.tertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting && !isLoading}
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <HoverButton
            title={isSubmitting || isLoading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            variant="primary"
            size="large"
            fullWidth
            disabled={isLoginDisabled}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={isSubmitting || isLoading}>
                <Text style={[styles.signupLink, (isSubmitting || isLoading) && styles.disabledText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: 16,
    color: colors.button.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.text.tertiary,
  },
});
