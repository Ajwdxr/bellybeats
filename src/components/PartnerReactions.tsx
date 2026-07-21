"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Reaction {
  id: string;
  reaction_type: 'love' | 'listen' | 'music' | 'pray';
  sender_id: string;
}

const REACTION_EMOJIS: Record<string, string> = {
  love: "❤️",
  listen: "👶",
  music: "🎵",
  pray: "🙏"
};

export const PartnerReactions = () => {
  const { user } = useAuthStore();
  const [activeReactions, setActiveReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time partner reactions sent to current user
    const channel = supabase
      .channel('partner-reactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_reactions',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newReaction = payload.new as Reaction;
          const emoji = REACTION_EMOJIS[newReaction.reaction_type] || "❤️";
          const randomX = Math.random() * 80 + 10; // 10% to 90% screen width
          
          setActiveReactions(prev => [...prev, { id: newReaction.id, emoji, x: randomX }]);
          
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }

          toast.info(`Partner sent reaction: ${emoji}`);

          // Auto remove floating reaction after 3.5 seconds
          setTimeout(() => {
            setActiveReactions(prev => prev.filter(r => r.id !== newReaction.id));
          }, 3500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {activeReactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: "100vh", opacity: 0, scale: 0.5 }}
            animate={{ y: "-10vh", opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.2, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5, ease: "easeOut" }}
            className="absolute text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            style={{ left: `${r.x}%` }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const PartnerSendReaction = ({ partnerUserId }: { partnerUserId: string }) => {
  const { user } = useAuthStore();

  const sendReaction = async (type: 'love' | 'listen' | 'music' | 'pray') => {
    if (!user || !partnerUserId) return;
    try {
      await supabase.from('partner_reactions').insert({
        sender_id: user.id,
        receiver_id: partnerUserId,
        reaction_type: type
      });
      toast.success("Reaction sent to partner!");
    } catch (e) {
      console.error("Error sending reaction:", e);
    }
  };

  return (
    <div className="flex justify-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl glass">
      <button 
        onClick={() => sendReaction('love')} 
        className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Send Love"
      >
        ❤️
      </button>
      <button 
        onClick={() => sendReaction('listen')} 
        className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Listening"
      >
        👶
      </button>
      <button 
        onClick={() => sendReaction('music')} 
        className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Play Music"
      >
        🎵
      </button>
      <button 
        onClick={() => sendReaction('pray')} 
        className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Prayers"
      >
        🙏
      </button>
    </div>
  );
};
