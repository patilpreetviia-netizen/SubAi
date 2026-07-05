import { create } from "zustand";
import { supabase } from "../lib/supabase";

/**
 * Minimal auth store powered by Supabase.
 * Keeps the current user / session in zustand so every component can read
 * `useAuthStore(s => s.user)` without prop-drilling.
 */
export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  /** Call once at app boot (e.g. in __root or a top-level effect). */
  init: async () => {
    // 1. Grab current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });

    // 2. Listen for changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  /** Sign up with email + password. Returns { error } if something went wrong. */
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (!error && data?.user) {
      set({ user: data.user, session: data.session });
    }
    return { data, error };
  },

  /** Email + password login. */
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data?.user) {
      set({ user: data.user, session: data.session });
    }
    return { data, error };
  },

  /** Sign out and clear state. */
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
