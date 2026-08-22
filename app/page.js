"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If an invite or password-recovery link lands here instead of on
    // /set-password (e.g. because of a Supabase redirect URL mismatch),
    // catch it and send the person to set their password instead of
    // letting them fall straight into the dashboard with no password set.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=invite") || hash.includes("type=recovery")) {
      router.replace("/set-password" + hash);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? "/dashboard" : "/login");
    });
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6B7A", fontSize: 14 }}>
      Loading…
    </div>
  );
}
