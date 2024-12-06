import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error instanceof AuthError) {
        throw new Error(
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : error.message
        );
      }
      throw new Error('An unexpected error occurred during sign in');
    }

    if (!data?.user) {
      throw new Error('No user data received');
    }

    set({ user: data.user, loading: false });
  },
  signUp: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    
    if (error) {
      if (error instanceof AuthError) {
        throw new Error(
          error.message === 'User already registered'
            ? 'This email is already registered. Please sign in instead.'
            : error.message
        );
      }
      throw new Error('An unexpected error occurred during registration');
    }

    if (!data?.user) {
      throw new Error('No user data received');
    }

    // Check if email confirmation is required
    if (data.user.identities?.length === 0) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    set({ user: data.user, loading: false });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Failed to sign out');
    }
    set({ user: null, loading: false });
  },
  setUser: (user) => set({ user, loading: false }),
}));