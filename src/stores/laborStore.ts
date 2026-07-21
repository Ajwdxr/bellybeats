import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Contraction {
  id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  intensity: number; // 1: Mild, 2: Moderate, 3: Strong
}

export interface ChecklistItem {
  id: string;
  category: 'mom' | 'baby' | 'partner';
  item_name: string;
  is_packed: boolean;
}

interface LaborState {
  contractions: Contraction[];
  isTrackingContraction: boolean;
  activeContractionStart: string | null;
  activeIntensity: number;
  
  checklist: ChecklistItem[];
  loading: boolean;

  // Contraction Actions
  startContraction: (userId: string, intensity?: number) => void;
  stopContraction: (userId: string) => Promise<void>;
  fetchContractions: (userId: string) => Promise<void>;

  // Checklist Actions
  fetchChecklist: (userId: string) => Promise<void>;
  toggleCheckitem: (userId: string, itemId: string, isPacked: boolean) => Promise<void>;
  addCheckitem: (userId: string, category: 'mom' | 'baby' | 'partner', itemName: string) => Promise<void>;
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  // Mom
  { category: 'mom', item_name: 'Identity Card & Hospital Documents', is_packed: false },
  { category: 'mom', item_name: 'Comfortable Robe & Loose Clothing', is_packed: false },
  { category: 'mom', item_name: 'Maternity Pads & Toiletries', is_packed: false },
  { category: 'mom', item_name: 'Lip balm & Hair ties', is_packed: false },
  // Baby
  { category: 'baby', item_name: 'Going-Home Outfit (Swaddle & Onesie)', is_packed: false },
  { category: 'baby', item_name: 'Newborn Diapers & Wipes', is_packed: false },
  { category: 'baby', item_name: 'Baby Blanket & Mittens', is_packed: false },
  // Partner
  { category: 'partner', item_name: 'Phone Chargers & Power bank', is_packed: false },
  { category: 'partner', item_name: 'Snacks & Change of Clothes', is_packed: false },
];

export const useLaborStore = create<LaborState>()(
  persist(
    (set, get) => ({
      contractions: [],
      isTrackingContraction: false,
      activeContractionStart: null,
      activeIntensity: 2,
      checklist: [],
      loading: false,

      startContraction: (userId: string, intensity = 2) => {
        set({
          isTrackingContraction: true,
          activeContractionStart: new Date().toISOString(),
          activeIntensity: intensity
        });
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      },

      stopContraction: async (userId: string) => {
        const state = get();
        if (!state.activeContractionStart) return;

        const endedAt = new Date().toISOString();
        const start = new Date(state.activeContractionStart);
        const end = new Date(endedAt);
        const durationSeconds = Math.round((end.getTime() - start.getTime()) / 1000);

        const newContraction: Contraction = {
          started_at: state.activeContractionStart,
          ended_at: endedAt,
          duration_seconds: durationSeconds,
          intensity: state.activeIntensity
        };

        set((s) => ({
          contractions: [newContraction, ...s.contractions],
          isTrackingContraction: false,
          activeContractionStart: null
        }));

        try {
          await supabase.from('contractions').insert({
            user_id: userId,
            started_at: newContraction.started_at,
            ended_at: newContraction.ended_at,
            duration_seconds: durationSeconds,
            intensity: newContraction.intensity
          });
        } catch (e) {
          console.error('Error saving contraction:', e);
        }
      },

      fetchContractions: async (userId: string) => {
        try {
          const { data } = await supabase
            .from('contractions')
            .select('*')
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(20);

          if (data) set({ contractions: data });
        } catch (e) {
          console.error('Error fetching contractions:', e);
        }
      },

      fetchChecklist: async (userId: string) => {
        try {
          const { data } = await supabase
            .from('hospital_checklist')
            .select('*')
            .eq('user_id', userId);

          if (data && data.length > 0) {
            set({ checklist: data });
          } else {
            // Seed defaults if empty
            const seedItems = DEFAULT_CHECKLIST.map(item => ({
              user_id: userId,
              category: item.category,
              item_name: item.item_name,
              is_packed: false
            }));

            const { data: seeded } = await supabase
              .from('hospital_checklist')
              .insert(seedItems)
              .select();

            if (seeded) set({ checklist: seeded });
          }
        } catch (e) {
          console.error('Error fetching checklist:', e);
        }
      },

      toggleCheckitem: async (userId: string, itemId: string, isPacked: boolean) => {
        set((s) => ({
          checklist: s.checklist.map(item => item.id === itemId ? { ...item, is_packed: isPacked } : item)
        }));

        try {
          await supabase
            .from('hospital_checklist')
            .update({ is_packed: isPacked })
            .eq('id', itemId);
        } catch (e) {
          console.error('Error updating checklist:', e);
        }
      },

      addCheckitem: async (userId: string, category, itemName) => {
        try {
          const { data } = await supabase
            .from('hospital_checklist')
            .insert({
              user_id: userId,
              category,
              item_name: itemName,
              is_packed: false
            })
            .select()
            .single();

          if (data) {
            set((s) => ({ checklist: [...s.checklist, data] }));
          }
        } catch (e) {
          console.error('Error adding item:', e);
        }
      }
    }),
    {
      name: 'belly-beats-labor',
      partialize: (state) => ({ 
        contractions: state.contractions,
        checklist: state.checklist
      })
    }
  )
);
