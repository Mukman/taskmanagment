"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ListTodo, Users, BarChart3, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import StaffView from "@/components/StaffView";
import TeamView from "@/components/TeamView";
import ReportsView from "@/components/ReportsView";
import AdminView from "@/components/AdminView";

const TAB_META = {
  mine: { label: "My Tasks", icon: ListTodo },
  team: { label: "Team", icon: Users },
  reports: { label: "Reports", icon: BarChart3 },
  admin: { label: "Users", icon: ShieldCheck },
};

const SIDEBAR_WIDTH = 84;

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("mine");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (error || !profileData) {
        router.replace("/login");
        return;
      }
      setProfile(profileData);
      setLoading(false);
    })();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading || !profile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B95A3", fontSize: 14, fontFamily: fontStack }}>
        Loading…
      </div>
    );
  }

  const canSeeTeam = profile.role === "manager" || profile.role === "director";
  const tabs = ["mine"];
  if (canSeeTeam) tabs.push("team", "reports");
  if (profile.is_admin) tabs.push("admin");

  return (
    <div style={{ minHeight: "100vh", background: "#EEF1F4", fontFamily: fontStack }}>
      {/* Vertical sidebar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          background: "#14213D",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 22,
          paddingBottom: 16,
          zIndex: 10,
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "#2B4C7E", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28, flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "ui-monospace, monospace" }}>T</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", alignItems: "center" }}>
          {tabs.map((key) => {
            const meta = TAB_META[key];
            const Icon = meta.icon;
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                title={meta.label}
                style={{
                  width: 60,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "9px 0",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  color: active ? "#FFFFFF" : "#8CA0BF",
                  position: "relative",
                }}
              >
                {active && <span style={{ position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 3, background: "#5B8AD1" }} />}
                <Icon size={19} strokeWidth={active ? 2.3 : 1.9} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: "-0.01em" }}>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div title={profile.full_name} style={{ width: 32, height: 32, borderRadius: "50%", background: "#2B4C7E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
            {profile.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <button onClick={logout} title="Log out" style={{ background: "none", border: "none", color: "#8CA0BF", cursor: "pointer", padding: 6, display: "flex" }}>
            <LogOut size={17} />
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px 60px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B95A3", marginBottom: 3 }}>
            {profile.full_name} · {profile.role}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#14213D", margin: "0 0 22px", letterSpacing: "-0.015em" }}>
            {TAB_META[view]?.label || "My Tasks"}
          </h1>

          {view === "mine" && <StaffView profile={profile} />}
          {view === "team" && canSeeTeam && <TeamView profile={profile} />}
          {view === "reports" && canSeeTeam && <ReportsView profile={profile} />}
          {view === "admin" && profile.is_admin && <AdminView profile={profile} />}
        </div>
      </div>
    </div>
  );
}

const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
