import { create } from 'zustand';
import { ChatMessage, ChatContext, ChatRequest, ChatResponse } from '@/types/chat';
import { chatApi } from '@/services/api/chat';

interface ChatState {
  currentContext: ChatContext | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  
  // Actions
  sendMessage: (request: ChatRequest) => Promise<ChatResponse>;
  createContext: (type: 'task_creation' | 'general' | 'focus_guidance') => Promise<void>;
  clearContext: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  setTyping: (isTyping: boolean) => void;
  clearError: () => void;
  
  // Computed
  getLastMessage: () => ChatMessage | null;
  getMessagesByRole: (role: 'user' | 'assistant') => ChatMessage[];
}

export const useChatStore = create<ChatState>()((set, get) => ({
      currentContext: null,
      messages: [],
      isLoading: false,
      error: null,
      isTyping: false,

      sendMessage: async (request: ChatRequest) => {
        set({ isLoading: true, error: null, isTyping: true });
        
        // Add user message to local state immediately
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: request.message,
          timestamp: new Date(),
        };
        
        set((state) => ({
          messages: [...state.messages, userMessage],
        }));

        try {
          const response = await chatApi.sendMessage(request);
          
          // Add assistant response to local state
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
            metadata: response.metadata,
          };
          
          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false,
            isTyping: false,
          }));

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            isTyping: false,
            error: error.message || 'Failed to send message',
          });
          throw error;
        }
      },

      createContext: async (type: 'task_creation' | 'general' | 'focus_guidance') => {
        set({ isLoading: true, error: null });
        try {
          const context = await chatApi.createContext(type);
          set({
            currentContext: context,
            messages: context.messages,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to create chat context',
          });
          throw error;
        }
      },

      clearContext: async () => {
        set({ isLoading: true, error: null });
        try {
          await chatApi.clearContext();
          set({
            currentContext: null,
            messages: [],
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to clear chat context',
          });
          throw error;
        }
      },

      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },

      clearError: () => set({ error: null }),

      // Computed getters
      getLastMessage: () => {
        const { messages } = get();
        return messages.length > 0 ? messages[messages.length - 1] : null;
      },

      getMessagesByRole: (role: 'user' | 'assistant') => {
        const { messages } = get();
        return messages.filter((message) => message.role === role);
      },
}));