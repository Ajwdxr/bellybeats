"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface KickButtonProps {
  onKick: () => void;
  count: number;
  isTracking: boolean;
}

export const KickButton = ({ onKick, count, isTracking }: KickButtonProps) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isTracking) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    
    onKick();
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      {/* Outer Glow Circle */}
      <div 
        className={cn(
          "absolute inset-0 m-auto w-64 h-64 rounded-full transition-all duration-700 blur-3xl opacity-20",
          isTracking ? "bg-primary animate-pulse" : "bg-muted"
        )} 
      />

      <button
        onClick={handleClick}
        disabled={!isTracking}
        className={cn(
          "relative w-64 h-64 rounded-full glass border-2 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group",
          isTracking 
            ? "border-primary/50 shadow-[0_0_40px_rgba(96,165,250,0.3)] active:scale-95" 
            : "border-white/10 opacity-50 cursor-not-allowed"
        )}
      >
        {/* Ripples */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-primary/30 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x - 5,
              top: ripple.y - 5,
              width: 10,
              height: 10,
            }}
          />
        ))}

        <AnimatePresence mode="wait">
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-bold text-glow text-white"
          >
            {count}
          </motion.div>
        </AnimatePresence>
        
        <span className="text-sm font-medium text-white/60 mt-2 tracking-widest uppercase">
          Kicks
        </span>

        {/* Floating Particles when tracking */}
        {isTracking && (
          <div className="absolute inset-0 pointer-events-none">
             {[...Array(6)].map((_, i) => (
               <motion.div
                 key={i}
                 className="absolute w-1 h-1 bg-primary/40 rounded-full"
                 animate={{
                   y: [0, -100],
                   x: [0, (i % 2 === 0 ? 50 : -50)],
                   opacity: [0, 1, 0],
                 }}
                 transition={{
                   duration: 2 + Math.random() * 2,
                   repeat: Infinity,
                   delay: Math.random() * 2,
                 }}
                 style={{
                   left: `${20 + Math.random() * 60}%`,
                   bottom: "20%",
                 }}
               />
             ))}
          </div>
        )}
      </button>
      
      {!isTracking && (
        <p className="mt-8 text-white/40 text-sm animate-bounce">
          Start session to track kicks
        </p>
      )}
    </div>
  );
};
