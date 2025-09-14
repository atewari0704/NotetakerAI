import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, useTaskStore, useUIStore } from '@/stores';
import { Card, Logo, HoverButton, HoverTouchable, HoverCheckbox, FloatingActionButton, FocusSessionButton } from '@/components/ui';
import { ChatModal } from '@/components/features/chat';
import { TaskDetailModal } from '@/components/features/tasks';
import { colors } from '@/config';
import { useButtonHover } from '@/hooks';

export default function DashboardScreen() {
  const [newTask, setNewTask] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{id: string, title: string} | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [modalTaskTitle, setModalTaskTitle] = useState('');
  const [modalTaskDescription, setModalTaskDescription] = useState('');
  const [modalTaskPriority, setModalTaskPriority] = useState(2);
  
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
      await createTask({ 
        title: newTask.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: 2, // Default medium priority
        tags: [], // Default empty tags
      });
      setNewTask('');
      setNewTaskDescription('');
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#dc2626'; // High priority - red
      case 2: return '#d1d5db'; // Medium priority - gray
      case 3: return '#d1d5db'; // Low priority - gray
      default: return '#d1d5db'; // Default - gray
    }
  };

  const handleStartFocus = () => {
    const pendingTasks = getPendingTasks();
    
    // If no tasks, start a general focus session
    if (pendingTasks.length === 0) {
      router.push('/(main)/focus/session?duration=25');
      return;
    }
    
    // If only one task, go directly to focus session with that task
    if (pendingTasks.length === 1) {
      router.push(`/(main)/focus/session?taskId=${pendingTasks[0].id}&duration=25`);
    } else {
      // Multiple tasks, go to selection screen
      router.push('/(main)/focus/select-task');
    }
  };

  const handleChatWithAI = () => {
    openModal('chat');
  };

  const handleTaskPress = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleCloseTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    await updateTask(taskId, updates);
    await fetchTasks(); // Refresh the task list
  };

  const handleDeleteTaskFromModal = async (taskId: string) => {
    await deleteTask(taskId);
    await fetchTasks(); // Refresh the task list
  };

  const handleCompleteTaskFromModal = async (taskId: string) => {
    await completeTask(taskId);
    await fetchTasks(); // Refresh the task list
  };

  const handleFabPress = () => {
    setShowAddTaskModal(true);
  };

  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false);
    setModalTaskTitle('');
    setModalTaskDescription('');
    setModalTaskPriority(2);
  };

  const handleAddTaskFromModal = async () => {
    if (!modalTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      setIsAddingTask(true);
      await createTask({ 
        title: modalTaskTitle.trim(),
        description: modalTaskDescription.trim() || undefined,
        priority: modalTaskPriority,
        tags: [],
      });
      handleCloseAddTaskModal();
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsAddingTask(false);
    }
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
    setTaskToDelete({ id: taskId, title: taskTitle });
    setShowDeleteModal(true);
  };
  
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      await fetchTasks();
    } catch (error: any) {
      alert(`Failed to remove task: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };
  
  const cancelDeleteTask = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
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
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Logo size={32} />
              </View>
              <View>
                <Text style={styles.greeting}>
                  Welcome back, {user?.full_name || 'User'}!
                </Text>
                <Text style={styles.subtitle}>
                  Ready to focus on what matters?
                </Text>
              </View>
            </View>
            <HoverTouchable 
              onPress={handleLogout} 
              style={styles.logoutButton}
              hoverStyle={{ opacity: 0.7 }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </HoverTouchable>
          </View>
        </View>



        {/* Tasks List */}
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Your Tasks ({tasks.length})</Text>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading tasks...</Text>
          ) : (
            <View style={styles.tasksList}>
              {/* Pending Tasks */}
              {pendingTasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <HoverCheckbox
                    style={styles.taskCheckbox}
                    onPress={() => handleCompleteTask(task.id)}
                  />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.description && (
                      <Text style={styles.taskDescription}>{task.description}</Text>
                    )}
                  </View>
                </View>
              ))}
              
            </View>
          )}
        </View>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <View style={styles.completedTasksContainer}>
            <Text style={styles.completedTasksTitle}>Completed ({completedTasks.length})</Text>
            <View style={styles.completedTasksList}>
              {completedTasks.map((task) => (
                <View key={task.id} style={[styles.taskItem, styles.completedTaskItem]}>
                  <View style={styles.taskCheckbox}>
                    <View style={[styles.checkboxCircle, styles.completedCheckbox]}>
                      <Text style={styles.completedCheckboxText}>✓</Text>
                    </View>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, styles.completedTaskTitle]}>{task.title}</Text>
                    {task.description && (
                      <Text style={[styles.taskDescription, styles.completedTaskDescription]}>{task.description}</Text>
                    )}
                  </View>
                  <HoverTouchable 
                    style={styles.removeButton}
                    onPress={() => handleDeleteTask(task.id, task.title)}
                    hoverStyle={{ opacity: 0.8 }}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </HoverTouchable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chat with AI */}
        <Card style={styles.chatCard}>
          <Text style={styles.sectionTitle}>
            Chat with AI
          </Text>
          <Text style={styles.chatDescription}>
            Get help with task planning and productivity insights.
          </Text>
          <HoverButton
            title="Start Conversation"
            onPress={handleChatWithAI}
            variant="success"
            fullWidth
          />
        </Card>

        {/* Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.sectionTitle}>
            📊 Analytics
          </Text>
          <Text style={styles.analyticsDescription}>
            Track your productivity and focus session progress.
          </Text>
          <HoverButton
            title="View Analytics"
            onPress={handleViewAnalytics}
            variant="primary"
            fullWidth
          />
        </Card>

        {/* Focus Mode Button */}
        <Card style={styles.focusCard}>
          <Text style={styles.sectionTitle}>
            Ready to Focus?
          </Text>
          <Text style={styles.focusDescription}>
            Start a focused work session to tackle your most important task.
          </Text>
          <HoverButton
            title="Start Focus Session"
            onPress={handleStartFocus}
            variant="primary"
            disabled={pendingTasks.length === 0}
            fullWidth
          />
        </Card>
      </ScrollView>
      
      {/* Chat Modal */}
      <ChatModal
        visible={modals.chat}
        onClose={() => closeModal('chat')}
      />
      
      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDeleteTask}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove Task</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to remove "{taskToDelete?.title}"? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <HoverButton
                title="Cancel"
                onPress={cancelDeleteTask}
                variant="secondary"
                size="small"
                style={{ flex: 1, marginRight: 8 }}
              />
              <HoverButton
                title="Remove"
                onPress={confirmDeleteTask}
                variant="danger"
                size="small"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={showTaskDetail}
        task={selectedTask}
        onClose={handleCloseTaskDetail}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTaskFromModal}
        onComplete={handleCompleteTaskFromModal}
      />

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseAddTaskModal}
      >
        <TouchableOpacity 
          style={styles.addTaskModalOverlay}
          activeOpacity={1}
          onPress={handleCloseAddTaskModal}
        >
          <TouchableOpacity 
            style={styles.addTaskModalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.addTaskModalHeader}>
              <TouchableOpacity onPress={handleCloseAddTaskModal}>
                <Text style={styles.addTaskModalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.addTaskModalTitle}>Add Task</Text>
              <HoverButton
                title={isAddingTask ? 'Adding...' : 'Add'}
                onPress={handleAddTaskFromModal}
                disabled={isAddingTask || !modalTaskTitle.trim()}
                variant="primary"
                size="small"
              />
            </View>

            {/* Content */}
            <View style={styles.addTaskModalContent}>
              <TextInput
                placeholder="What needs to be done?"
                value={modalTaskTitle}
                onChangeText={setModalTaskTitle}
                style={styles.addTaskModalTitleInput}
                autoFocus
              />
              <TextInput
                placeholder="Add description (optional)"
                value={modalTaskDescription}
                onChangeText={setModalTaskDescription}
                style={styles.addTaskModalDescriptionInput}
                multiline
                numberOfLines={3}
              />
              
              {/* Priority Selector */}
              <View style={styles.addTaskModalPrioritySection}>
                <Text style={styles.addTaskModalPriorityLabel}>Priority</Text>
                <View style={styles.addTaskModalPrioritySelector}>
                  {[1, 2, 3].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.addTaskModalPriorityOption,
                        modalTaskPriority === priority && styles.addTaskModalPriorityOptionSelected
                      ]}
                      onPress={() => setModalTaskPriority(priority)}
                    >
                      <Text style={[
                        styles.addTaskModalPriorityOptionText,
                        modalTaskPriority === priority && styles.addTaskModalPriorityOptionTextSelected
                      ]}>
                        {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleFabPress}
        style={styles.fab}
      />

      {/* Focus Session Button */}
      <FocusSessionButton
        onPress={handleStartFocus}
        style={styles.focusSessionButton}
        disabled={pendingTasks.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    padding: 24,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: colors.button.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 12,
  },
  chatCard: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  chatDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  chatButton: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  analyticsCard: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyticsDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  analyticsButton: {
    backgroundColor: colors.button.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  tasksContainer: {
    marginBottom: 16,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tasksList: {
    gap: 16,
  },
  taskSection: {
    marginBottom: 16,
  },
  taskSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  completedTaskItem: {
    // Remove opacity to make elements fully visible
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#000000',
  },
  completedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  completedCheckboxText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text.primary,
    marginBottom: 2,
    lineHeight: 20,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  taskDescription: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: 6,
    lineHeight: 18,
  },
  completedTaskDescription: {
    color: colors.text.tertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.primary.light,
  },
  priorityText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.primary.light,
  },
  statusText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  moreTasks: {
    fontSize: 14,
    color: colors.button.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  removeButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  removeButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '600',
  },
  focusCard: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  focusDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
  },
  focusButton: {
    backgroundColor: colors.button.primary,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  focusButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: colors.neutral.silver,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.primary.light,
  },
  modalCancelButtonText: {
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modalConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  modalConfirmButtonText: {
    color: colors.text.inverse,
    fontWeight: '500',
  },
  addTaskModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  addTaskModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  addTaskModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addTaskModalCancel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  addTaskModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addTaskModalSave: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  addTaskModalSaveDisabled: {
    color: '#9ca3af',
  },
  addTaskModalContent: {
    flex: 1,
    padding: 20,
  },
  addTaskModalTitleInput: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 16,
    marginBottom: 20,
  },
  addTaskModalDescriptionInput: {
    fontSize: 18,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 16,
    marginBottom: 28,
    textAlignVertical: 'top',
  },
  addTaskModalPrioritySection: {
    marginBottom: 24,
  },
  addTaskModalPriorityLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  addTaskModalPrioritySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  addTaskModalPriorityOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  addTaskModalPriorityOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  addTaskModalPriorityOptionText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  addTaskModalPriorityOptionTextSelected: {
    color: '#ffffff',
  },
  completedTasksContainer: {
    marginBottom: 16,
  },
  completedTasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  completedTasksList: {
    gap: 0,
  },
  fab: {
    bottom: 20,
    right: 20,
  },
  focusSessionButton: {
    bottom: 20,
    left: 20,
  },
});