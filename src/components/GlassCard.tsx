import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

export const GlassCard = ({ 
  children, 
  glowColor = "rgba(96, 165, 250, 0.15)", 
  className,
  ...props 
}: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden p-6 hover:shadow-2xl",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${glowColor}`
      }}
      {...props}
    >
      {/* Dynamic background glow */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor.replace(/0\.15\)$/, '0.05)')}, transparent 70%)`,
          filter: "blur(40px)"
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
