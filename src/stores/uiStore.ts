import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeTab: string;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  modals: {
    taskForm: boolean;
    focusSettings: boolean;
    analytics: boolean;
    chat: boolean;
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
      theme: 'light',
      sidebarOpen: false,
      activeTab: 'dashboard',
      notifications: [],
      modals: {
        taskForm: false,
        focusSettings: false,
        analytics: false,
        chat: false,
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setActiveTab: (tab: string) => {
        set({ activeTab: tab });
      },

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      openModal: (modal: keyof UIState['modals']) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        }));
      },

      closeModal: (modal: keyof UIState['modals']) => {
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            taskForm: false,
            focusSettings: false,
            analytics: false,
            chat: false,
          },
        });
      },
}));