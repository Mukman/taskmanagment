"use client";

import { useState } from "react";
import { useTeamData } from "@/lib/useTeamData";

export default function ReportsView({ profile }) {
  const { team, tasks, loading } = useTeamData(profile);
  const [reportStaff, setReportStaff] = useState("");
  const [reportDays, setReportDays] = useState(30);

  if (loading) return <div style={{ padding: 20, color: "#5C6B7A", fontSize: 14 }}>Loading reports…</div>;

  if (team.length === 0) {
    return (
      <div style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 10, padding: 16, fontSize: 13, color: "#5C6B7A" }}>
        No one is reporting to you yet, so there's nothing to report on.
      </div>
    );
  }

  const activeStaffId = reportStaff || team[0].id;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - reportDays);
  const reportOwner = team.find((s) => s.id === activeStaffId);
  const reportTasks = tasks.filter((t) => t.owner === activeStaffId && t.status === "Done" && t.completed_date && new Date(t.completed_date) >= cutoff);
  const assignedDone = reportTasks.filter((t) => t.source === "assigned").length;
  const selfDone = reportTasks.filter((t) => t.source === "self").length;
  const onTime = reportTasks.filter((t) => new Date(t.completed_date) <= new Date(t.due_date)).length;
  const onTimeRate = reportTasks.length ? Math.round((onTime / reportTasks.length) * 100) : 0;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C6B7A", marginBottom: 8 }}>Performance report</div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 10, padding: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <select value={activeStaffId} onChange={(e) => setReportStaff(e.target.value)} style={{ flex: 1, border: "1px solid #E3E7EC", borderRadius: 7, padding: "7px 6px", fontSize: 13, fontFamily: "inherit" }}>
            {team.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
          <select value={reportDays} onChange={(e) => setReportDays(Number(e.target.value))} style={{ border: "1px solid #E3E7EC", borderRadius: 7, padding: "7px 6px", fontSize: 13, fontFamily: "inherit" }}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div style={{ fontSize: 13, color: "#5C6B7A", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: "#14213D" }}>{reportOwner?.full_name}</span> completed{" "}
          <span style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, color: "#14213D" }}>{reportTasks.length}</span> task{reportTasks.length === 1 ? "" : "s"} in this period.
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <ReportStat value={assignedDone} label="Assigned, done" color="#2B4C7E" />
          <ReportStat value={selfDone} label="Self-initiated, done" color="#5C6B7A" />
          <ReportStat value={onTimeRate + "%"} label="On-time rate" color={onTimeRate >= 70 ? "#3D8361" : "#D64550"} />
        </div>
      </div>
    </div>
  );
}

function ReportStat({ value, label, color }) {
  return (
    <div style={{ flex: 1, background: "#EEF0F3", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "ui-monospace, monospace", color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#5C6B7A" }}>{label}</div>
    </div>
  );
}
