import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { Logo, HoverButton } from '@/components/ui';
import { colors } from '@/config';

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
        <View style={styles.logoContainer}>
          <Logo size={80} />
        </View>
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

          <HoverButton
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={isLoading}
            variant="primary"
            fullWidth
          />

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