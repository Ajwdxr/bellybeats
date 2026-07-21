import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

export interface KickState {
  todayKicks: number;
  lastKickAt: string | null;
  loading: boolean;
  
  // Session Mode (Kick-to-10)
  mode: 'quick' | 'session';
  isSessionActive: boolean;
  sessionStartTime: string | null;
  sessionKicks: number;
  currentSessionId: string | null;
  selectedIntensity: number; // 1: Flutter, 2: Kick, 3: Roll

  setMode: (mode: 'quick' | 'session') => void;
  setIntensity: (intensity: number) => void;
  startSession: (userId: string) => Promise<void>;
  logKick: (userId: string, intensityOverride?: number) => Promise<void>;
  completeSession: (userId: string, notes?: string) => Promise<void>;
  cancelSession: () => void;
  fetchTodayKicks: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useKickStore = create<KickState>()(
  persist(
    (set, get) => ({
      todayKicks: 0,
      lastKickAt: null,
      loading: false,

      mode: 'quick',
      isSessionActive: false,
      sessionStartTime: null,
      sessionKicks: 0,
      currentSessionId: null,
      selectedIntensity: 2,

      setMode: (mode) => set({ mode }),
      setIntensity: (selectedIntensity) => set({ selectedIntensity }),

      fetchTodayKicks: async (userId: string) => {
        set({ loading: true });
        const start = startOfDay(new Date()).toISOString();
        const end = endOfDay(new Date()).toISOString();

        try {
          const { count, error } = await supabase
            .from('kicks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('kicked_at', start)
            .lte('kicked_at', end);

          if (!error) {
            set({ todayKicks: count || 0, loading: false });
          }
        } catch (e) {
          console.error('Error fetching today kicks:', e);
          set({ loading: false });
        }
      },

      startSession: async (userId: string) => {
        const startTime = new Date().toISOString();
        try {
          const { data, error } = await supabase
            .from('kick_sessions')
            .insert({
              user_id: userId,
              started_at: startTime,
              total_kicks: 10
            })
            .select()
            .single();

          set({
            isSessionActive: true,
            sessionStartTime: startTime,
            sessionKicks: 0,
            currentSessionId: data?.id || null
          });
        } catch (e) {
          console.error('Error starting session:', e);
          set({
            isSessionActive: true,
            sessionStartTime: startTime,
            sessionKicks: 0,
            currentSessionId: null
          });
        }
      },

      logKick: async (userId: string, intensityOverride) => {
        const kickedAt = new Date().toISOString();
        const intensity = intensityOverride || get().selectedIntensity;
        const sessionId = get().currentSessionId;

        const newKick = {
          user_id: userId,
          kicked_at: kickedAt,
          intensity,
          session_id: sessionId
        };

        // Update local state immediately
        set((state) => {
          const newSessionCount = state.isSessionActive ? state.sessionKicks + 1 : state.sessionKicks;
          return {
            todayKicks: state.todayKicks + 1,
            lastKickAt: kickedAt,
            sessionKicks: newSessionCount
          };
        });

        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(100);
        }

        // Auto-complete if 10 kicks reached during session
        const state = get();
        if (state.isSessionActive && state.sessionKicks >= 10) {
          get().completeSession(userId, '10 kicks completed');
        }

        // Sync to Supabase
        try {
          await supabase.from('kicks').insert(newKick);
        } catch (e) {
          console.error('Failed to sync kick:', e);
        }
      },

      completeSession: async (userId: string, notes = '') => {
        const state = get();
        if (!state.sessionStartTime) return;

        const now = new Date();
        const start = new Date(state.sessionStartTime);
        const durationSeconds = Math.round((now.getTime() - start.getTime()) / 1000);

        if (state.currentSessionId) {
          try {
            await supabase
              .from('kick_sessions')
              .update({
                completed_at: now.toISOString(),
                duration_seconds: durationSeconds,
                notes
              })
              .eq('id', state.currentSessionId);
          } catch (e) {
            console.error('Error completing session:', e);
          }
        }

        set({
          isSessionActive: false,
          sessionStartTime: null,
          sessionKicks: 0,
          currentSessionId: null
        });
      },

      cancelSession: () => set({
        isSessionActive: false,
        sessionStartTime: null,
        sessionKicks: 0,
        currentSessionId: null
      }),

      reset: () => set({ 
        todayKicks: 0, 
        lastKickAt: null, 
        loading: false,
        isSessionActive: false,
        sessionStartTime: null,
        sessionKicks: 0,
        currentSessionId: null
      }),
    }),
    {
      name: 'belly-beats-tracking',
      partialize: (state) => ({ 
        todayKicks: state.todayKicks, 
        lastKickAt: state.lastKickAt,
        mode: state.mode,
        isSessionActive: state.isSessionActive,
        sessionStartTime: state.sessionStartTime,
        sessionKicks: state.sessionKicks,
        currentSessionId: state.currentSessionId
      }),
    }
  )
);
