import { Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useCallback } from 'react';

export default function AuthLayout() {
  const { clearError } = useAuthStore();

  // Clear errors when navigating between auth screens
  useFocusEffect(
    useCallback(() => {
      clearError();
    }, [clearError])
  );

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}

