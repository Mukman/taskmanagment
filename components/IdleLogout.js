"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Adjust this to change how long someone can sit idle before being signed
// out automatically.
const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

export default function IdleLogout() {
  const router = useRouter();
  const timerRef = useRef(null);

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();
      router.replace("/login?timeout=1");
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, IDLE_LIMIT_MS);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return null;
}
