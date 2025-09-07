# Productivity App: Technical Specification

## Overview

This document outlines the technical requirements and user flow for a productivity app designed to help users focus on a single task at a time. The app emphasizes minimalism, AI-driven task prioritization, and distraction-free focus sessions.


## Tech Stack
- Frontend: React Native with TypeScript, Expo, and Expo Router
- Backend/Database: Supabase
- UI Framework: React Native Paper
- AI Processing: DeepSeek


## Table of Contents

1. [User Onboarding & Authentication](#user-onboarding--authentication)
2. [Main Dashboard](#main-dashboard)
3. [Task Management Features](#task-management-features)
4. [Focus Mode](#focus-mode)
5. [Post-Session Flow](#post-session-flow)
6. [Technical Architecture](#technical-architecture)
7. [API Specifications](#api-specifications)
8. [Database Schema](#database-schema)

---

## User Onboarding & Authentication

### Welcome Screen
- **Purpose**: Initial screen for new users
- **Design**: Clean, visually inviting interface
- **Content**: Clear communication of app's core value proposition
- **CTA**: Prominent sign-up/login button

### Authentication Flow
- **Method**: Email-based authentication
- **Interface**: Single unified form handling both registration and login
- **Validation**: Real-time email validation and password strength requirements
- **Security**: Secure token-based authentication with refresh capabilities

### First-Time User Experience
- **Flow**: Direct navigation to main dashboard post-authentication
- **Onboarding**: No mandatory tutorials or intermediate steps
- **Optional**: Contextual hints and tooltips for key features

---

## Main Dashboard

### Core Layout
The dashboard serves as the central hub for task management and session initiation.

### Task List
- **Primary View**: Chronological list of user tasks
- **AI Priority Sorting**: Automatic task prioritization using AI algorithms
- **Dynamic Updates**: Real-time reordering as tasks are added or completed
- **Visual Indicators**: Priority levels displayed through color coding or icons

### Interface Elements

#### Quick-Add Field
- **Position**: Prominent placement at screen top
- **Functionality**: Single-line text input for rapid task entry
- **Behavior**: Enter key or submit button adds task to list
- **AI Integration**: Immediate processing for priority assignment

#### Chat with AI Button
- **Purpose**: Alternative task entry method
- **Functionality**: Initiates conversational interface
- **Accessibility**: Clearly labeled and easily discoverable

#### Focus Mode Button
- **Design**: Primary call-to-action button
- **Functionality**: Main entry point to core app features
- **State**: Disabled when no tasks exist
- **Visual**: High contrast, prominent styling

---

## Task Management Features

### Quick-Add Method

#### Functionality
- Simple, non-conversational input
- Brief task description entry
- Immediate addition to task list
- Minimal cognitive overhead

#### AI Integration
- Real-time text processing
- Automatic priority calculation
- Intelligent task categorization
- Context-aware placement

### Chat with AI Method

#### Functionality
- Conversational task entry interface
- Natural language processing
- Context-aware suggestions
- Task refinement capabilities

#### Example Interaction
```
User: "Add 'write a report' and 'schedule a meeting'."

AI Response: "I've added 'Write the quarterly report' and 'Schedule the team meeting'. 
I've prioritized the report as it seems more urgent. Does that sound right?"
```

#### Technical Requirements
- Backend NLP service integration
- Conversational context maintenance
- Real-time response generation
- Session state management

---

## Focus Mode

### Core Features

#### Notification Blocking
- **Scope**: All non-essential device notifications
- **Method**: Programmatic notification suppression
- **Duration**: Active throughout focus session
- **Recovery**: Automatic restoration post-session

#### Session Timer
- **Display**: Prominent, large-format timer
- **Customization**: User-configurable duration
- **Progress**: Visual progress indicators
- **Pause**: Optional pause functionality

#### Minimalist UI
- **Design**: Extremely clean interface
- **Elements**: Only current task and timer visible
- **Distractions**: All other UI elements hidden
- **Accessibility**: Maintains accessibility standards

### Technical Implementation
- **State Management**: Dedicated focus session state
- **Timer Service**: Background timer management
- **Notification API**: System-level notification control
- **UI Transitions**: Smooth enter/exit animations

---

## Post-Session Flow

### Progress Summary
- **Session Duration**: Total time spent in focus mode
- **Task Completion**: Status of focused task
- **Achievement**: Visual celebration of completion
- **Statistics**: Optional performance metrics

### Next Steps Options

#### Start Another Session
- **Button**: Clear, prominent CTA
- **Functionality**: Immediate session initiation
- **Task**: Automatic selection of next priority task
- **Flow**: Seamless transition to focus mode

#### Take a Break
- **Button**: Secondary option
- **Functionality**: Return to dashboard
- **Behavior**: Pause workflow, encourage healthy habits
- **Reminder**: Optional break timer suggestions

---

## Technical Architecture

### Backend Services

#### AI Processing Service
- **NLP Engine**: Natural language task processing
- **Priority Algorithm**: Task importance calculation
- **Context Management**: User behavior analysis
- **Learning**: Continuous improvement from user patterns

#### User Management Service
- **Authentication**: Secure user verification
- **Profile Management**: User preferences and settings
- **Data Persistence**: User data storage and retrieval
- **Session Management**: Active session tracking

#### Task Management Service
- **CRUD Operations**: Task creation, reading, updating, deletion
- **Priority Calculation**: AI-driven task sorting
- **Status Tracking**: Task completion and progress
- **Analytics**: Task performance metrics

### Frontend Architecture

#### State Management
- **Global State**: User authentication, current session
- **Local State**: UI interactions, form data
- **Persistence**: Offline capability and sync
- **Real-time Updates**: WebSocket connections for live data

#### Component Structure
- **Authentication Components**: Login, registration forms
- **Dashboard Components**: Task list, quick-add, focus button
- **Focus Components**: Timer, task display, minimal UI
- **Chat Components**: AI conversation interface

---

## API Specifications

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Task Management Endpoints

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
PATCH  /api/tasks/{id}/priority
```

### Focus Session Endpoints

```http
POST   /api/sessions/start
PUT    /api/sessions/{id}/pause
PUT    /api/sessions/{id}/resume
PUT    /api/sessions/{id}/complete
GET    /api/sessions/history
```

### AI Chat Endpoints

```http
POST   /api/chat/message
GET    /api/chat/context
DELETE /api/chat/context
```

---

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
```

#### Tasks Table
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
    category VARCHAR(100),
    estimated_duration INTEGER, -- in minutes
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    ai_metadata JSONB DEFAULT '{}',
    tags TEXT[]
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Index for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

#### Focus Sessions Table
```sql
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    session_name VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    target_duration INTEGER, -- planned duration
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'interrupted')),
    interruptions INTEGER DEFAULT 0,
    notes TEXT,
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON focus_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_task_id ON focus_sessions(task_id);
CREATE INDEX idx_focus_sessions_start_time ON focus_sessions(start_time);
CREATE INDEX idx_focus_sessions_status ON focus_sessions(status);
```

#### Chat Context Table
```sql
CREATE TABLE chat_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID,
    messages JSONB DEFAULT '[]',
    context_type VARCHAR(50) DEFAULT 'task_creation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Enable Row Level Security
ALTER TABLE chat_context ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own chat context
CREATE POLICY "Users can view own chat context" ON chat_context
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat context" ON chat_context
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat context" ON chat_context
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat context" ON chat_context
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_chat_context_user_id ON chat_context(user_id);
CREATE INDEX idx_chat_context_expires_at ON chat_context(expires_at);
```

### Analytics Tables

#### User Analytics Table
```sql
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_focus_time INTEGER DEFAULT 0, -- in minutes
    sessions_completed INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    productivity_score DECIMAL(3,2),
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics" ON user_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics" ON user_analytics
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date);
```

### Utility Tables

#### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- hex color code
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own categories
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
```

### Database Functions and Triggers

#### Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_focus_sessions_updated_at BEFORE UPDATE ON focus_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_context_updated_at BEFORE UPDATE ON chat_context
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Analytics Update Function
```sql
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_analytics (user_id, date, total_focus_time, sessions_completed, tasks_completed)
    VALUES (
        NEW.user_id,
        DATE(NOW()),
        COALESCE((SELECT SUM(duration_minutes) FROM focus_sessions WHERE user_id = NEW.user_id AND DATE(start_time) = DATE(NOW())), 0),
        COALESCE((SELECT COUNT(*) FROM focus_sessions WHERE user_id = NEW.user_id AND DATE(start_time) = DATE(NOW()) AND status = 'completed'), 0),
        COALESCE((SELECT COUNT(*) FROM tasks WHERE user_id = NEW.user_id AND DATE(completed_at) = DATE(NOW())), 0)
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_focus_time = EXCLUDED.total_focus_time,
        sessions_completed = EXCLUDED.sessions_completed,
        tasks_completed = EXCLUDED.tasks_completed,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update analytics when sessions are completed
CREATE TRIGGER update_analytics_on_session_complete
    AFTER UPDATE OF status ON focus_sessions
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_user_analytics();
```

---

## Project Folder Structure

### Root Directory Structure
```
DeepWorkAI/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (main)/                   # Main app routes
│   │   ├── dashboard.tsx         # Main dashboard
│   │   ├── focus/                # Focus mode routes
│   │   │   ├── session.tsx       # Active focus session
│   │   │   └── summary.tsx       # Post-session summary
│   │   ├── tasks/                # Task management routes
│   │   │   ├── index.tsx         # Task list
│   │   │   ├── [id].tsx          # Task detail/edit
│   │   │   └── create.tsx        # Create new task
│   │   ├── chat/                 # AI chat interface
│   │   │   └── index.tsx
│   │   ├── settings/             # App settings
│   │   │   ├── index.tsx
│   │   ├── analytics/            # Progress analytics
│   │   │   └── index.tsx
│   │   └── _layout.tsx           # Main layout
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
├── src/                          # Source code directory
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── forms/                # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── index.ts
│   │   ├── features/             # Feature-specific components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── focus/            # Focus mode components
│   │   │   ├── tasks/            # Task management components
│   │   │   ├── chat/             # Chat interface components
│   │   │   └── analytics/        # Analytics components
│   │   └── layout/               # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Navigation.tsx
│   │       └── index.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useFocusSession.ts
│   │   ├── useChat.ts
│   │   ├── useAnalytics.ts
│   │   └── index.ts
│   ├── services/                 # API and external services
│   │   ├── api/                  # API client and endpoints
│   │   │   ├── client.ts         # Supabase client configuration
│   │   │   ├── auth.ts           # Authentication API
│   │   │   ├── tasks.ts          # Tasks API
│   │   │   ├── sessions.ts       # Focus sessions API
│   │   │   ├── chat.ts           # Chat API
│   │   │   ├── analytics.ts      # Analytics API
│   │   │   └── index.ts
│   │   ├── ai/                   # AI service integration
│   │   │   ├── deepseek.ts       # DeepSeek API client
│   │   │   ├── priority.ts       # Task prioritization
│   │   │   ├── chat.ts           # Chat processing
│   │   │   └── index.ts
│   │   ├── storage/              # Local storage utilities
│   │   │   ├── asyncStorage.ts
│   │   │   ├── secureStore.ts
│   │   │   └── index.ts
│   │   └── notifications/        # Notification service
│   │       ├── local.ts
│   │       ├── push.ts
│   │       └── index.ts
│   ├── stores/                   # State management
│   │   ├── authStore.ts          # Authentication state
│   │   ├── taskStore.ts          # Task state
│   │   ├── focusStore.ts         # Focus session state
│   │   ├── chatStore.ts          # Chat state
│   │   ├── uiStore.ts            # UI state
│   │   └── index.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── sessions.ts
│   │   ├── chat.ts
│   │   ├── analytics.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── constants.ts          # App constants
│   │   ├── helpers.ts            # Helper functions
│   │   ├── validation.ts        # Form validation
│   │   ├── formatting.ts         # Data formatting
│   │   ├── time.ts               # Time utilities
│   │   └── index.ts
│   ├── styles/                   # Global styles and themes
│   │   ├── theme.ts              # App theme configuration
│   │   ├── colors.ts             # Color palette
│   │   ├── typography.ts         # Typography styles
│   │   ├── spacing.ts            # Spacing utilities
│   │   └── index.ts
│   └── config/                   # Configuration files
│       ├── supabase.ts           # Supabase configuration
│       ├── deepseek.ts           # DeepSeek configuration
│       ├── app.ts                # App configuration
│       └── index.ts
├── assets/                       # Static assets
│   ├── images/                   # Image assets
│   ├── icons/                    # Icon assets
│   ├── fonts/                    # Custom fonts
│   └── animations/               # Lottie animations
├── docs/                         # Documentation
│   ├── CONTEXT.md                # Technical specification
│   ├── API.md                    # API documentation
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── CONTRIBUTING.md           # Contribution guidelines
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # End-to-end tests
│   └── __mocks__/                # Test mocks
├── scripts/                      # Build and deployment scripts
│   ├── build.ts
│   ├── deploy.ts
│   └── setup.ts
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables
├── .gitignore                    # Git ignore file
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # Project documentation
└── metro.config.js               # Metro bundler configuration
```

### Key Directory Explanations

#### `/app` Directory (Expo Router)
- **File-based routing**: Each `.tsx` file becomes a route
- **Grouped routes**: `(auth)`, `(main)` create route groups
- **Dynamic routes**: `[id].tsx` for dynamic parameters
- **Layouts**: `_layout.tsx` files define route layouts

#### `/src/components` Directory
- **`/ui`**: Reusable UI components (buttons, inputs, cards)
- **`/forms`**: Form-specific components with validation
- **`/features`**: Feature-specific components organized by domain
- **`/layout`**: Layout and navigation components

#### `/src/services` Directory
- **`/api`**: Supabase API client and endpoint definitions
- **`/ai`**: DeepSeek AI service integration
- **`/storage`**: Local storage utilities (AsyncStorage, SecureStore)
- **`/notifications`**: Push and local notification handling

#### `/src/stores` Directory
- **State management**: Zustand stores for different app domains
- **Separation of concerns**: Each store handles specific functionality
- **Type safety**: Full TypeScript support for state management

#### `/src/types` Directory
- **Database types**: Supabase-generated types
- **API types**: Request/response type definitions
- **Component props**: TypeScript interfaces for components

### File Naming Conventions

#### Components
- **PascalCase**: `TaskCard.tsx`, `FocusTimer.tsx`
- **Feature prefix**: `TaskList.tsx`, `FocusSession.tsx`
- **Index files**: `index.ts` for clean imports

#### Hooks
- **use prefix**: `useAuth.ts`, `useTasks.ts`
- **Descriptive names**: `useFocusSession.ts`, `useAnalytics.ts`

#### Services
- **Domain names**: `auth.ts`, `tasks.ts`, `sessions.ts`
- **Client files**: `client.ts` for API clients
- **Configuration**: `config.ts` for service configuration

#### Types
- **Domain names**: `auth.ts`, `tasks.ts`, `sessions.ts`
- **API types**: `api.ts` for API-related types
- **Shared types**: `common.ts` for shared type definitions

### Import Organization

#### Absolute Imports
```typescript
// Use absolute imports for better maintainability
import { TaskCard } from '@/components/features/tasks/TaskCard';
import { useAuth } from '@/hooks/useAuth';
import { taskApi } from '@/services/api/tasks';
import { Task } from '@/types/tasks';
```

#### Relative Imports
```typescript
// Use relative imports for closely related files
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
```

### Configuration Files

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/styles/*": ["src/styles/*"]
    }
  }
}
```

#### Babel Configuration (`babel.config.js`)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

---

## Development Guidelines

### Code Standards
- **Language**: TypeScript for type safety
- **Framework**: React Native for cross-platform compatibility
- **State Management**: Redux Toolkit or Zustand
- **API Communication**: Axios or React Query
- **Testing**: Jest and React Testing Library

### Security Considerations
- **Authentication**: JWT tokens with refresh mechanism
- **Data Encryption**: End-to-end encryption for sensitive data
- **API Security**: Rate limiting and input validation
- **Privacy**: GDPR compliance and data minimization

### Performance Requirements
- **Load Time**: < 2 seconds for initial app load
- **Responsiveness**: < 100ms for user interactions
- **Offline Support**: Core functionality without internet
- **Battery Optimization**: Efficient background processing

---

## Future Enhancements

### Phase 2 Features
- **Team Collaboration**: Shared tasks and team focus sessions
- **Advanced Analytics**: Detailed productivity insights
- **Integration**: Calendar and project management tools
- **Customization**: Themes and personalization options

### Phase 3 Features
- **AI Coaching**: Personalized productivity recommendations
- **Social Features**: Community challenges and accountability
- **Advanced Focus Tools**: Pomodoro technique integration
- **Export/Import**: Data portability and backup options

---

*This specification serves as the primary reference for development teams implementing the productivity app. All features and requirements should be validated against this document during development and testing phases.*
