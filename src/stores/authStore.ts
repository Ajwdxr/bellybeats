import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Remove persist, rely on Supabase SDK directly for session state
export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user ?? null }),
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, session: null, loading: false });
    },
    initialize: async () => {
      // If we're already checking or checked, ignore
      if (get().initialized && !get().loading) return;
      
      try {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null, initialized: true, loading: false });

        // Listen for all auth state changes: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null, loading: false });
          
          // Force a small delay to ensure session sync on some browsers
          if (_event === 'SIGNED_OUT') {
            set({ user: null, session: null });
          }
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({ initialized: true, loading: false });
      }
    },
}));
