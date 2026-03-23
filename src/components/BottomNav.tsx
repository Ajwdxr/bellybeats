"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChartBar, Activity, UserCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: ChartBar },
  { label: "Counter", href: "/counter", icon: Activity },
  { label: "Monitoring", href: "/partner", icon: Users },
  { label: "Profile", href: "/profile", icon: UserCircle },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
      <div className="glass shadow-2xl rounded-full px-6 py-3 flex items-center gap-1 md:gap-4 pointer-events-auto border border-white/20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "relative group px-4 py-2 transition-all duration-300 rounded-full flex items-center gap-2",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "group-hover:scale-110"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-300 origin-left hidden sm:inline-block",
                isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
