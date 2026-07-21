"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useKickStore } from "@/stores/kickStore";
import { GlassCard } from "@/components/GlassCard";
import { KickButton } from "@/components/KickButton";
import { History, TrendingUp, AlertCircle, Clock, Heart, Play, Square, CheckCircle, Sparkles } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CounterPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { 
    todayKicks, lastKickAt, logKick, fetchTodayKicks,
    mode, setMode, isSessionActive, startSession, completeSession, cancelSession,
    sessionStartTime, sessionKicks, selectedIntensity, setIntensity
  } = useKickStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (initialized && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchTodayKicks(user.id);
    }
  }, [initialized, user, router, fetchTodayKicks]);

  // Session stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const seconds = Math.floor((new Date().getTime() - new Date(sessionStartTime).getTime()) / 1000);
        setElapsedSeconds(seconds);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKick = async () => {
    if (!user) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    await logKick(user.id);
  };

  const handleStartSession = async () => {
    if (!user) return;
    await startSession(user.id);
    toast.success("Kick-to-10 session started!");
  };

  const handleCompleteSession = async () => {
    if (!user) return;
    await completeSession(user.id, `Completed ${sessionKicks} kicks in ${formatTimer(elapsedSeconds)}`);
    toast.success("Kick session saved successfully!");
  };

  const intensities = [
    { level: 1, label: "Flutter", emoji: "🪶", color: "border-blue-400/30 text-blue-300" },
    { level: 2, label: "Kick", emoji: "🦶", color: "border-purple-400/30 text-purple-300" },
    { level: 3, label: "Roll", emoji: "🌊", color: "border-pink-400/30 text-pink-300" },
  ];

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold pb-1 bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
          Kick Tracker
        </h1>
        <p className="text-white/60 text-sm">
          Logging every little movement & heartbeat
        </p>
      </header>

      {/* Mode Selector Toggle */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
        <button
          onClick={() => setMode('quick')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
            mode === 'quick' 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-white/50 hover:text-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" /> Quick Log
        </button>
        <button
          onClick={() => setMode('session')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
            mode === 'session' 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-white/50 hover:text-white"
          )}
        >
          <Clock className="w-3.5 h-3.5" /> Kick-to-10 Session
        </button>
      </div>

      {/* Session Controls Header (If Session Mode Selected) */}
      {mode === 'session' && (
        <GlassCard className="p-5 space-y-4 border-primary/20" glowColor="rgba(139, 92, 246, 0.15)">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Count-to-10 Standard</span>
              <h3 className="text-lg font-bold text-white">Target: 10 Movements</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-white/40 block font-mono">Elapsed Time</span>
              <span className="text-2xl font-bold font-mono text-white tracking-wider">
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Session Progress Bar */}
          {isSessionActive && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-white/70">
                <span>Progress</span>
                <span className="text-primary">{sessionKicks} / 10 Kicks</span>
              </div>
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="bg-gradient-to-r from-primary to-purple-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                  style={{ width: `${Math.min(100, (sessionKicks / 10) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            {!isSessionActive ? (
              <button 
                onClick={handleStartSession}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Play className="w-4 h-4 fill-current" /> Start 10-Kick Session
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCompleteSession}
                  className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-bold flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors text-xs"
                >
                  <CheckCircle className="w-4 h-4" /> Save Session
                </button>
                <button 
                  onClick={cancelSession}
                  className="py-2.5 px-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-bold flex items-center justify-center gap-1 text-xs hover:bg-destructive/20"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> Cancel
                </button>
              </>
            )}
          </div>
        </GlassCard>
      )}

      {/* Movement Intensity Selection Chips */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block text-center">Movement Intensity</span>
        <div className="flex justify-center gap-2">
          {intensities.map((item) => (
            <button
              key={item.level}
              onClick={() => setIntensity(item.level)}
              className={cn(
                "px-4 py-2 rounded-full border text-xs font-bold transition-all duration-300 flex items-center gap-1.5 glass",
                selectedIntensity === item.level 
                  ? "bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(96,165,250,0.3)] scale-105" 
                  : "border-white/5 text-white/50 hover:text-white hover:border-white/20"
              )}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Pulse Kick Button */}
      <KickButton 
        onKick={handleKick} 
        count={mode === 'session' ? sessionKicks : todayKicks} 
        isTracking={mode === 'quick' || isSessionActive} 
      />

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">
            <Clock className="w-3 h-3 text-blue-400" />
            Last Kick
          </div>
          <span className="text-sm font-medium text-white text-center">
            {lastKickAt ? formatDistanceToNow(new Date(lastKickAt), { addSuffix: true }) : "No kicks yet"}
          </span>
          {lastKickAt && (
            <span className="text-[10px] text-white/30 font-mono">
              {format(new Date(lastKickAt), "h:mm:ss a")}
            </span>
          )}
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center justify-center space-y-1" glowColor="rgba(139, 92, 246, 0.15)">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">
            <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
            Today's Total
          </div>
          <span className="text-2xl font-bold font-mono text-white">
            {todayKicks}
          </span>
        </GlassCard>
      </div>

      {/* Navigation Card to Dashboard */}
      <GlassCard className="mt-8 bg-white/5 border-transparent hover:bg-white/10 group cursor-pointer" onClick={() => router.push("/dashboard")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">View AI Insights</h3>
              <p className="text-xs text-white/50">Check movement trends & peak active hours</p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
        </div>
      </GlassCard>
      
      {/* Medical Advisory Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/70 text-xs shadow-lg">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <p>A significant reduction or sudden change in your baby's movement patterns requires immediate consultation with your doctor.</p>
      </div>
    </div>
  );
}
