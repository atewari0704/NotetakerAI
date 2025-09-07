import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, useTaskStore, useUIStore } from '@/stores';
import { Card } from '@/components/ui';
import { ChatModal } from '@/components/features/chat';

export default function DashboardScreen() {
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const { user, logout } = useAuthStore();
  const { 
    tasks, 
    isLoading, 
    createTask, 
    updateTask,
    deleteTask,
    fetchTasks, 
    getPendingTasks, 
    getInProgressTasks,
    getCompletedTasks 
  } = useTaskStore();
  const { openModal, closeModal, modals } = useUIStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    try {
      setIsAddingTask(true);
      await createTask({ title: newTask.trim() });
      setNewTask('');
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleStartFocus = () => {
    const pendingTasks = getPendingTasks();
    if (pendingTasks.length === 0) {
      Alert.alert('No Tasks', 'Please add some tasks before starting a focus session');
      return;
    }
    
    // Navigate to focus session
    router.push('/(main)/focus/session');
  };

  const handleChatWithAI = () => {
    openModal('chat');
  };

  const handleViewAnalytics = () => {
    router.push('/(main)/analytics');
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await updateTask(taskId, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      // Refresh tasks to show updated status
      await fetchTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Remove Task',
      `Are you sure you want to remove "${taskTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('=== DELETE TASK DEBUG START ===');
              console.log('Task ID:', taskId);
              console.log('Task Title:', taskTitle);
              console.log('Current tasks before delete:', tasks);
              
              await deleteTask(taskId);
              console.log('Delete task call completed');
              
              // Refresh tasks to show updated list
              await fetchTasks();
              console.log('Fetch tasks call completed');
              console.log('Current tasks after refresh:', tasks);
              console.log('=== DELETE TASK DEBUG END ===');
            } catch (error) {
              console.error('=== DELETE ERROR ===');
              console.error('Error details:', error);
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
              console.error('=== END DELETE ERROR ===');
              Alert.alert('Error', `Failed to remove task: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const pendingTasks = getPendingTasks();
  const inProgressTasks = getInProgressTasks();
  const completedTasks = getCompletedTasks();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Welcome back, {user?.full_name || 'User'}!
              </Text>
              <Text style={styles.subtitle}>
                Ready to focus on what matters?
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Add Task */}
        <Card style={styles.quickAddCard}>
          <Text style={styles.sectionTitle}>
            Quick Add Task
          </Text>
          <View style={styles.quickAddForm}>
            <TextInput
              placeholder="What needs to be done?"
              value={newTask}
              onChangeText={setNewTask}
              style={[styles.taskInput, isAddingTask && styles.taskInputDisabled]}
              onSubmitEditing={handleAddTask}
              editable={!isAddingTask}
            />
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={isAddingTask || !newTask.trim()}
              style={[styles.addButton, (!newTask.trim() || isAddingTask) && styles.buttonDisabled]}
            >
              <Text style={styles.addButtonText}>
                {isAddingTask ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Chat with AI */}
        <Card style={styles.chatCard}>
          <Text style={styles.sectionTitle}>
            Chat with AI
          </Text>
          <Text style={styles.chatDescription}>
            Get help with task planning and productivity insights.
          </Text>
          <TouchableOpacity
            onPress={handleChatWithAI}
            style={styles.chatButton}
          >
            <Text style={styles.chatButtonText}>
              Start Conversation
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>
            📊 Analytics
          </Text>
          <Text style={styles.analyticsDescription}>
            Track your productivity and focus session progress.
          </Text>
          <TouchableOpacity
            onPress={handleViewAnalytics}
            style={styles.analyticsButton}
          >
            <Text style={styles.analyticsButtonText}>
              View Analytics
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Tasks Overview */}
        <Card style={styles.tasksCard}>
          <Text style={styles.sectionTitle}>
            Your Tasks ({tasks.length})
          </Text>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading tasks...</Text>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No tasks yet. Add your first task above!
              </Text>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {pendingTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <Text style={styles.taskSectionTitle}>Pending ({pendingTasks.length})</Text>
                  {pendingTasks.slice(0, 3).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskPriority}>Priority: {task.priority}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={() => handleCompleteTask(task.id)}
                      >
                        <Text style={styles.completeButtonText}>✓</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {pendingTasks.length > 3 && (
                    <Text style={styles.moreTasks}>+{pendingTasks.length - 3} more</Text>
                  )}
                </View>
              )}

              {inProgressTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <Text style={styles.taskSectionTitle}>In Progress ({inProgressTasks.length})</Text>
                  {inProgressTasks.slice(0, 2).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskStatus}>In Progress</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={() => handleCompleteTask(task.id)}
                      >
                        <Text style={styles.completeButtonText}>✓</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {completedTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <Text style={styles.taskSectionTitle}>Completed ({completedTasks.length})</Text>
                  {completedTasks.slice(0, 2).map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskStatus}>Completed</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(task.id, task.title)}
                      >
                        <Text style={styles.deleteButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Focus Mode Button */}
        <Card style={styles.focusCard}>
          <Text style={styles.sectionTitle}>
            Ready to Focus?
          </Text>
          <Text style={styles.focusDescription}>
            Start a focused work session to tackle your most important task.
          </Text>
          <TouchableOpacity
            onPress={handleStartFocus}
            style={[styles.focusButton, pendingTasks.length === 0 && styles.buttonDisabled]}
            disabled={pendingTasks.length === 0}
          >
            <Text style={styles.focusButtonText}>
              Start Focus Session
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
      
      {/* Chat Modal */}
      <ChatModal
        visible={modals.chat}
        onClose={() => closeModal('chat')}
      />
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
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  quickAddCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickAddForm: {
    flexDirection: 'row',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  taskInputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chatCard: {
    marginBottom: 16,
  },
  chatDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  analyticsCard: {
    marginBottom: 16,
  },
  analyticsDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  analyticsButton: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tasksCard: {
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  tasksList: {
    gap: 16,
  },
  taskSection: {
    marginBottom: 16,
  },
  taskSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  taskItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  taskPriority: {
    fontSize: 14,
    color: '#64748b',
  },
  taskStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  moreTasks: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#10b981',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  focusCard: {
    marginBottom: 16,
  },
  focusDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  focusButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  focusButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
});