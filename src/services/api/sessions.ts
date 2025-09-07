import { supabase } from '@/config/supabase';
import { FocusSession, FocusSessionCreateRequest, FocusSessionUpdateRequest } from '@/types/sessions';
import { ApiResponse } from '@/types/api';

export const sessionApi = {
  async createSession(sessionData: FocusSessionCreateRequest): Promise<FocusSession> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        ...sessionData,
        user_id: user.user.id,
        start_time: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSession(id: string, updates: FocusSessionUpdateRequest): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSession(id: string): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getSessionHistory(limit: number = 50): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getActiveSession(): Promise<FocusSession | null> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async pauseSession(id: string): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({ status: 'paused' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resumeSession(id: string): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async completeSession(id: string, updates: Partial<FocusSessionUpdateRequest>): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        ...updates,
        status: 'completed',
        end_time: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSessionsByTask(taskId: string): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
