"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { 
  Activity, TrendingUp, Heart, Shield, 
  History, Users, Calendar
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { supabase } from "@/lib/supabase";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PartnerDashboard() {
  const { user, initialized } = useAuthStore();
  const { partners, fetchPartners } = useProfileStore();
  
  const [dailyKicks, setDailyKicks] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized && user) {
        fetchPartners();
    }
  }, [initialized, user, fetchPartners]);

  useEffect(() => {
    const activeLink = partners.find(p => p.partner_id === user?.id);
    if (activeLink) {
        fetchOwnerData(activeLink.owner_id);
    } else if (partners.length > 0) {
        // Fallback for any connected account
        fetchOwnerData(partners[0].owner_id);
    } else {
        setLoading(false);
    }
  }, [partners, user]);

  const fetchOwnerData = async (ownerId: string) => {
    setLoading(true);
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', ownerId)
            .single();
        
        setOwnerProfile(profile);

        // Fetch owner kicks and group by day manually for robustness
        const { data: kicks } = await supabase
            .from('kicks')
            .select('*')
            .eq('user_id', ownerId)
            .order('kicked_at', { ascending: false });
        
        if (kicks) {
            const groups: any = {};
            kicks.forEach((kick: any) => {
                const day = format(parseISO(kick.kicked_at), "yyyy-MM-dd");
                if (!groups[day]) groups[day] = { day, count: 0, lastAt: kick.kicked_at };
                groups[day].count += 1;
            });
            setDailyKicks(Object.values(groups));
        }
    } catch (error) {
        console.error('Error fetching owner data:', error);
    } finally {
        setLoading(false);
    }
  };

  const calculateWeek = (dateStr: string) => {
    if (!dateStr) return "??";
    try {
      const dueDate = parseISO(dateStr);
      const conceptionDate = new Date(dueDate.getTime() - (280 * 24 * 60 * 60 * 1000));
      const diff = new Date().getTime() - conceptionDate.getTime();
      return Math.max(0, Math.min(42, Math.floor(diff / (7 * 24 * 60 * 60 * 1000))));
    } catch {
      return "??";
    }
  };

  if (!initialized || loading) return <div className="flex items-center justify-center min-h-[60vh] text-white/50">Loading monitoring data...</div>;

  if (!ownerProfile) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <Users className="w-16 h-16 text-white/10" />
        <h1 className="text-xl font-bold text-white">No monitoring active</h1>
        <p className="text-white/40 max-w-sm">You haven't been invited to monitor any pregnancy yet. Tell your partner to invite you via your email.</p>
        <Button variant="outline" className="glass border-white/10" asChild>
            <Link href="/profile">Go to Profile</Link>
        </Button>
    </div>
  );

  const todayCount = dailyKicks.find(d => d.day === format(new Date(), "yyyy-MM-dd"))?.count || 0;
  const avgKicks = dailyKicks.length > 0 ? (dailyKicks.reduce((acc, cur) => acc + cur.count, 0) / dailyKicks.length).toFixed(1) : 0;

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Shield className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Monitoring</h1>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold flex items-center gap-1">
                  Active Link: <span className="text-primary">{ownerProfile.full_name || "Mom"}</span>
                </p>
            </div>
        </div>
      </header>

      <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-br from-primary/20 to-pink-500/20 border-primary/20" glowColor="rgba(96, 165, 250, 0.2)">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <Heart className="w-6 h-6 fill-white" />
            </div>
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-white leading-tight">You are monitoring {ownerProfile.baby_name || "Baby"}'s activity</h2>
                <p className="text-sm text-white/60">Currently on week {calculateWeek(ownerProfile.due_date)} of the pregnancy.</p>
            </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-5 space-y-1" glowColor="rgba(96, 165, 250, 0.1)">
          <div className="flex items-center gap-2 text-primary">
            <Activity size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Today's Total</span>
          </div>
          <p className="text-3xl font-bold text-white tracking-tighter">{todayCount}</p>
          <p className="text-[10px] text-white/30 truncate">Target: 10 kicks/day</p>
        </GlassCard>
        
        <GlassCard className="p-5 space-y-1" glowColor="rgba(167, 139, 250, 0.1)">
          <div className="flex items-center gap-2 text-purple-400">
            <TrendingUp size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg / Day</span>
          </div>
          <p className="text-3xl font-bold text-white tracking-tighter">{avgKicks}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold text-green-400/80">Steady Profile</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-white/50 text-xs uppercase tracking-widest flex items-center gap-2 px-2">
          <History size={14} /> Daily Statistics
        </h3>
        
        <GlassCard className="p-0 border-white/5 overflow-hidden" glowColor="rgba(255,255,255,0.01)">
          <div className="divide-y divide-white/5">
            {dailyKicks.slice(0, 7).map((day: any) => (
              <div key={day.day} className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{format(parseISO(day.day), "EEEE, MMM dd")}</p>
                    <p className="text-xs text-white/30 font-bold tracking-tighter">Last kick at {format(parseISO(day.lastAt), "HH:mm")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white tracking-tighter">{day.count}</p>
                  <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Total Kicks</p>
                </div>
              </div>
            ))}
            {dailyKicks.length === 0 && (
                <div className="p-8 text-center text-white/20 text-sm">No kicks logged yet</div>
            )}
          </div>
        </GlassCard>
      </div>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] pt-4"> Read-Only Monitor Mode • BellyBeats App </p>
    </div>
  );
}
