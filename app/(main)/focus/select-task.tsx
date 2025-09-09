import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTaskStore } from '@/stores';
import { Card } from '@/components/ui';

export default function SelectTaskScreen() {
  const { tasks, fetchTasks, getPendingTasks } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const pendingTasks = getPendingTasks();

  const handleStartFocus = () => {
    if (!selectedTaskId) {
      return;
    }
    
    // Navigate to focus session with selected task
    router.push(`/(main)/focus/session?taskId=${selectedTaskId}&duration=25`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Focus Task</Text>
          <Text style={styles.subtitle}>Select a task to start your focus session</Text>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {pendingTasks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending tasks available</Text>
              <Text style={styles.emptySubtext}>Add some tasks to start focusing</Text>
            </Card>
          ) : (
            pendingTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  selectedTaskId === task.id && styles.selectedTaskCard
                ]}
                onPress={() => setSelectedTaskId(task.id)}
              >
                <View style={styles.taskContent}>
                  <Text style={[
                    styles.taskTitle,
                    selectedTaskId === task.id && styles.selectedTaskTitle
                  ]}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskPriority}>Priority: {task.priority}</Text>
                    <Text style={styles.taskStatus}>Status: {task.status}</Text>
                  </View>
                </View>
                {selectedTaskId === task.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedTaskId && styles.disabledButton
            ]}
            onPress={handleStartFocus}
            disabled={!selectedTaskId}
          >
            <Text style={styles.startButtonText}>
              {selectedTaskId ? 'Start Focus Session' : 'Select a Task First'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
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
  taskList: {
    marginBottom: 32,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedTaskCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  selectedTaskTitle: {
    color: '#1d4ed8',
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskPriority: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  taskStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    gap: 16,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 16,
  },
});

