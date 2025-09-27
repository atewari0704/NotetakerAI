import { create } from 'zustand';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/tasks';
import { taskApi } from '@/services/api/tasks';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: TaskCreateRequest) => Promise<Task>;
  updateTask: (id: string, updates: TaskUpdateRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
  forceClearLoading: () => void; // Add method to force clear loading state
  
  // Computed
  getPendingTasks: () => Task[];
  getInProgressTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByPriority: () => Task[];
}

export const useTaskStore = create<TaskState>()((set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,
      selectedTask: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          // Add timeout protection to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Fetch tasks timeout')), 5000); // 5 second timeout
          });
          
          const fetchPromise = taskApi.getTasks();
          
          // Race between fetch and timeout
          const tasks = await Promise.race([fetchPromise, timeoutPromise]);
          
          set({ tasks, isLoading: false });
        } catch (error: any) {
          console.error('Failed to fetch tasks:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch tasks',
          });
          // Don't throw error for fetch failures - just log them
        }
      },

      createTask: async (taskData: TaskCreateRequest) => {
        console.log('=== TASK STORE DEBUG START ===');
        console.log('Task store: createTask called with data:', taskData);
        set({ isLoading: true, error: null });
        try {
          console.log('Task store: Setting loading to true');
          
          // Add timeout protection
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task creation timeout')), 8000); // 8 second timeout
          });
          
          console.log('Task store: About to call taskApi.createTask');
          const createPromise = taskApi.createTask(taskData);
          
          console.log('Task store: Starting race between createTask and timeout');
          // Race between task creation and timeout
          const newTask = await Promise.race([createPromise, timeoutPromise]);
          console.log('Task store: Task creation successful, new task:', newTask);
          
          set((state) => {
            console.log('Task store: Updating state with new task');
            console.log('Task store: Current tasks count:', state.tasks.length);
            console.log('Task store: Adding new task to list');
            return {
              tasks: [...state.tasks, newTask],
              isLoading: false,
            };
          });
          console.log('Task store: State updated successfully');
          return newTask;
        } catch (error: any) {
          console.error('=== TASK STORE ERROR ===');
          console.error('Task store: createTask failed:', error);
          console.error('Task store: Error type:', typeof error);
          console.error('Task store: Error message:', error.message);
          console.error('Task store: Error stack:', error.stack);
          
          set({
            isLoading: false,
            error: error.message || 'Failed to create task',
          });
          throw error;
        } finally {
          console.log('=== TASK STORE DEBUG END ===');
        }
      },

      updateTask: async (id: string, updates: TaskUpdateRequest) => {
        set({ isLoading: true, error: null });
        try {
          const updatedTask = await taskApi.updateTask(id, updates);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? updatedTask : task
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to update task',
          });
          throw error;
        }
      },

      deleteTask: async (id: string) => {
        console.log('Task store: Starting delete task for ID:', id);
        set({ isLoading: true, error: null });
        try {
          console.log('Task store: Calling taskApi.deleteTask...');
          await taskApi.deleteTask(id);
          console.log('Task store: API call successful, updating local state...');
          set((state) => {
            const filteredTasks = state.tasks.filter((task) => task.id !== id);
            console.log('Task store: Filtered tasks count:', filteredTasks.length, 'from', state.tasks.length);
            return {
              tasks: filteredTasks,
              isLoading: false,
            };
          });
          console.log('Task store: Delete task completed successfully');
        } catch (error: any) {
          console.error('Task store: Delete task failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to delete task',
          });
          throw error;
        }
      },

      setSelectedTask: (task: Task | null) => {
        set({ selectedTask: task });
      },

      clearError: () => set({ error: null }),

      forceClearLoading: () => {
        console.log('Force clearing loading state');
        set({ isLoading: false });
      },

      // Computed getters
      getPendingTasks: () => {
        const { tasks } = get();
        return tasks.filter((task) => task.status === 'pending');
      },

      getInProgressTasks: () => {
        const { tasks } = get();
        return tasks.filter((task) => task.status === 'in_progress');
      },

      getCompletedTasks: () => {
        const { tasks } = get();
        return tasks.filter((task) => task.status === 'completed');
      },

      getTasksByPriority: () => {
        const { tasks } = get();
        return [...tasks].sort((a, b) => b.priority - a.priority);
      },
}));