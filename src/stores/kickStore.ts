import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type Kick } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, endOfDay } from 'date-fns';

interface KickState {
  todayKicks: number;
  lastKickAt: string | null;
  loading: boolean;
  
  logKick: (userId: string, intensity?: number) => Promise<void>;
  fetchTodayKicks: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useKickStore = create<KickState>()(
  persist(
    (set, get) => ({
      todayKicks: 0,
      lastKickAt: null,
      loading: false,

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

      logKick: async (userId: string, intensity = 3) => {
        const kickedAt = new Date().toISOString();
        const newKick = {
          user_id: userId,
          kicked_at: kickedAt,
          intensity
        };

        // Update local state immediately for responsiveness
        set((state) => ({ 
          todayKicks: state.todayKicks + 1,
          lastKickAt: kickedAt
        }));

        // Haptic feedback
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(100);
        }

        // Send milestone notifications (10, 20...)
        const currentCount = get().todayKicks;
        if (currentCount % 10 === 0) {
          if (Notification.permission === 'granted') {
            new Notification('BellyBeats Milestone!', {
              body: `Total kicks logged today: ${currentCount}`,
              icon: '/icons/glass-icon.png'
            });
          }
        }

        // Sync to Supabase
        try {
          await supabase.from('kicks').insert(newKick);
        } catch (e) {
          console.error('Failed to sync kick:', e);
        }
      },

      reset: () => set({ todayKicks: 0, lastKickAt: null, loading: false }),
    }),
    {
      name: 'belly-beats-tracking',
      partialize: (state) => ({ 
        todayKicks: state.todayKicks, 
        lastKickAt: state.lastKickAt 
      }),
    }
  )
);
