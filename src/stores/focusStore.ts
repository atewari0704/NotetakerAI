import { create } from 'zustand';
import { FocusSession, FocusSessionCreateRequest, FocusSessionUpdateRequest } from '@/types/sessions';
import { sessionApi } from '@/services/api/sessions';

interface FocusState {
  currentSession: FocusSession | null;
  sessionHistory: FocusSession[];
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  startTime: Date | null;
  targetDuration: number; // in minutes
  elapsedTime: number; // in seconds
  isPaused: boolean;
  
  // Actions
  startSession: (sessionData: FocusSessionCreateRequest) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (updates?: FocusSessionUpdateRequest) => Promise<void>;
  fetchSessionHistory: () => Promise<void>;
  setTargetDuration: (duration: number) => void;
  updateElapsedTime: (time: number) => void;
  clearError: () => void;
  resetSession: () => void;
  
  // Computed
  getRemainingTime: () => number; // in seconds
  getProgressPercentage: () => number;
  getTodaySessions: () => FocusSession[];
  getTotalFocusTimeToday: () => number; // in minutes
}

export const useFocusStore = create<FocusState>()((set, get) => ({
      currentSession: null,
      sessionHistory: [],
      isLoading: false,
      error: null,
      isActive: false,
      startTime: null,
      targetDuration: 25, // Default 25 minutes
      elapsedTime: 0,
      isPaused: false,

      startSession: async (sessionData: FocusSessionCreateRequest) => {
        set({ isLoading: true, error: null });
        try {
          const session = await sessionApi.createSession(sessionData);
          const now = new Date();
          set({
            currentSession: session,
            isActive: true,
            startTime: now,
            targetDuration: sessionData.target_duration,
            elapsedTime: 0,
            isPaused: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to start session',
          });
          throw error;
        }
      },

      pauseSession: () => {
        set({ isPaused: true });
      },

      resumeSession: () => {
        set({ isPaused: false });
      },

      endSession: async (updates?: FocusSessionUpdateRequest) => {
        const { currentSession, elapsedTime } = get();
        if (!currentSession) return;

        set({ isLoading: true, error: null });
        try {
          const endTime = new Date();
          const durationMinutes = Math.floor(elapsedTime / 60);
          
          const sessionUpdates: FocusSessionUpdateRequest = {
            status: 'completed',
            end_time: endTime,
            duration_minutes: durationMinutes,
            ...updates,
          };

          const updatedSession = await sessionApi.updateSession(
            currentSession.id,
            sessionUpdates
          );

          set((state) => ({
            currentSession: null,
            sessionHistory: [updatedSession, ...state.sessionHistory],
            isActive: false,
            startTime: null,
            elapsedTime: 0,
            isPaused: false,
            isLoading: false,
          }));
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to end session',
          });
          throw error;
        }
      },

      fetchSessionHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await sessionApi.getSessionHistory();
          set({ sessionHistory: sessions, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to fetch session history',
          });
          throw error;
        }
      },

      setTargetDuration: (duration: number) => {
        set({ targetDuration: duration });
      },

      updateElapsedTime: (time: number) => {
        set({ elapsedTime: time });
      },

      clearError: () => set({ error: null }),

      resetSession: () => {
        set({
          currentSession: null,
          isActive: false,
          startTime: null,
          elapsedTime: 0,
          isPaused: false,
          error: null,
        });
      },

      // Computed getters
      getRemainingTime: () => {
        const { targetDuration, elapsedTime } = get();
        const targetSeconds = targetDuration * 60;
        return Math.max(0, targetSeconds - elapsedTime);
      },

      getProgressPercentage: () => {
        const { targetDuration, elapsedTime } = get();
        const targetSeconds = targetDuration * 60;
        return Math.min(100, (elapsedTime / targetSeconds) * 100);
      },

      getTodaySessions: () => {
        const { sessionHistory } = get();
        const today = new Date().toDateString();
        return sessionHistory.filter((session) => {
          const sessionDate = new Date(session.start_time).toDateString();
          return sessionDate === today;
        });
      },

      getTotalFocusTimeToday: () => {
        const { getTodaySessions } = get();
        const todaySessions = getTodaySessions();
        return todaySessions.reduce((total, session) => {
          return total + (session.duration_minutes || 0);
        }, 0);
      },
}));