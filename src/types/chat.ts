export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatContext {
  id: string;
  user_id: string;
  session_id?: string;
  messages: ChatMessage[];
  context_type: 'task_creation' | 'general' | 'focus_guidance';
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

export interface ChatRequest {
  message: string;
  context?: string;
  user_id: string;
  session_id?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: ChatAction[];
  metadata?: Record<string, any>;
}

export interface ChatAction {
  type: 'create_task' | 'update_task' | 'start_focus' | 'show_analytics';
  data: Record<string, any>;
  label: string;
}
