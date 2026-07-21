"use client";

import React, { useMemo, useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { useAuthStore } from "@/stores/authStore";
import { useKickStore } from "@/stores/kickStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from "recharts";
import { 
  Trophy, TrendingUp, Calendar, Clock, ChevronRight, Filter, 
  Smile, Activity, HeartPulse, Sparkles, AlertTriangle, Zap, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, parseISO, differenceInWeeks } from "date-fns";
import { useProfileStore } from "@/stores/profileStore";
import { getBabyProgress } from "@/lib/babyProgress";

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { todayKicks, fetchTodayKicks } = useKickStore();
  const { profile, fetchProfile } = useProfileStore();
  
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
  const [totalKicks, setTotalKicks] = useState(0);

  useEffect(() => {
    if (initialized && !user) {
      router.push("/");
      return;
    }
    if (user) {
      fetchTodayKicks(user.id);
      fetchHistoricalData(user.id);
      fetchProfile();
    }
  }, [user, initialized, router, fetchTodayKicks, fetchProfile]);

  const calculateWeek = (dateStr: string) => {
    if (!dateStr) return null;
    try {
      const dueDate = parseISO(dateStr);
      const conceptionDate = new Date(dueDate.getTime() - (280 * 24 * 60 * 60 * 1000));
      const weeks = differenceInWeeks(new Date(), conceptionDate);
      return Math.max(1, Math.min(42, weeks));
    } catch {
      return null;
    }
  };

  const pregnancyWeek = profile?.due_date ? calculateWeek(profile.due_date) : null;
  const babyProgress = pregnancyWeek !== null ? getBabyProgress(pregnancyWeek) : null;

  const fetchHistoricalData = async (userId: string) => {
    try {
      const { data: kicks } = await supabase
        .from('kicks')
        .select('kicked_at, intensity')
        .eq('user_id', userId)
        .order('kicked_at', { ascending: false });

      if (kicks) {
        setTotalKicks(kicks.length);
        
        // Group by Day (Last 7 Days)
        const dayGroups: any = {};
        for (let i = 0; i < 7; i++) {
          const date = subDays(new Date(), i);
          const dayLabel = format(date, "EEE");
          dayGroups[dayLabel] = 0;
        }

        kicks.forEach((k: any) => {
          const dayLabel = format(parseISO(k.kicked_at), "EEE");
          if (dayGroups[dayLabel] !== undefined) {
            dayGroups[dayLabel] += 1;
          }
        });

        const dailyChartData = Object.keys(dayGroups).reverse().map(day => ({
          day, count: dayGroups[day]
        }));
        setDailyHistory(dailyChartData);

        // Group by Hour for distribution
        const hourGroups: any = { "00-06": 0, "06-12": 0, "12-18": 0, "18-00": 0 };
        kicks.forEach((k: any) => {
          const hour = parseISO(k.kicked_at).getHours();
          if (hour < 6) hourGroups["00-06"] += 1;
          else if (hour < 12) hourGroups["06-12"] += 1;
          else if (hour < 18) hourGroups["18-00"] += 1;
          else hourGroups["18-00"] += 1;
        });

        const hourlyChartData = Object.keys(hourGroups).map(h => ({
          hour: h, count: hourGroups[h]
        }));
        setHourlyDistribution(hourlyChartData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Peak Hour Calculation (AI Prediction)
  const peakHourSlot = useMemo(() => {
    if (!hourlyDistribution.length) return "18:00 - 00:00";
    const sorted = [...hourlyDistribution].sort((a, b) => b.count - a.count);
    const top = sorted[0]?.hour;
    if (top === "18-00") return "6:00 PM - 12:00 AM";
    if (top === "12-18") return "12:00 PM - 6:00 PM";
    if (top === "06-12") return "6:00 AM - 12:00 PM";
    return "12:00 AM - 6:00 AM";
  }, [hourlyDistribution]);

  // Average Kicks calculation & Anomaly Warning
  const dailyAverage = useMemo(() => {
    if (dailyHistory.length === 0) return 0;
    const sum = dailyHistory.reduce((a, b) => a + b.count, 0);
    return sum / dailyHistory.length;
  }, [dailyHistory]);

  const showAnomalyWarning = useMemo(() => {
    const currentHour = new Date().getHours();
    // If it's evening (>5pm) and today's kicks are significantly lower than average
    return currentHour >= 17 && dailyAverage > 5 && todayKicks < (dailyAverage * 0.4);
  }, [todayKicks, dailyAverage]);

  const stats = [
    { label: "Today's Total", value: todayKicks.toString(), icon: Smile, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Avg / Day", value: dailyAverage.toFixed(1), icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total History", value: totalKicks.toString(), icon: HeartPulse, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Active Days", value: dailyHistory.filter(d => d.count > 0).length.toString(), icon: Activity, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-white/40 text-sm">Real-time BellyBeats AI insights</p>
        </div>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
          <Calendar className="w-4 h-4 text-white/60" />
        </button>
      </header>

      {/* AI Smart Anomaly Alert (Conditional) */}
      {showAnomalyWarning && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-2 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>AI Movement Alert</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-200/80">
            Today's kick count ({todayKicks}) is lower than your 7-day average ({dailyAverage.toFixed(1)}). Consider doing a 10-kick session.
          </p>
          <button 
            onClick={() => router.push("/counter")} 
            className="mt-1 text-xs font-bold text-amber-300 underline hover:text-amber-100 flex items-center gap-1"
          >
            Start Kick-to-10 Session Now <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* AI Peak Activity Prediction Tile */}
      <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border-primary/20" glowColor="rgba(96, 165, 250, 0.2)">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(96,165,250,0.3)]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Pattern Prediction
            </span>
            <h3 className="text-lg font-bold text-white">Peak Active Hours</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Your baby is most active between <span className="text-primary font-bold">{peakHourSlot}</span>. Great time for a kick session!
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Baby Progress Weekly Milestone Card */}
      {babyProgress && (
        <GlassCard className="p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center border-primary/20" glowColor="rgba(139, 92, 246, 0.15)">
          <div className="text-5xl p-4 bg-primary/10 rounded-2xl border border-primary/10 shadow-[0_0_25px_rgba(96,165,250,0.15)] flex items-center justify-center select-none animate-pulse">
            {babyProgress.emoji}
          </div>
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                Week {babyProgress.week} of 40
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Your baby is the size of a <span className="text-primary">{babyProgress.size}</span>!
              </h2>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
              {babyProgress.description}
            </p>
            
            <div className="pt-2">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(96,165,250,0.6)]" 
                  style={{ width: `${Math.min(100, (babyProgress.week / 40) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-white/20 mt-1.5 uppercase tracking-wider font-bold">
                <span>First Trimester</span>
                <span>Week 20 (Halfway)</span>
                <span>Week 40 (Due)</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className="p-4 group hover:bg-white/10 cursor-pointer transition-all border-white/5" glowColor="rgba(255,255,255,0.05)">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <span className="text-xs text-white/40 block mb-1 uppercase tracking-wider">{stat.label}</span>
            <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
          </GlassCard>
        ))}
      </div>

      {/* Main Charts */}
      <div className="space-y-6">
        <GlassCard className="p-0 overflow-hidden" glowColor="rgba(96, 165, 250, 0.1)">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Daily Activity (Last 7 Days)
            </h3>
          </div>
          <div className="h-64 w-full p-4 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistory}>
                <defs>
                   <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                     <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3} />
                   </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-0 overflow-hidden" glowColor="rgba(139, 92, 246, 0.1)">
              <div className="p-6 border-b border-white/5">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                  Hourly Distribution
                </h3>
              </div>
              <div className="h-48 w-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyDistribution}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#8b5cf6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      fill="url(#areaGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-center gap-4 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(96,165,250,0.4)] flex-shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Doing Great!</h3>
                  <p className="text-sm text-white/60">Healthy movement profiles indicate baby's well-being.</p>
                </div>
              </div>
              <button 
                className="text-primary text-xs font-bold hover:underline self-end flex items-center gap-1 mt-2" 
                onClick={() => router.push("/counter")}
              >
                Log Now <ChevronRight className="w-3 h-3" />
              </button>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
