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
import IdleLogout from "@/components/IdleLogout";

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
      <IdleLogout />
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: T.sidebarWidth,
          background: T.sidebarBg,
          borderRight: `1px solid ${T.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
          padding: "20px 14px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 26, paddingLeft: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 12, fontFamily: T.mono }}>T</span>
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, letterSpacing: "-0.01em" }}>Taskline</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map((key) => {
            const meta = TAB_META[key];
            const Icon = meta.icon;
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 10px",
                  background: active ? T.sidebarActive : "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: active ? T.accent : T.inkSoft,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 9, paddingTop: 12, borderTop: `1px solid ${T.sidebarBorder}` }}>
          <div title={profile.full_name} style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {profile.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.full_name}</div>
            <div style={{ fontSize: 10.5, color: T.inkMuted, textTransform: "capitalize" }}>{profile.role}</div>
          </div>
          <button onClick={logout} title="Log out" style={{ background: "none", border: "none", color: T.inkMuted, cursor: "pointer", padding: 4, display: "flex", flexShrink: 0 }}>
            <LogOut size={15} />
          </button>
        </div>
      </nav>

      <div style={{ marginLeft: T.sidebarWidth }}>
        <div style={{ maxWidth: T.contentWidth, margin: "0 auto", padding: "36px 32px 64px" }}>
          <h1 style={{ fontSize: T.font.xxl, fontWeight: 700, color: T.ink, margin: "0 0 24px", letterSpacing: "-0.015em" }}>
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
