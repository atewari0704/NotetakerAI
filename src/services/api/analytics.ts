import { supabase } from '@/config/supabase';
import { UserAnalytics, ProductivityInsights, AnalyticsTimeRange, ChartDataPoint } from '@/types/analytics';
import { ApiResponse } from '@/types/api';

export const analyticsApi = {
  async getAnalytics(period: 'week' | 'month'): Promise<UserAnalytics | null> {
    // For now, return null to trigger mock data fallback
    // This avoids authentication issues during development
    return null;
  },

  async getUserAnalytics(userId: string, dateRange?: AnalyticsTimeRange): Promise<UserAnalytics[]> {
    let query = supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('date', dateRange.start_date.toISOString().split('T')[0])
        .lte('date', dateRange.end_date.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getProductivityInsights(userId: string, days: number = 30): Promise<ProductivityInsights> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = await this.getUserAnalytics(userId, {
      start_date: startDate,
      end_date: endDate,
      period: 'day'
    });

    // Get focus sessions for the period
    const { data: sessions, error: sessionsError } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (sessionsError) throw sessionsError;

    // Get tasks for the period
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (tasksError) throw tasksError;

    // Calculate insights
    const totalFocusTime = analytics.reduce((sum, day) => sum + day.total_focus_time, 0);
    const totalSessions = analytics.reduce((sum, day) => sum + day.sessions_completed, 0);
    const totalTasks = analytics.reduce((sum, day) => sum + day.tasks_completed, 0);

    const dailyAverageFocusTime = totalFocusTime / Math.max(1, analytics.length);
    const taskCompletionRate = tasks.length > 0 ? (totalTasks / tasks.length) * 100 : 0;

    // Calculate most productive hours
    const hourCounts: { [hour: number]: number } = {};
    sessions?.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostProductiveHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Calculate focus streak
    let focusStreak = 0;
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dayAnalytics = analytics.find(a => 
        new Date(a.date).toDateString() === checkDate.toDateString()
      );
      
      if (dayAnalytics && dayAnalytics.total_focus_time > 0) {
        focusStreak++;
      } else {
        break;
      }
    }

    // Get top categories
    const categoryCounts: { [category: string]: { time: number; count: number } } = {};
    tasks?.forEach(task => {
      if (task.category) {
        if (!categoryCounts[task.category]) {
          categoryCounts[task.category] = { time: 0, count: 0 };
        }
        categoryCounts[task.category].count++;
        
        // Add time from sessions for this task
        const taskSessions = sessions?.filter(s => s.task_id === task.id) || [];
        const taskTime = taskSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        categoryCounts[task.category].time += taskTime;
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, data]) => ({
        category,
        time_spent: data.time,
        task_count: data.count
      }))
      .sort((a, b) => b.time_spent - a.time_spent)
      .slice(0, 5);

    return {
      daily_average_focus_time: Math.round(dailyAverageFocusTime),
      weekly_total_focus_time: totalFocusTime,
      most_productive_hours: mostProductiveHours,
      task_completion_rate: Math.round(taskCompletionRate),
      focus_streak: focusStreak,
      top_categories: topCategories
    };
  },

  async getFocusTimeChart(userId: string, days: number = 7): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await this.getUserAnalytics(userId, {
      start_date: startDate,
      end_date: endDate,
      period: 'day'
    });

    return analytics.map(day => ({
      date: day.date,
      value: day.total_focus_time,
      label: new Date(day.date).toLocaleDateString()
    }));
  },

  async getTaskCompletionChart(userId: string, days: number = 7): Promise<ChartDataPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await this.getUserAnalytics(userId, {
      start_date: startDate,
      end_date: endDate,
      period: 'day'
    });

    return analytics.map(day => ({
      date: day.date,
      value: day.tasks_completed,
      label: new Date(day.date).toLocaleDateString()
    }));
  },

  async getProductivityScore(userId: string, days: number = 7): Promise<number> {
    const insights = await this.getProductivityInsights(userId, days);
    
    // Calculate productivity score based on multiple factors
    const focusScore = Math.min(100, (insights.daily_average_focus_time / 60) * 20); // Max 100 for 5 hours/day
    const completionScore = insights.task_completion_rate;
    const streakScore = Math.min(100, insights.focus_streak * 10); // Max 100 for 10+ day streak
    
    return Math.round((focusScore + completionScore + streakScore) / 3);
  },

  async updateDailyAnalytics(userId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get today's sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', date.toISOString())
      .lt('start_time', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (sessionsError) throw sessionsError;

    // Get today's completed tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', date.toISOString())
      .lt('completed_at', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (tasksError) throw tasksError;

    const totalFocusTime = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
    const sessionsCompleted = sessions?.filter(s => s.status === 'completed').length || 0;
    const tasksCompleted = tasks?.length || 0;

    // Upsert analytics record
    const { error } = await supabase
      .from('user_analytics')
      .upsert({
        user_id: userId,
        date: dateStr,
        total_focus_time: totalFocusTime,
        sessions_completed: sessionsCompleted,
        tasks_completed: tasksCompleted,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },
};
