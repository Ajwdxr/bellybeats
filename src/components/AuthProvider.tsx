"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  useEffect(() => {
    initialize();

    // Check if we have an access_token in the URL fragment (Implicit Flow fallback)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const getParam = (name: string) => {
        const match = hash.match(new RegExp(`${name}=([^&]*)`));
        return match ? match[1] : null;
      };

      const accessToken = getParam("access_token");
      const refreshToken = getParam("refresh_token");

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (!error && data.session) {
            setSession(data.session);
            window.location.hash = ""; // Clear hash
            router.push("/counter");
          }
        });
      }
    }
  }, [initialize, setSession, router]);

  return <>{children}</>;
};
