"use client";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <GlassCard className="max-w-md p-10 text-center space-y-6" glowColor="rgba(239, 68, 68, 0.2)">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
        <p className="text-white/50">
          Something went wrong while verifying your session. This might be due to an expired link or configuration issue.
        </p>
        <Button className="w-full">
          <Link href="/login" className="w-full flex justify-center">Back to Login</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
