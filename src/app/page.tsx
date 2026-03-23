"use client";

import React from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Activity, Heart, Bell, Shield, TrendingUp, ChevronRight, Star,
  Smartphone, CloudOff, Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const features = [
    {
      title: "Real-time Tracking",
      desc: "Instant logging with haptic feedback and beautiful animations.",
      icon: Activity,
      color: "text-blue-400"
    },
    {
      title: "Smart Insights",
      desc: "Visualize patterns with interactive charts to track baby's well-being.",
      icon: TrendingUp,
      color: "text-purple-400"
    },
    {
      title: "Instant Notifications",
      desc: "Receive milestone updates and reminders directly on your device.",
      icon: Bell,
      color: "text-pink-400"
    },
    {
      title: "Offline Ready",
      desc: "Track everywhere, even without internet. Syncs when you're back online.",
      icon: CloudOff,
      color: "text-green-400"
    }
  ];

  return (
    <div className="space-y-20 pb-12 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="relative pt-12 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(96,165,250,0.5)] mb-6"
        >
          <Activity className="w-10 h-10" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-7xl">
            Track Every <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Kick.</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-white/50 text-lg sm:text-xl font-medium">
            A premium, glass-inspired digital companion for your pregnancy journey. 
            Beautiful, secure, and always by your side.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform"
          >
            <Link href={user ? "/counter" : "/signup"} className="flex items-center">
              Start Tracking Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto h-14 px-8 rounded-2xl text-lg glass border-white/10 hover:bg-white/5 text-white"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Floating elements for aesthetic */}
        <div className="absolute -top-24 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <GlassCard className="h-full border-white/5 hover:bg-white/10" glowColor="rgba(255,255,255,0.02)">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5", f.color)}>
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-white">{f.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">
                    {f.desc}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="grid grid-cols-3 gap-8">
           <div className="text-center">
             <span className="block text-3xl font-bold text-white mb-1 tracking-tighter">10k+</span>
             <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Expectant Parents</span>
           </div>
           <div className="text-center">
             <span className="block text-3xl font-bold text-white mb-1 tracking-tighter">4.9/5</span>
             <div className="flex justify-center gap-0.5 mb-1">
               {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
             </div>
             <span className="text-xs text-white/30 uppercase tracking-widest font-bold">App Rating</span>
           </div>
           <div className="text-center">
             <span className="block text-3xl font-bold text-white mb-1 tracking-tighter">100%</span>
             <span className="text-xs text-white/30 uppercase tracking-widest font-bold">Secure Data</span>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <GlassCard 
          className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/20"
          glowColor="rgba(96, 165, 250, 0.2)"
        >
          <div className="inline-flex w-16 h-16 rounded-full bg-primary/20 items-center justify-center text-primary mb-2">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Ready to start tracking?</h2>
          <p className="text-white/50 max-md mx-auto">
            Join thousands of parents who trust BellyBeats to keep a watchful heart on their little one's movements.
          </p>
          <Button size="lg" className="rounded-xl h-14 px-10 font-bold shadow-xl shadow-primary/20">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </GlassCard>
      </section>
      
      <footer className="text-center text-white/30 text-xs pt-8">
        <p>© 2026 BellyBeats. All rights reserved.</p>
        <p className="mt-2 text-[10px] uppercase tracking-widest opacity-50">Handcrafted for premium experiences</p>
      </footer>
    </div>
  );
}
