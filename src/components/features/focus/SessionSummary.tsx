import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusStore, useTaskStore } from '@/stores';
import { Card } from '@/components/ui';

export const SessionSummary: React.FC = () => {
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [productivityRating, setProductivityRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  
  const { currentSession, endSession } = useFocusStore();
  const { tasks } = useTaskStore();

  const currentTask = tasks.find(t => t.id === currentSession?.task_id);

  const handleComplete = async () => {
    try {
      await endSession({
        mood_rating: moodRating || undefined,
        productivity_rating: productivityRating || undefined,
        notes: notes || undefined,
      });

      // Navigate back to dashboard
      router.replace('/(main)/dashboard');
    } catch (error) {
      console.error('Failed to complete session:', error);
      Alert.alert('Error', 'Failed to save session data');
    }
  };

  const handleSkip = () => {
    router.replace('/(main)/dashboard');
  };

  const getDurationText = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const RatingButton: React.FC<{ value: number; selected: boolean; onPress: () => void }> = ({
    value,
    selected,
    onPress,
  }) => (
    <TouchableOpacity
      style={[styles.ratingButton, selected && styles.ratingButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Session Complete! 🎉</Text>
        <Text style={styles.subtitle}>Great job staying focused</Text>
      </View>

      {/* Session Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Session Summary</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Task:</Text>
          <Text style={styles.statValue}>{currentTask?.title || 'No task'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Duration:</Text>
          <Text style={styles.statValue}>
            {currentSession ? getDurationText(currentSession.duration_minutes || 0) : '0 minutes'}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Status:</Text>
          <Text style={styles.statValue}>Completed</Text>
        </View>
      </Card>

      {/* Mood Rating */}
      <Card style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>How do you feel? 😊</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <RatingButton
              key={value}
              value={value}
              selected={moodRating === value}
              onPress={() => setMoodRating(value)}
            />
          ))}
        </View>
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabel}>Tired</Text>
          <Text style={styles.ratingLabel}>Energized</Text>
        </View>
      </Card>

      {/* Productivity Rating */}
      <Card style={styles.ratingCard}>
        <Text style={styles.ratingTitle}>How productive were you? 📈</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <RatingButton
              key={value}
              value={value}
              selected={productivityRating === value}
              onPress={() => setProductivityRating(value)}
            />
          ))}
        </View>
        <View style={styles.ratingLabels}>
          <Text style={styles.ratingLabel}>Not productive</Text>
          <Text style={styles.ratingLabel}>Very productive</Text>
        </View>
      </Card>

      {/* Notes */}
      <Card style={styles.notesCard}>
        <Text style={styles.notesTitle}>Session Notes (Optional)</Text>
        <Text style={styles.notesSubtitle}>
          Any thoughts about this focus session?
        </Text>
        {/* Note: In a real app, you'd use a TextInput here */}
        <View style={styles.notesPlaceholder}>
          <Text style={styles.notesPlaceholderText}>
            Notes feature coming soon...
          </Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Save & Continue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Next Steps */}
      <Card style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>What's Next?</Text>
        <View style={styles.nextStepsOptions}>
          <TouchableOpacity 
            style={styles.nextStepButton}
            onPress={() => router.push('/(main)/focus/session')}
          >
            <Text style={styles.nextStepButtonText}>Start Another Session</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nextStepButton}
            onPress={() => router.push('/(main)/dashboard')}
          >
            <Text style={styles.nextStepButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  ratingCard: {
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  ratingButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  ratingTextSelected: {
    color: '#ffffff',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  notesSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  notesPlaceholder: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesPlaceholderText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 16,
  },
  nextStepsCard: {
    marginBottom: 16,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  nextStepsOptions: {
    gap: 12,
  },
  nextStepButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextStepButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
});
