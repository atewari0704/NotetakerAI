import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card } from '@/components/ui';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  lastActiveDate,
}) => {
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    return '💪';
  };

  const getStreakMessage = (streak: number): string => {
    if (streak >= 30) return 'Incredible! You\'re on fire!';
    if (streak >= 14) return 'Amazing consistency!';
    if (streak >= 7) return 'Great streak! Keep it up!';
    if (streak >= 3) return 'Good start! Building momentum!';
    return 'Every day counts!';
  };

  const getDaysSinceLastActive = (): number => {
    if (!lastActiveDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceLastActive = getDaysSinceLastActive();
  const isStreakActive = daysSinceLastActive <= 1;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Streak</Text>
        <Text style={styles.emoji}>{getStreakEmoji(currentStreak)}</Text>
      </View>

      <View style={styles.streakContainer}>
        <View style={styles.currentStreak}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.longestStreak}>
          <Text style={styles.streakNumber}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
        </View>
      </View>

      <Text style={styles.message}>{getStreakMessage(currentStreak)}</Text>

      {!isStreakActive && daysSinceLastActive > 1 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            {daysSinceLastActive === 1 
              ? 'Streak broken yesterday' 
              : `Streak broken ${daysSinceLastActive} days ago`
            }
          </Text>
          <Text style={styles.warningSubtext}>
            Start a focus session to begin a new streak!
          </Text>
        </View>
      )}

      {isStreakActive && (
        <View style={styles.activeContainer}>
          <Text style={styles.activeText}>
            {currentStreak === 0 
              ? 'Start your first focus session today!'
              : 'Keep the momentum going!'
            }
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  emoji: {
    fontSize: 24,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  currentStreak: {
    alignItems: 'center',
    flex: 1,
  },
  longestStreak: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  message: {
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  warningContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 12,
    color: '#b91c1c',
    textAlign: 'center',
  },
  activeContainer: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  activeText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
    textAlign: 'center',
  },
});
