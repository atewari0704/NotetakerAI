import { Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/stores';
import { useCallback } from 'react';

export default function MainLayout() {
  const { clearError } = useAuthStore();

  // Clear errors when navigating between main screens
  useFocusEffect(
    useCallback(() => {
      clearError();
    }, [clearError])
  );

  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="analytics" options={{ headerShown: false }} />
      <Stack.Screen 
        name="focus/select-task" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="focus/session" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
      <Stack.Screen 
        name="focus/summary" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}
