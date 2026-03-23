"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, LogIn, Chrome, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useEffect, Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  
  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  // Rest of original component logic...
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setSession(data.session);
      toast.success("Welcome back!");
      router.push("/counter");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
     try {
       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'google',
         options: {
           redirectTo: `${window.location.origin}/auth/callback`,
           queryParams: {
             access_type: 'offline',
             prompt: 'consent',
           },
         },
       });
       if (error) throw error;
     } catch (error: any) {
       toast.error(error.message || "Google login failed");
     }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(96,165,250,0.4)]">
          <Activity className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">BellyBeats</h1>
      </div>

      <GlassCard className="w-full max-w-sm p-8" glowColor="rgba(96, 165, 250, 0.1)">
        <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/40 text-sm mb-6">Enter your details to sign in</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
              <Input 
                id="email"
                type="email" 
                placeholder="name@example.com" 
                className="pl-10 glass border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-primary/60 hover:text-primary transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-white/40" />
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                className="pl-10 glass border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            disabled={loading}
          >
            {loading ? "Signing in..." : (
              <>
                Sign In
                <LogIn className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a1a] px-2 text-white/30">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              type="button"
              variant="outline" 
              className="glass border-white/10 text-white hover:bg-white/5 h-11 rounded-xl"
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-2 w-4 h-4" />
              Google
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="glass border-white/10 text-white hover:bg-white/5 h-11 rounded-xl"
            >
              <Github className="mr-2 w-4 h-4" />
              GitHub
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-white/40">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline inline-flex items-center gap-1 group">
            Sign up <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
