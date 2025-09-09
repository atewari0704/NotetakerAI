import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, useTaskStore, useUIStore } from '@/stores';
import { Card } from '@/components/ui';
import { ChatModal } from '@/components/features/chat';
import { TaskDetailModal } from '@/components/features/tasks';

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
    if (pendingTasks.length === 0) {
      Alert.alert('No Tasks', 'Please add some tasks before starting a focus session');
      return;
    }
    
    // If only one task, go directly to focus session
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
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="What needs to be done?"
                value={newTask}
                onChangeText={setNewTask}
                style={[styles.taskInput, isAddingTask && styles.taskInputDisabled]}
                onSubmitEditing={handleAddTask}
                editable={!isAddingTask}
              />
              <TextInput
                placeholder="Add description (optional)"
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                style={[styles.descriptionInput, isAddingTask && styles.taskInputDisabled]}
                multiline
                numberOfLines={2}
                editable={!isAddingTask}
              />
            </View>
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
                    <TouchableOpacity 
                      key={task.id} 
                      style={styles.taskItem}
                      onPress={() => handleTaskPress(task)}
                    >
                      <TouchableOpacity 
                        style={styles.taskCheckbox}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                      >
                        <View style={[styles.checkboxCircle, { borderColor: getPriorityColor(task.priority) }]}>
                          <Text style={styles.checkboxText}>○</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        {task.description && (
                          <Text style={styles.taskDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}
                        <View style={styles.taskMeta}>
                          <View style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.priority) }]}>
                            <Text style={styles.priorityText}>Priority {task.priority}</Text>
                          </View>
                          {task.tags && task.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                  <Text style={styles.tagText}>{tag}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
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
                    <TouchableOpacity 
                      key={task.id} 
                      style={styles.taskItem}
                      onPress={() => handleTaskPress(task)}
                    >
                      <TouchableOpacity 
                        style={styles.taskCheckbox}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                      >
                        <View style={[styles.checkboxCircle, { borderColor: '#f59e0b' }]}>
                          <Text style={styles.checkboxText}>○</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.taskContent}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        {task.description && (
                          <Text style={styles.taskDescription} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}
                        <View style={styles.taskMeta}>
                          <View style={[styles.statusTag, { backgroundColor: '#f59e0b' }]}>
                            <Text style={styles.statusText}>In Progress</Text>
                          </View>
                          {task.tags && task.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                  <Text style={styles.tagText}>{tag}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {completedTasks.length > 0 && (
                <View style={styles.taskSection}>
                  <Text style={styles.taskSectionTitle}>Completed ({completedTasks.length})</Text>
                  {completedTasks.slice(0, 2).map((task) => (
                    <TouchableOpacity 
                      key={task.id} 
                      style={[styles.taskItem, styles.completedTaskItem]}
                      onPress={() => handleTaskPress(task)}
                    >
                      <View style={styles.taskCheckbox}>
                        <View style={[styles.checkboxCircle, styles.completedCheckbox]}>
                          <Text style={styles.completedCheckboxText}>✓</Text>
                        </View>
                      </View>
                      <View style={styles.taskContent}>
                        <Text style={[styles.taskTitle, styles.completedTaskTitle]}>{task.title}</Text>
                        {task.description && (
                          <Text style={[styles.taskDescription, styles.completedTaskDescription]} numberOfLines={2}>
                            {task.description}
                          </Text>
                        )}
                        <View style={styles.taskMeta}>
                          <View style={[styles.statusTag, { backgroundColor: '#10b981' }]}>
                            <Text style={styles.statusText}>Completed</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id, task.title);
                            }}
                          >
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
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
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={cancelDeleteTask}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={confirmDeleteTask}
              >
                <Text style={styles.modalConfirmButtonText}>Remove</Text>
              </TouchableOpacity>
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
              <TouchableOpacity 
                onPress={handleAddTaskFromModal}
                disabled={isAddingTask || !modalTaskTitle.trim()}
              >
                <Text style={[
                  styles.addTaskModalSave,
                  (!modalTaskTitle.trim() || isAddingTask) && styles.addTaskModalSaveDisabled
                ]}>
                  {isAddingTask ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.fab}
        onPress={handleFabPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  quickAddForm: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    gap: 8,
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
  },
  taskInputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  addButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chatCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
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
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
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
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
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
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: '#ffffff',
  },
  completedTaskItem: {
    opacity: 0.6,
  },
  taskCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: '#d1d5db',
  },
  completedCheckbox: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  checkboxText: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'normal',
  },
  completedCheckboxText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'normal',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 2,
    lineHeight: 20,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 18,
  },
  completedTaskDescription: {
    color: '#9ca3af',
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
    backgroundColor: '#f3f4f6',
  },
  priorityText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '400',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '400',
  },
  moreTasks: {
    fontSize: 14,
    color: '#6366f1',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  focusCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  focusDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  focusButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#64748b',
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
    backgroundColor: '#f1f5f9',
  },
  modalCancelButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  modalConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  modalConfirmButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
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
});