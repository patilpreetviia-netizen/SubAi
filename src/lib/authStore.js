import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { sendWelcomeEmail } from "./resendEmail";

/**
 * Minimal auth store powered by Supabase.
 * Keeps the current user / session in zustand so every component can read
 * `useAuthStore(s => s.user)` without prop-drilling.
 */
export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  _unsubscribe: null,

  /** Call once at app boot (e.g. in __root or a top-level effect). */
  init: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    } catch (err) {
      console.error("authStore init error:", err);
      set({ loading: false });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null });
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || email?.split("@")[0] || "there";
        if (email) {
          sendWelcomeEmail({ email, name }).catch((err) => console.warn("Welcome email failed:", err));
        }
      }
    });

    set({ _unsubscribe: subscription.unsubscribe.bind(subscription) });
  },

  /** Sign up with email + password. Returns { data, error }. */
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (!error && data?.user && data?.session) {
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

  /** Google OAuth – redirects the browser, returns { error } only on failure. */
  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  },

  /**
   * Send a password-reset email.
   * The user will get a link that points to /reset-password?token=...
   */
  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  /**
   * Update the password once the user has clicked the reset link.
   * Must be called while the user has a valid recovery session.
   */
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  },

  /** Sign out and clear state. */
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("authStore signOut error:", err);
    }
    set({ user: null, session: null });
  },
}));
