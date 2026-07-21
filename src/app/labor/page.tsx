"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useLaborStore, Contraction } from "@/stores/laborStore";
import { GlassCard } from "@/components/GlassCard";
import { 
  Play, Square, Clock, CheckSquare, Square as SquareOutline, 
  Plus, AlertCircle, PhoneCall, HeartPulse, Sparkles, CheckCircle2 
} from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LaborPrepPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const {
    contractions, isTrackingContraction, activeContractionStart, activeIntensity,
    startContraction, stopContraction, fetchContractions,
    checklist, fetchChecklist, toggleCheckitem, addCheckitem
  } = useLaborStore();

  const [activeTab, setActiveTab] = useState<'timer' | 'checklist'>('timer');
  const [checklistTab, setChecklistTab] = useState<'mom' | 'baby' | 'partner'>('mom');
  const [newItemName, setNewItemName] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (initialized && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchContractions(user.id);
      fetchChecklist(user.id);
    }
  }, [initialized, user, router, fetchContractions, fetchChecklist]);

  // Contraction Live Timer
  useEffect(() => {
    let interval: any = null;
    if (isTrackingContraction && activeContractionStart) {
      interval = setInterval(() => {
        const secs = Math.floor((new Date().getTime() - new Date(activeContractionStart).getTime()) / 1000);
        setTimerSeconds(secs);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isTrackingContraction, activeContractionStart]);

  // Check 5-1-1 Rule Alert
  const is511AlertActive = useMemo(() => {
    if (contractions.length < 3) return false;
    const recent = contractions.slice(0, 5);
    const avgDuration = recent.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / recent.length;
    return avgDuration >= 45 && avgDuration <= 90; // ~1 minute long contractions
  }, [contractions]);

  const handleStartContraction = (intensity: number = 2) => {
    if (!user) return;
    startContraction(user.id, intensity);
  };

  const handleStopContraction = async () => {
    if (!user) return;
    await stopContraction(user.id);
    toast.success("Contraction recorded!");
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !user) return;
    await addCheckitem(user.id, checklistTab, newItemName.trim());
    setNewItemName('');
    toast.success("Item added to checklist");
  };

  const filteredChecklist = useMemo(() => {
    return checklist.filter(item => item.category === checklistTab);
  }, [checklist, checklistTab]);

  const packedCount = useMemo(() => {
    return checklist.filter(i => i.is_packed).length;
  }, [checklist]);

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Page Header */}
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold pb-1 bg-gradient-to-r from-pink-400 via-purple-400 to-primary bg-clip-text text-transparent tracking-tight">
          Labor & Hospital Prep
        </h1>
        <p className="text-white/60 text-sm">
          5-1-1 Contraction Timer & Smart Hospital Bag Checklist
        </p>
      </header>

      {/* Mode Navigation Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
        <button
          onClick={() => setActiveTab('timer')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
            activeTab === 'timer' 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-white/50 hover:text-white"
          )}
        >
          <Clock className="w-3.5 h-3.5" /> 5-1-1 Contraction Timer
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
            activeTab === 'checklist' 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
              : "text-white/50 hover:text-white"
          )}
        >
          <CheckSquare className="w-3.5 h-3.5" /> Hospital Bag ({packedCount}/{checklist.length})
        </button>
      </div>

      {/* TAB 1: 5-1-1 CONTRACTION TIMER */}
      {activeTab === 'timer' && (
        <div className="space-y-6">
          {/* 5-1-1 Medical Alert status */}
          {is511AlertActive ? (
            <div className="p-5 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-white space-y-2 shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-pulse">
              <div className="flex items-center gap-2 font-bold text-sm text-pink-300">
                <AlertCircle className="w-5 h-5 text-pink-400" />
                <span>5-1-1 Labor Threshold Reached!</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Your contractions are roughly 5 minutes apart, lasting 1 minute. It may be time to call your doctor or head to the hospital!
              </p>
            </div>
          ) : (
            <GlassCard className="p-4 flex items-center gap-3 border-white/10" glowColor="rgba(255,255,255,0.03)">
              <HeartPulse className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white block">5-1-1 Rule Monitoring</span>
                <span className="text-white/40">Contractions every 5 mins, lasting 1 min, for 1 hour = Time to go to hospital.</span>
              </div>
            </GlassCard>
          )}

          {/* Central Timer Card */}
          <GlassCard className="p-8 text-center space-y-6 border-primary/20" glowColor="rgba(96, 165, 250, 0.2)">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Active Contraction Timer</span>
              <div className="text-6xl font-extrabold font-mono text-white tracking-wider my-2">
                {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </div>
              <span className="text-xs text-white/40 block">
                {isTrackingContraction ? "Contraction in progress... Press Stop when finished." : "Tap Start when a contraction begins."}
              </span>
            </div>

            {/* Start / Stop Button */}
            {!isTrackingContraction ? (
              <button
                onClick={() => handleStartContraction(2)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-purple-500 text-primary-foreground font-extrabold text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> Start Contraction
              </button>
            ) : (
              <button
                onClick={handleStopContraction}
                className="w-full py-4 rounded-2xl bg-destructive text-destructive-foreground font-extrabold text-lg shadow-xl shadow-destructive/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 animate-bounce"
              >
                <Square className="w-5 h-5 fill-current" /> Stop Contraction
              </button>
            )}
          </GlassCard>

          {/* Contraction History List */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-widest text-white/40 px-1">Recent Contractions</h3>
            {contractions.length === 0 ? (
              <GlassCard className="p-6 text-center text-white/40 text-xs">
                No contractions logged yet.
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {contractions.map((c, idx) => (
                  <GlassCard key={idx} className="p-4 flex items-center justify-between border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        #{contractions.length - idx}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          Duration: {c.duration_seconds || 0}s
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {format(parseISO(c.started_at), "h:mm:ss a")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-semibold">
                      {c.intensity === 1 ? "Mild" : c.intensity === 3 ? "Strong" : "Moderate"}
                    </span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: HOSPITAL BAG CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Sub category tabs */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setChecklistTab('mom')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all glass",
                checklistTab === 'mom' ? "bg-primary text-primary-foreground" : "text-white/50"
              )}
            >
              👩 For Mom
            </button>
            <button
              onClick={() => setChecklistTab('baby')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all glass",
                checklistTab === 'baby' ? "bg-primary text-primary-foreground" : "text-white/50"
              )}
            >
              👶 For Baby
            </button>
            <button
              onClick={() => setChecklistTab('partner')}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all glass",
                checklistTab === 'partner' ? "bg-primary text-primary-foreground" : "text-white/50"
              )}
            >
              👨 For Partner
            </button>
          </div>

          {/* Add custom item input */}
          <form onSubmit={handleAddItem} className="flex gap-2">
            <Input
              placeholder={`Add item for ${checklistTab}...`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="glass border-white/10 text-sm h-11"
            />
            <Button type="submit" className="h-11 px-4 rounded-xl font-bold">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </form>

          {/* Items List */}
          <GlassCard className="p-4 space-y-2 border-white/5" glowColor="rgba(255,255,255,0.02)">
            {filteredChecklist.length === 0 ? (
              <p className="text-center text-white/40 text-xs py-4">No items in this category yet.</p>
            ) : (
              filteredChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheckitem(user.id, item.id, !item.is_packed)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    item.is_packed 
                      ? "bg-green-500/10 border-green-500/20 text-white/50 line-through" 
                      : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                  )}
                >
                  <span className="text-sm font-medium">{item.item_name}</span>
                  {item.is_packed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <SquareOutline className="w-5 h-5 text-white/30" />
                  )}
                </div>
              ))
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
