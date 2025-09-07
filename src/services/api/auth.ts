import { supabase, TABLES } from '@/config/supabase';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      // Check for specific error types and provide user-friendly messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before logging in.');
      } else if (error.message.includes('User not found') || error.message.includes('No user found')) {
        throw new Error('No account found with this email address. Please register first or check your email.');
      } else {
        throw new Error(error.message);
      }
    }

    if (!data.user) {
      throw new Error('Login failed. Please try again.');
    }

    // Get user profile from users table
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // If user profile doesn't exist, provide a helpful message
      if (userError.code === 'PGRST116') {
        throw new Error('Account not found. Please register first or contact support if you believe this is an error.');
      }
      throw new Error(userError.message);
    }

    return {
      user: userData,
      session: {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
      },
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Starting registration for:', data.email);
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: 'http://localhost:8081/(auth)/login'
      }
    });

    if (error) {
      console.error('Supabase auth signup error:', error);
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('No user data returned');
    }

    console.log('Auth user created:', authData.user.id);

    // Create user profile in users table
    const userProfile = {
      id: authData.user.id,
      email: data.email,
      full_name: data.full_name,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      preferences: {
        theme: 'system',
        notifications: {
          focus_reminders: true,
          break_reminders: true,
          daily_summary: true,
        },
        focus_settings: {
          default_duration: 25 * 60, // 25 minutes
          auto_start_break: true,
          break_duration: 5 * 60, // 5 minutes
        },
      },
      // Note: password_hash is handled by Supabase auth, not stored in our users table
    };

    console.log('Attempting to insert user profile:', userProfile.id);

    // Try inserting with explicit user context
    const { data: userData, error: userError } = await supabase
      .from(TABLES.USERS)
      .insert(userProfile)
      .select()
      .single();

    if (userError) {
      console.error('User profile insert error:', userError);
      console.error('Error details:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      
      // Handle duplicate email error
      if (userError.code === '23505') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      
      throw new Error(`Registration failed: ${userError.message}`);
    }

    console.log('User profile created successfully:', userData.email);

    // Ensure we have a session
    if (!authData.session) {
      console.log('No session after registration, attempting to sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (signInError) {
        console.error('Auto sign-in after registration failed:', signInError);
        throw new Error('Registration successful but auto-login failed. Please try logging in manually.');
      }
      
      return {
        user: userData,
        session: {
          access_token: signInData.session?.access_token || '',
          refresh_token: signInData.session?.refresh_token || '',
        },
      };
    }

    return {
      user: userData,
      session: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      },
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('Getting user profile for ID:', user.id);

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // If user profile doesn't exist, return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('User profile not found in database');
        return null;
      }
      throw new Error(error.message);
    }

    console.log('User profile loaded successfully:', data?.email);
    return data;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async refreshSession(): Promise<void> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw new Error(error.message);
    }
  },
};

