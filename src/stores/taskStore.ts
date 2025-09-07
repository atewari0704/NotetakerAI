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
          const tasks = await taskApi.getTasks();
          set({ tasks, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch tasks',
          });
          throw error;
        }
      },

      createTask: async (taskData: TaskCreateRequest) => {
        set({ isLoading: true, error: null });
        try {
          const newTask = await taskApi.createTask(taskData);
          set((state) => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));
          return newTask;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to create task',
          });
          throw error;
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