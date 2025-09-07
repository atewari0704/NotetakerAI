import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatsCard } from './StatsCard';
import { ProductivityChart } from './ProductivityChart';
import { StreakCounter } from './StreakCounter';
import { useAnalyticsStore, useFocusStore, useTaskStore } from '@/stores';

type TimePeriod = 'week' | 'month';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [isLoading, setIsLoading] = useState(true);

  const { 
    userAnalytics, 
    fetchAnalytics, 
    getProductivityScore,
    getFocusTimeTrend,
    getSessionTrend,
    getTaskTrend 
  } = useAnalyticsStore();
  
  const { getTodaySessions, getTotalFocusTimeToday } = useFocusStore();
  const { tasks } = useTaskStore();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      await fetchAnalytics(selectedPeriod);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Don't show error alert since we're using mock data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const todaySessions = getTodaySessions();
  const todayFocusTime = getTotalFocusTimeToday();
  const completedTasksToday = tasks.filter(t => 
    t.status === 'completed' && 
    t.completed_at && 
    new Date(t.completed_at).toDateString() === new Date().toDateString()
  ).length;

  const productivityScore = getProductivityScore();
  const focusTimeTrend = getFocusTimeTrend(selectedPeriod);
  const sessionTrend = getSessionTrend(selectedPeriod);
  const taskTrend = getTaskTrend(selectedPeriod);

  // Mock data for charts (in real app, this would come from analytics store)
  const mockChartData = {
    week: {
      focus_time: [
        { date: 'Mon', value: 45, label: 'M' },
        { date: 'Tue', value: 60, label: 'T' },
        { date: 'Wed', value: 30, label: 'W' },
        { date: 'Thu', value: 75, label: 'T' },
        { date: 'Fri', value: 90, label: 'F' },
        { date: 'Sat', value: 25, label: 'S' },
        { date: 'Sun', value: 40, label: 'S' },
      ],
      sessions: [
        { date: 'Mon', value: 2, label: 'M' },
        { date: 'Tue', value: 3, label: 'T' },
        { date: 'Wed', value: 1, label: 'W' },
        { date: 'Thu', value: 4, label: 'T' },
        { date: 'Fri', value: 5, label: 'F' },
        { date: 'Sat', value: 1, label: 'S' },
        { date: 'Sun', value: 2, label: 'S' },
      ],
      tasks: [
        { date: 'Mon', value: 3, label: 'M' },
        { date: 'Tue', value: 5, label: 'T' },
        { date: 'Wed', value: 2, label: 'W' },
        { date: 'Thu', value: 6, label: 'T' },
        { date: 'Fri', value: 4, label: 'F' },
        { date: 'Sat', value: 1, label: 'S' },
        { date: 'Sun', value: 3, label: 'S' },
      ],
    },
    month: {
      focus_time: [
        { date: 'Week 1', value: 320, label: 'W1' },
        { date: 'Week 2', value: 450, label: 'W2' },
        { date: 'Week 3', value: 380, label: 'W3' },
        { date: 'Week 4', value: 520, label: 'W4' },
      ],
      sessions: [
        { date: 'Week 1', value: 12, label: 'W1' },
        { date: 'Week 2', value: 18, label: 'W2' },
        { date: 'Week 3', value: 15, label: 'W3' },
        { date: 'Week 4', value: 22, label: 'W4' },
      ],
      tasks: [
        { date: 'Week 1', value: 18, label: 'W1' },
        { date: 'Week 2', value: 25, label: 'W2' },
        { date: 'Week 3', value: 20, label: 'W3' },
        { date: 'Week 4', value: 28, label: 'W4' },
      ],
    },
  };

  const handleStartFocus = () => {
    router.push('/(main)/focus/session');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Data Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoNoticeText}>
          📊 Showing demo data - Start focus sessions to see your real analytics!
        </Text>
      </View>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            title="Focus Time"
            value={`${todayFocusTime}m`}
            subtitle="Minutes focused"
            icon="⏱️"
            color="#10b981"
          />
          <StatsCard
            title="Sessions"
            value={todaySessions.length}
            subtitle="Focus sessions"
            icon="🎯"
            color="#6366f1"
          />
          <StatsCard
            title="Tasks Done"
            value={completedTasksToday}
            subtitle="Completed today"
            icon="✅"
            color="#f59e0b"
          />
          <StatsCard
            title="Productivity"
            value={productivityScore.toFixed(1)}
            subtitle="Score out of 10"
            icon="📈"
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Streak Counter */}
      <StreakCounter
        currentStreak={userAnalytics?.streak_days || 0}
        longestStreak={userAnalytics?.streak_days || 0} // TODO: Add longest streak to analytics
        lastActiveDate={userAnalytics?.date ? new Date(userAnalytics.date) : undefined}
      />

      {/* Charts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Time Trend</Text>
        <ProductivityChart
          title=""
          data={mockChartData[selectedPeriod].focus_time}
          type="focus_time"
          period={selectedPeriod}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sessions Completed</Text>
        <ProductivityChart
          title=""
          data={mockChartData[selectedPeriod].sessions}
          type="sessions"
          period={selectedPeriod}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks Completed</Text>
        <ProductivityChart
          title=""
          data={mockChartData[selectedPeriod].tasks}
          type="tasks"
          period={selectedPeriod}
        />
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleStartFocus}>
        <Text style={styles.actionButtonText}>Start Focus Session</Text>
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#1e293b',
  },
  demoNotice: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  demoNoticeText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
