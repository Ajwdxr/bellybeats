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
  Smile, Activity, HeartPulse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { todayKicks, fetchTodayKicks } = useKickStore();
  
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
    }
  }, [user, initialized, router, fetchTodayKicks]);

  const fetchHistoricalData = async (userId: string) => {
    try {
      // Last 7 days aggregation
      const { data: kicks } = await supabase
        .from('kicks')
        .select('kicked_at')
        .eq('user_id', userId)
        .order('kicked_at', { ascending: false });

      if (kicks) {
        setTotalKicks(kicks.length);
        
        // Group by Day
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

        // Finalize chart data in correct order
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
          else if (hour < 18) hourGroups["12-18"] += 1;
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

  const stats = [
    { label: "Today's Total", value: todayKicks.toString(), icon: Smile, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Avg / Day", value: dailyHistory.length > 0 ? (dailyHistory.reduce((a, b) => a + b.count, 0) / dailyHistory.length).toFixed(1) : "0", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Total History", value: totalKicks.toString(), icon: HeartPulse, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Active Days", value: dailyHistory.filter(d => d.count > 0).length.toString(), icon: Activity, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  if (!initialized || !user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-white/40 text-sm">Real-time BellyBeats data</p>
        </div>
        <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Calendar className="w-4 h-4 text-white/60" />
            </button>
        </div>
      </header>

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
              Daily Activity
            </h3>
            <span className="text-xs text-white/30">Last 7 Days</span>
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
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(96,165,250,0.4)]">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Doing Great!</h3>
                  <p className="text-sm text-white/60">Your baby is very active this week.</p>
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed italic border-l-2 border-primary/50 pl-3">
                "Healthy movement profiles indicate baby's well-being. BellyBeats helps you stay connected."
              </p>
              <button className="text-primary text-xs font-bold hover:underline self-end flex items-center gap-1" onClick={() => router.push("/counter")}>
                Log Now <ChevronRight className="w-3 h-3" />
              </button>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
