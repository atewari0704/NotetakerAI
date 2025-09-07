import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { FocusTimer } from './FocusTimer';
import { useFocusStore, useTaskStore } from '@/stores';
import { Task } from '@/types/tasks';

interface FocusSessionProps {
  taskId?: string;
  targetDuration?: number;
}

export const FocusSession: React.FC<FocusSessionProps> = ({
  taskId,
  targetDuration = 25,
}) => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  
  const { 
    startSession, 
    pauseSession, 
    resumeSession, 
    endSession,
    currentSession,
    isActive,
    isPaused 
  } = useFocusStore();
  
  const { tasks, updateTask } = useTaskStore();

  useEffect(() => {
    // Find the current task
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      setCurrentTask(task || null);
    } else {
      // Get the highest priority pending task
      const pendingTasks = tasks.filter(t => t.status === 'pending');
      const highestPriorityTask = pendingTasks.sort((a, b) => b.priority - a.priority)[0];
      setCurrentTask(highestPriorityTask || null);
    }
  }, [taskId, tasks]);

  const handleStartSession = async () => {
    if (!currentTask) {
      Alert.alert('No Task', 'Please select a task to focus on');
      return;
    }

    try {
      await startSession({
        task_id: currentTask.id,
        session_name: `Focus on: ${currentTask.title}`,
        target_duration: targetDuration,
      });
      setSessionStarted(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', 'Failed to start focus session');
    }
  };

  const handleSessionComplete = async () => {
    try {
      // Mark task as in progress or completed
      if (currentTask) {
        await updateTask(currentTask.id, { status: 'in_progress' });
      }

      // End the session
      await endSession({
        status: 'completed',
        end_time: new Date(),
        duration_minutes: Math.floor(targetDuration),
      });

      // Navigate to session summary
      router.push('/(main)/focus/summary');
    } catch (error) {
      console.error('Failed to complete session:', error);
      Alert.alert('Error', 'Failed to complete session');
    }
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleResume = () => {
    resumeSession();
  };

  const handleEndSession = () => {
    setShowEndModal(true);
  };
  
  const confirmEndSession = async () => {
    try {
      // End the session properly
      await endSession({
        status: 'cancelled',
        end_time: new Date(),
        duration_minutes: Math.floor(targetDuration),
      });
      
      // Navigate back to dashboard
      router.back();
    } catch (error) {
      console.error('Failed to end session:', error);
      // Still navigate back even if there's an error
      router.back();
    } finally {
      setShowEndModal(false);
    }
  };
  
  const completeTaskAndEndSession = async () => {
    try {
      // Mark task as completed
      if (currentTask) {
        await updateTask(currentTask.id, { status: 'completed' });
      }
      
      // End the session properly
      await endSession({
        status: 'completed',
        end_time: new Date(),
        duration_minutes: Math.floor(targetDuration),
      });
      
      // Navigate back to dashboard
      router.back();
    } catch (error) {
      console.error('Failed to complete task and end session:', error);
      // Still navigate back even if there's an error
      router.back();
    } finally {
      setShowEndModal(false);
    }
  };
  
  const cancelEndSession = () => {
    setShowEndModal(false);
  };

  if (!sessionStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Ready to Focus?</Text>
          
          {currentTask ? (
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{currentTask.title}</Text>
              {currentTask.description && (
                <Text style={styles.taskDescription}>{currentTask.description}</Text>
              )}
              <View style={styles.taskMeta}>
                <Text style={styles.taskPriority}>Priority: {currentTask.priority}</Text>
                <Text style={styles.taskDuration}>Duration: {targetDuration} min</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noTaskCard}>
              <Text style={styles.noTaskText}>No tasks available</Text>
              <Text style={styles.noTaskSubtext}>Add some tasks to start focusing</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.startButton, !currentTask && styles.disabledButton]}
              onPress={handleStartSession}
              disabled={!currentTask}
            >
              <Text style={styles.startButtonText}>
                {currentTask ? 'Start Focus Session' : 'No Tasks Available'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.focusContainer}>
      {/* Current Task Display */}
      <View style={styles.taskHeader}>
        <Text style={styles.focusTaskTitle}>{currentTask?.title}</Text>
        <Text style={styles.focusTaskSubtext}>Stay focused on this task</Text>
      </View>

      {/* Timer */}
      <FocusTimer
        targetDuration={targetDuration}
        onComplete={handleSessionComplete}
        onPause={handlePause}
        onResume={handleResume}
      />

      {/* End Session Button */}
      <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
        <Text style={styles.endButtonText}>End Session</Text>
      </TouchableOpacity>
      
      {/* Custom End Session Confirmation Modal */}
      <Modal
        visible={showEndModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEndSession}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Focus Session</Text>
            <Text style={styles.modalMessage}>
              Choose how to end your focus session:
            </Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskInfoText}>📋 Task: "{currentTask?.title}"</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={cancelEndSession}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalEndButton}
                onPress={confirmEndSession}
              >
                <Text style={styles.modalEndButtonText}>End Session Only</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalCompleteButton}
                onPress={completeTaskAndEndSession}
              >
                <Text style={styles.modalCompleteButtonText}>✓ Complete & End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskPriority: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  taskDuration: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  noTaskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  noTaskText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  noTaskSubtext: {
    fontSize: 14,
    color: '#94a3b8',
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
    backgroundColor: '#374151',
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
    color: '#94a3b8',
    fontSize: 16,
  },
  focusContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  taskHeader: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 1,
  },
  focusTaskTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  focusTaskSubtext: {
    fontSize: 16,
    color: '#94a3b8',
  },
  endButton: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  endButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 22,
  },
  taskInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  taskInfoText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
  },
  modalCancelButtonText: {
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalEndButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    flex: 1,
  },
  modalEndButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 13,
  },
  modalCompleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#10b981',
    flex: 1,
  },
  modalCompleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
});
