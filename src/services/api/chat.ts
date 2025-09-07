import { supabase } from '@/config/supabase';
import { ChatContext, ChatRequest, ChatResponse, ChatMessage } from '@/types/chat';
import { ApiResponse } from '@/types/api';

export const chatApi = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // For now, return a mock response
    // TODO: Integrate with DeepSeek API
    const mockResponse: ChatResponse = {
      message: `I understand you want to "${request.message}". Let me help you with that!`,
      suggestions: [
        'Create a task for this',
        'Set a reminder',
        'Break it down into smaller steps'
      ],
      actions: [
        {
          type: 'create_task',
          data: { title: request.message },
          label: 'Create Task'
        }
      ]
    };

    // Store the conversation in the database
    await this.updateContext(request.user_id, request.message, mockResponse.message);
    
    return mockResponse;
  },

  async createContext(type: 'task_creation' | 'general' | 'focus_guidance'): Promise<ChatContext> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_context')
      .insert({
        user_id: user.user.id,
        context_type: type,
        messages: [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContext(userId: string): Promise<ChatContext | null> {
    const { data, error } = await supabase
      .from('chat_context')
      .select('*')
      .eq('user_id', userId)
      .eq('context_type', 'task_creation')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async updateContext(userId: string, userMessage: string, assistantMessage: string): Promise<void> {
    const context = await this.getContext(userId);
    
    const newMessages: ChatMessage[] = [
      {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      }
    ];

    if (context) {
      // Update existing context
      const { error } = await supabase
        .from('chat_context')
        .update({
          messages: [...context.messages, ...newMessages],
          updated_at: new Date().toISOString(),
        })
        .eq('id', context.id);

      if (error) throw error;
    } else {
      // Create new context
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_context')
        .insert({
          user_id: user.user.id,
          context_type: 'task_creation',
          messages: newMessages,
        });

      if (error) throw error;
    }
  },

  async clearContext(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('chat_context')
      .delete()
      .eq('user_id', user.user.id);

    if (error) throw error;
  },

  async getContextHistory(userId: string, limit: number = 10): Promise<ChatContext[]> {
    const { data, error } = await supabase
      .from('chat_context')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async deleteExpiredContexts(): Promise<void> {
    const { error } = await supabase
      .from('chat_context')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
  },
};
