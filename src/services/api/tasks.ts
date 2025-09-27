import { supabase } from '@/config/supabase';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/tasks';
import { ApiResponse } from '@/types/api';

export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createTask(taskData: TaskCreateRequest): Promise<Task> {
    console.log('=== TASK API DEBUG START ===');
    console.log('Task API: Creating task:', taskData);
    
    console.log('Task API: Checking user authentication...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('Task API: Auth user check:', { user: !!user.user, error: userError });
    
    if (!user.user) {
      console.error('Task API: User not authenticated:', userError);
      throw new Error('User not authenticated');
    }

    console.log('Task API: User ID for task creation:', user.user.id);
    console.log('Task API: About to insert task into database...');

    const insertData = {
      ...taskData,
      user_id: user.user.id,
    };
    console.log('Task API: Insert data:', insertData);

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select()
      .single();

    console.log('Task API: Database response:', { data, error });

    if (error) {
      console.error('Task API: Task creation error:', error);
      throw error;
    }
    
    console.log('Task API: Task created successfully:', data);
    console.log('=== TASK API DEBUG END ===');
    return data;
  },

  async updateTask(id: string, updates: TaskUpdateRequest): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    console.log('Task API: Deleting task with ID:', id);
    
    // Check authentication
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('Task API: Auth check for delete:', { user: !!user.user, error: userError });
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id) // Ensure user can only delete their own tasks
      .select();

    console.log('Task API: Delete result:', { data, error });
    
    if (error) {
      console.error('Task API: Delete error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('Task API: No task found to delete or user not authorized');
      throw new Error('Task not found or you are not authorized to delete this task');
    }
    
    console.log('Task API: Task deleted successfully');
  },

  async updateTaskPriority(id: string, priority: number): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTasksByStatus(status: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTasksByCategory(category: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('category', category)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async searchTasks(query: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
