"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ListTodo, Users, BarChart3, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { T } from "@/lib/theme";
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.inkMuted, fontSize: T.font.base, fontFamily: T.sans }}>
        Loading…
      </div>
    );
  }

  const canSeeTeam = profile.role === "manager" || profile.role === "director";
  const tabs = ["mine"];
  if (canSeeTeam) tabs.push("team");
  tabs.push("reports");
  if (profile.is_admin) tabs.push("admin");

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.sans }}>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: T.sidebarWidth,
          background: T.sidebar,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 18,
          paddingBottom: 14,
          zIndex: 10,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, flexShrink: 0 }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: T.mono }}>T</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", alignItems: "center" }}>
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
                  width: 52,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "7px 0",
                  background: active ? T.sidebarActive : "transparent",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  color: active ? "#FFFFFF" : "#7C89A3",
                  position: "relative",
                }}
              >
                {active && <span style={{ position: "absolute", left: -9, top: "50%", transform: "translateY(-50%)", width: 2, height: 14, borderRadius: 2, background: "#5B8AD1" }} />}
                <Icon size={16} strokeWidth={active ? 2.3 : 1.9} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div title={profile.full_name} style={{ width: 26, height: 26, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>
            {profile.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <button onClick={logout} title="Log out" style={{ background: "none", border: "none", color: "#7C89A3", cursor: "pointer", padding: 5, display: "flex" }}>
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      <div style={{ marginLeft: T.sidebarWidth }}>
        <div style={{ maxWidth: T.contentWidth, margin: "0 auto", padding: "22px 20px 48px" }}>
          <div style={{ fontSize: T.font.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkMuted, marginBottom: 2 }}>
            {profile.full_name} · {profile.role}
          </div>
          <h1 style={{ fontSize: T.font.xxl, fontWeight: 700, color: T.ink, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            {TAB_META[view]?.label || "My Tasks"}
          </h1>

          {view === "mine" && <StaffView profile={profile} />}
          {view === "team" && canSeeTeam && <TeamView profile={profile} />}
          {view === "reports" && <ReportsView profile={profile} />}
          {view === "admin" && profile.is_admin && <AdminView profile={profile} />}
        </div>
      </div>
    </div>
  );
}
