export interface UserAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_focus_time: number; // in minutes
  sessions_completed: number;
  tasks_completed: number;
  productivity_score?: number;
  streak_days: number;
  created_at: Date;
  updated_at: Date;
}

export interface FocusSessionSummary {
  id: string;
  duration_minutes: number;
  task_title: string;
  productivity_rating?: number;
  mood_rating?: number;
  interruptions: number;
  start_time: Date;
  end_time: Date;
}

export interface ProductivityInsights {
  daily_average_focus_time: number;
  weekly_total_focus_time: number;
  most_productive_hours: number[];
  task_completion_rate: number;
  focus_streak: number;
  top_categories: Array<{
    category: string;
    time_spent: number;
    task_count: number;
  }>;
}

export interface AnalyticsTimeRange {
  start_date: Date;
  end_date: Date;
  period: 'day' | 'week' | 'month' | 'year';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AnalyticsChart {
  title: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie';
  color: string;
}
