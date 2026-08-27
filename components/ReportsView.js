"use client";

import { useState } from "react";
import { T, card, input, sectionLabel } from "@/lib/theme";
import { useTeamData } from "@/lib/useTeamData";

export default function ReportsView({ profile }) {
  const { team, tasks, loading } = useTeamData(profile);
  const [reportStaff, setReportStaff] = useState("");
  const [period, setPeriod] = useState("weekly");

  if (loading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading reports…</div>;

  if (team.length === 0) {
    return (
      <div style={{ ...card, padding: 14, fontSize: T.font.base, color: T.inkSoft }}>
        No one is reporting to you yet, so there's nothing to report on.
      </div>
    );
  }

  const activeStaffId = reportStaff || team[0].id;
  const cutoff = new Date();
  if (period === "daily") {
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    cutoff.setDate(cutoff.getDate() - 7);
  } else {
    cutoff.setDate(cutoff.getDate() - 30);
  }
  const reportOwner = team.find((s) => s.id === activeStaffId);
  const reportTasks = tasks.filter((t) => t.owner === activeStaffId && t.status === "Done" && t.completed_date && new Date(t.completed_date) >= cutoff);
  const assignedDone = reportTasks.filter((t) => t.source === "assigned").length;
  const selfDone = reportTasks.filter((t) => t.source === "self").length;
  const onTime = reportTasks.filter((t) => new Date(t.completed_date) <= new Date(t.due_date)).length;
  const onTimeRate = reportTasks.length ? Math.round((onTime / reportTasks.length) * 100) : 0;
  const periodLabel = { daily: "today", weekly: "this week", monthly: "this month" }[period];

  return (
    <div>
      <div style={sectionLabel}>Performance report</div>
      <div style={{ ...card, padding: 12 }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 11 }}>
          <select value={activeStaffId} onChange={(e) => setReportStaff(e.target.value)} style={{ ...input, flex: 1 }}>
            {team.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...input, width: 110 }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div style={{ fontSize: T.font.base, color: T.inkSoft, marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>{reportOwner?.full_name}</span> completed{" "}
          <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.ink }}>{reportTasks.length}</span> task{reportTasks.length === 1 ? "" : "s"} {periodLabel}.
        </div>

        <div style={{ display: "flex", gap: 7 }}>
          <ReportStat value={assignedDone} label="Assigned, done" color={T.accent} />
          <ReportStat value={selfDone} label="Self-initiated" color={T.inkSoft} />
          <ReportStat value={onTimeRate + "%"} label="On-time rate" color={onTimeRate >= 70 ? T.good : T.danger} />
        </div>
      </div>
    </div>
  );
}

function ReportStat({ value, label, color }) {
  return (
    <div style={{ flex: 1, background: T.bg, borderRadius: 7, padding: "7px 9px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.mono, color }}>{value}</div>
      <div style={{ fontSize: 9.5, color: T.inkSoft }}>{label}</div>
    </div>
  );
}
