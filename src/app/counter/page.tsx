"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useKickStore } from "@/stores/kickStore";
import { GlassCard } from "@/components/GlassCard";
import { KickButton } from "@/components/KickButton";
import { History, TrendingUp, AlertCircle, Clock, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CounterPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { todayKicks, lastKickAt, logKick, fetchTodayKicks, loading } = useKickStore();

  useEffect(() => {
    if (initialized && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchTodayKicks(user.id);
    }
  }, [initialized, user, router, fetchTodayKicks]);

  const handleKick = async () => {
    if (!user) return;
    
    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    
    await logKick(user.id);
  };

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold pb-2 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          BellyTracker
        </h1>
        <p className="text-white/60">
          Logging every little heartbeat
        </p>
      </header>

      <KickButton 
        onKick={handleKick} 
        count={todayKicks} 
        isTracking={true} 
      />

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">
            <Clock className="w-3 h-3" />
            Last Kick
          </div>
          <span className="text-sm font-medium text-white text-center">
            {lastKickAt ? formatDistanceToNow(new Date(lastKickAt), { addSuffix: true }) : "No kicks yet"}
          </span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center justify-center space-y-1" glowColor="rgba(139, 92, 246, 0.15)">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">
            <Heart className="w-3 h-3 fill-primary/20" />
            Today's Total
          </div>
          <span className="text-2xl font-mono text-white">
            {todayKicks}
          </span>
        </GlassCard>
      </div>

      <GlassCard className="mt-8 bg-white/5 border-transparent hover:bg-white/10 group cursor-pointer" onClick={() => router.push("/dashboard")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View Statistics</h3>
              <p className="text-xs text-white/50">Check your daily movement patterns</p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
        </div>
      </GlassCard>
      
      <div className="flex items-center gap-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/60 text-xs shadow-lg">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p>Contact your doctor if you perceive a significant deviation from your baby's normal patterns.</p>
      </div>
    </div>
  );
}
