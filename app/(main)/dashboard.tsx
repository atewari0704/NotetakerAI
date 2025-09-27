import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TextInput, TouchableOpacity, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore, useTaskStore, useUIStore } from '@/stores';
import { useAuthListener } from '@/hooks/useAuthListener';
import { Card, Logo, HoverButton, HoverTouchable, HoverCheckbox, FloatingActionButton, FocusSessionButton, PriorityButton, TaskIcon, CustomDatePicker } from '@/components/ui';
import { ChatModal } from '@/components/features/chat';
import { TaskDetailModal } from '@/components/features/tasks';
import { colors } from '@/config';
import { useButtonHover } from '@/hooks';
import * as Haptics from 'expo-haptics';

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
  const [modalTaskDate, setModalTaskDate] = useState<Date | null>(null);
  const [showModalDatePicker, setShowModalDatePicker] = useState(false);
  
  // Inline task creation state
  const [showInlineTaskForm, setShowInlineTaskForm] = useState(false);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');
  const [inlineTaskDescription, setInlineTaskDescription] = useState('');
  const [inlineTaskPriority, setInlineTaskPriority] = useState<number | null>(null);
  const [inlineTaskDate, setInlineTaskDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { user, logout, isLoading: authLoading } = useAuthStore();
  const { 
    tasks, 
    isLoading, 
    createTask, 
    updateTask,
    deleteTask,
    fetchTasks, 
    getPendingTasks, 
    getInProgressTasks,
    getCompletedTasks,
    forceClearLoading
  } = useTaskStore();
  const { openModal, closeModal, modals } = useUIStore();
  
  // Initialize auth listener - this handles all auth state management
  useAuthListener();
  
  // Authentication check - redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No user found, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [authLoading, user]);

  console.log('Auth state check:', { authLoading, user: !!user });
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fallback timeout to prevent loading state from getting stuck
  useEffect(() => {
    if (isLoading) {
      const fallbackTimeout = setTimeout(() => {
        console.log('Loading timeout fallback triggered - forcing clear');
        forceClearLoading();
      }, 8000); // 8 second fallback timeout

      return () => clearTimeout(fallbackTimeout);
    }
  }, [isLoading, forceClearLoading]);

  // CONDITIONAL RETURN AFTER ALL HOOKS
  if (authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </View>
    );
  }

  // Auto-show inline form when there are no tasks
  // Removed auto-show form when no tasks - user should click button to add tasks

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
      case 1: return '#dc2626'; // Red for High priority
      case 2: return '#f59e0b'; // Yellow/Orange for Medium priority
      case 3: return '#10b981'; // Green for Low priority
      default: return '#d1d5db';
    }
  };

  const handleFabPress = () => {
    setShowAddTaskModal(true);
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
    await updateTask(taskId, { status: 'completed' });
    await fetchTasks(); // Refresh the task list
  };

  const handleModalDatePress = () => {
    console.log('Modal date button pressed, current date:', modalTaskDate);
    if (modalTaskDate) {
      setModalTaskDate(null);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } else {
      setShowModalDatePicker(true);
    }
  };

  const handleModalDateChange = (selectedDate: Date) => {
    console.log('Modal date selected:', selectedDate);
    setModalTaskDate(selectedDate);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    setShowModalDatePicker(false);
  };
  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false);
    setModalTaskTitle('');
    setModalTaskDescription('');
    setModalTaskPriority(2);
    setModalTaskDate(null);
  };

  const handleAddInlineTask = async () => {
    console.log('=== TASK CREATION DEBUG START ===');
    console.log('handleAddInlineTask function called');
    console.log('Form data:', {
      title: inlineTaskTitle,
      description: inlineTaskDescription,
      priority: inlineTaskPriority,
      dueDate: inlineTaskDate,
      user: user?.id
    });
    
    if (!inlineTaskTitle.trim()) {
      console.log('No title provided, returning early');
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    if (!user) {
      console.log('No user found, showing alert');
      Alert.alert('Error', 'You must be logged in to create tasks');
      return;
    }
    
    console.log('User found, proceeding with task creation');
    setIsAddingTask(true);
    
    try {
      console.log('About to call createTask with timeout protection');
      
      // Add timeout protection to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task creation timeout')), 10000); // 10 second timeout
      });
      
      const createTaskPromise = createTask({
        title: inlineTaskTitle.trim(),
        description: inlineTaskDescription.trim() || undefined,
        priority: inlineTaskPriority || 2,
        due_date: inlineTaskDate || undefined,
        tags: [],
        ai_metadata: {},
      });
      
      console.log('Starting race between createTask and timeout');
      // Race between task creation and timeout
      const result = await Promise.race([createTaskPromise, timeoutPromise]);
      console.log('Task creation completed successfully:', result);
      
      // Reset form immediately for better UX
      setInlineTaskTitle('');
      setInlineTaskDescription('');
      setInlineTaskPriority(null);
      setInlineTaskDate(null);
      setShowInlineTaskForm(false);
      
      console.log('Form reset completed, starting background refresh');
      // Refresh tasks in background with timeout protection
      setTimeout(() => {
        fetchTasks().catch(error => {
          console.error('Failed to refresh tasks:', error);
          // Don't show error to user for refresh failure
        });
      }, 100); // Small delay to ensure task is created first
      
    } catch (error: any) {
      console.error('=== TASK CREATION ERROR ===');
      console.error('Failed to create task:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Failed to create task';
      if (error.message === 'Task creation timeout') {
        errorMessage = 'Task creation timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      console.log('Setting isAddingTask to false');
      setIsAddingTask(false);
      console.log('=== TASK CREATION DEBUG END ===');
    }
  };

  const handleCancelInlineTask = () => {
    setInlineTaskTitle('');
    setInlineTaskDescription('');
    setInlineTaskPriority(null);
    setInlineTaskDate(null);
    setShowInlineTaskForm(false);
  };

  const handleDateChange = (selectedDate: Date) => {
    console.log('Date selected:', selectedDate);
    setInlineTaskDate(selectedDate);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const handleDatePress = () => {
    console.log('Date button pressed, current date:', inlineTaskDate);
    if (inlineTaskDate) {
      setInlineTaskDate(null);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } else {
      setShowDatePicker(true);
    }
  };

  const handlePriorityPress = () => {
    console.log('Priority button pressed, current priority:', inlineTaskPriority);
    setShowPriorityPicker(true);
  };

  const handlePrioritySelect = (priority: number) => {
    console.log('Priority selected:', priority);
    setInlineTaskPriority(priority);
    setShowPriorityPicker(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Medium';
    }
  };

  const handleAddTaskFromModal = async () => {
    if (!modalTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    console.log('Adding modal task:', {
      title: modalTaskTitle.trim(),
      description: modalTaskDescription.trim(),
      priority: modalTaskPriority,
      dueDate: modalTaskDate
    });

    try {
      setIsAddingTask(true);
      
      // Add timeout protection to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task creation timeout')), 10000); // 10 second timeout
      });
      
      const createTaskPromise = createTask({ 
        title: modalTaskTitle.trim(),
        description: modalTaskDescription.trim() || undefined,
        priority: modalTaskPriority,
        due_date: modalTaskDate || undefined,
        tags: [],
        ai_metadata: {},
      });
      
      // Race between task creation and timeout
      await Promise.race([createTaskPromise, timeoutPromise]);
      
      console.log('Modal task created successfully');
      
      // Close modal immediately for better UX
      handleCloseAddTaskModal();
      
      // Refresh tasks in background with timeout protection
      setTimeout(() => {
        fetchTasks().catch(error => {
          console.error('Failed to refresh tasks:', error);
          // Don't show error to user for refresh failure
        });
      }, 100); // Small delay to ensure task is created first
      
    } catch (error: any) {
      console.error('Failed to create task:', error);
      
      let errorMessage = 'Failed to create task';
      if (error.message === 'Task creation timeout') {
        errorMessage = 'Task creation timed out. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
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
                <Logo size={160} />
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
        <Card style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Your Tasks ({pendingTasks.length})</Text>
          </View>
          
          {/* Add Task Button - Always visible and left-aligned */}
          {!showInlineTaskForm && (
            <View style={styles.addTaskButtonContainer}>
              <HoverTouchable 
                onPress={() => {
                  console.log('Initial Add task button clicked - showing form');
                  setShowInlineTaskForm(true);
                }}
                style={styles.addTaskButton}
                hoverStyle={{ opacity: 0.8 }}
              >
                <Text style={styles.addTaskButtonIcon}>+</Text>
                <Text style={styles.addTaskButtonText}>Add task</Text>
              </HoverTouchable>
            </View>
          )}

          {/* Inline Task Creation Form */}
          {showInlineTaskForm && (
            <View style={styles.inlineTaskForm}>
              <TextInput
                placeholder="Enter task title..."
                value={inlineTaskTitle}
                onChangeText={setInlineTaskTitle}
                style={styles.inlineTaskTitleInput}
                autoFocus
                returnKeyType="next"
                blurOnSubmit={false}
                placeholderTextColor={colors.text.tertiary}
              />
              
              <TextInput
                placeholder="Enter task description..."
                value={inlineTaskDescription}
                onChangeText={setInlineTaskDescription}
                style={styles.inlineTaskDescriptionInput}
                multiline
                numberOfLines={2}
                returnKeyType="done"
                placeholderTextColor={colors.text.tertiary}
              />
              
              {/* Date and Priority Buttons */}
              <View style={styles.inlineTaskMetaButtons}>
                <HoverTouchable 
                  style={styles.inlineTaskMetaButton}
                  hoverStyle={{ opacity: 0.8 }}
                  onPress={handleDatePress}
                >
                  <TaskIcon name="calendar" size={16} color={colors.text.secondary} />
                  <Text style={styles.inlineTaskMetaButtonText}>
                    {inlineTaskDate ? formatDate(inlineTaskDate) : 'Date'}
                  </Text>
                </HoverTouchable>
                
                <HoverTouchable 
                  style={styles.inlineTaskMetaButton}
                  hoverStyle={{ opacity: 0.8 }}
                  onPress={handlePriorityPress}
                >
                  <TaskIcon name="flag" size={16} color={colors.text.secondary} />
                  <Text style={styles.inlineTaskMetaButtonText}>
                    {inlineTaskPriority ? getPriorityText(inlineTaskPriority) : 'Priority'}
                  </Text>
                </HoverTouchable>
              </View>

              {/* Action Buttons */}
              <View style={styles.inlineTaskActions}>
                <HoverButton
                  title="Cancel"
                  onPress={handleCancelInlineTask}
                  variant="secondary"
                  size="small"
                  style={styles.inlineTaskCancelButton}
                  textStyle={styles.inlineTaskCancelButtonText}
                />
                <HoverButton
                  title={isAddingTask ? 'Adding...' : 'Add task'}
                  onPress={() => {
                    console.log('Form Add task button clicked - creating task');
                    handleAddInlineTask();
                  }}
                  disabled={isAddingTask || !inlineTaskTitle.trim()}
                  variant="primary"
                  size="small"
                  style={styles.inlineTaskAddButton}
                />
              </View>
            </View>
          )}
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading tasks...</Text>
          ) : (
            <ScrollView 
              style={styles.tasksScrollContainer}
              contentContainerStyle={styles.tasksList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
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
              
            </ScrollView>
          )}
        </Card>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <Card style={styles.completedTasksCard}>
            <View style={styles.completedTasksHeader}>
              <Text style={styles.completedTasksTitle}>Completed ({completedTasks.length})</Text>
            </View>
            <ScrollView 
              style={styles.completedTasksScrollContainer}
              contentContainerStyle={styles.completedTasksList}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
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
            </ScrollView>
          </Card>
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
            {pendingTasks.length > 0 
              ? "Start a focused work session to tackle your most important task."
              : "Start a general focus session to work on anything you need to focus on."
            }
          </Text>
          <HoverButton
            title={pendingTasks.length > 0 ? "Start Focus Session" : "Start General Focus"}
            onPress={handleStartFocus}
            variant="primary"
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
                variant="primary"
                size="small"
                customBaseColor="rgba(242, 150, 0, 0.72)"
                customHoverColor="rgba(242, 150, 0, 0.9)"
                style={styles.modalCancelButton}
                textStyle={styles.modalCancelButtonText}
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
                    <PriorityButton
                      key={priority}
                      priority={priority}
                      isSelected={modalTaskPriority === priority}
                      onPress={() => setModalTaskPriority(priority)}
                    />
                  ))}
                </View>
              </View>

              {/* Date Selector */}
              <View style={styles.addTaskModalDateSection}>
                <Text style={styles.addTaskModalDateLabel}>Due Date (Optional)</Text>
                <HoverTouchable 
                  style={styles.addTaskModalDateButton}
                  hoverStyle={{ opacity: 0.8 }}
                  onPress={handleModalDatePress}
                >
                  <TaskIcon name="calendar" size={16} color={colors.text.secondary} />
                  <Text style={styles.addTaskModalDateButtonText}>
                    {modalTaskDate ? formatDate(modalTaskDate) : 'Select Date'}
                  </Text>
                </HoverTouchable>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal Date Picker */}
      <CustomDatePicker
        visible={showModalDatePicker}
        onClose={() => setShowModalDatePicker(false)}
        onDateSelect={handleModalDateChange}
        selectedDate={modalTaskDate || undefined}
      />

      {/* Floating Action Button - Hidden in favor of inline Add Task button */}
      {/* <FloatingActionButton
        onPress={handleFabPress}
        style={styles.fab}
      /> */}

      {/* Focus Session Button */}
      <FocusSessionButton
        onPress={handleStartFocus}
        style={styles.focusSessionButton}
      />

      {/* Add Task Floating Action Button */}
      <FloatingActionButton
        onPress={handleFabPress}
        icon="+"
        style={styles.addTaskFab}
      />

      {/* Custom Date Picker */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateChange}
        selectedDate={inlineTaskDate || undefined}
      />

      {/* Priority Picker Modal */}
      {showPriorityPicker && (
        <Modal
          visible={showPriorityPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPriorityPicker(false)}
        >
          <TouchableOpacity 
            style={styles.priorityPickerOverlay}
            activeOpacity={1}
            onPress={() => setShowPriorityPicker(false)}
          >
            <TouchableOpacity 
              style={styles.priorityPickerContainer}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.priorityPickerTitle}>Select Priority</Text>
              <View style={styles.priorityPickerOptions}>
                {[1, 2, 3].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityPickerOption,
                      inlineTaskPriority === priority && styles.priorityPickerOptionSelected
                    ]}
                    onPress={() => handlePrioritySelect(priority)}
                  >
                    <View style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(priority) }
                    ]} />
                    <Text style={[
                      styles.priorityPickerOptionText,
                      inlineTaskPriority === priority && styles.priorityPickerOptionTextSelected
                    ]}>
                      {getPriorityText(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
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
    paddingTop: 20,
    paddingBottom: 120,
    paddingRight: 20,
    paddingLeft: 0,
  },
  header: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 0,
    paddingRight: 28,
    marginBottom: 20,
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
    marginLeft: -8,
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
  tasksCard: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  tasksContainer: {
    marginBottom: 24,
  },
  tasksHeader: {
    marginBottom: 20,
  },
  addTaskButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.button.primary,
    gap: 8,
    minHeight: 44,
    minWidth: 120,
  },
  addTaskButtonIcon: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  addTaskButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  inlineTaskForm: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inlineTaskTitleInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    minHeight: 50,
  },
  inlineTaskDescriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inlineTaskDescriptionInput: {
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  inlineTaskMetaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inlineTaskMetaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    gap: 6,
  },
  inlineTaskMetaButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  inlineTaskActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  inlineTaskCancelButton: {
    backgroundColor: colors.button.primary, // Orange Cancel button
    borderColor: colors.button.primary,
  },
  inlineTaskCancelButtonText:{
    color: colors.text.inverse, //white text
  }
  ,
  inlineTaskAddButton: {
    backgroundColor: colors.button.primary, // Orange Add task button
    borderColor: colors.button.primary,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  tasksScrollContainer: {
    maxHeight: 300, // Maximum height before scrolling
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
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
  },
  modalCancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
  addTaskModalDateSection: {
    marginBottom: 24,
  },
  addTaskModalDateLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  addTaskModalDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  addTaskModalDateButtonText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 8,
  },
  completedTasksCard: {
    marginBottom: 16,
    backgroundColor: colors.background.primary,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  completedTasksHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  completedTasksScrollContainer: {
    maxHeight: 200, // Maximum height before scrolling
  },
  completedTasksList: {
    gap: 0,
  },
  fab: {
    bottom: 20,
    right: 20,
  },
  addTaskFab: {
    bottom: 20,
    right: 20,
  },
  focusSessionButton: {
    bottom: 20,
    left: 20,
  },
  priorityPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityPickerContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  priorityPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  priorityPickerOptions: {
    gap: 12,
  },
  priorityPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  priorityPickerOptionSelected: {
    backgroundColor: colors.primary.light,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityPickerOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  priorityPickerOptionTextSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});