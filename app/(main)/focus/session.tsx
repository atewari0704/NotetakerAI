import React from 'react';
import { FocusSession } from '@/components/features/focus';
import { useLocalSearchParams } from 'expo-router';

export default function FocusSessionScreen() {
  const { taskId, duration } = useLocalSearchParams();
  
  return (
    <FocusSession
      taskId={taskId as string}
      targetDuration={duration ? parseInt(duration as string) : 25}
    />
  );
}
