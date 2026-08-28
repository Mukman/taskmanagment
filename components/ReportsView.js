"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, sectionLabel } from "@/lib/theme";
import { useTeamData } from "@/lib/useTeamData";

function getCutoff(period) {
  const cutoff = new Date();
  if (period === "daily") {
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    cutoff.setDate(cutoff.getDate() - 7);
  } else {
    cutoff.setDate(cutoff.getDate() - 30);
  }
  return cutoff;
}

function summarize(tasksForPerson, cutoff) {
  const done = tasksForPerson.filter((t) => t.status === "Done" && t.completed_date && new Date(t.completed_date) >= cutoff);
  const assignedDone = done.filter((t) => t.source === "assigned").length;
  const selfDone = done.filter((t) => t.source === "self").length;
  const onTime = done.filter((t) => new Date(t.completed_date) <= new Date(t.due_date)).length;
  const onTimeRate = done.length ? Math.round((onTime / done.length) * 100) : 0;
  return { total: done.length, assignedDone, selfDone, onTimeRate };
}

export default function ReportsView({ profile }) {
  const isStaff = profile.role === "staff";
  const [period, setPeriod] = useState("weekly");
  const periodLabel = { daily: "today", weekly: "this week", monthly: "this month" }[period];
  const cutoff = getCutoff(period);

  // Personal tasks — used directly for staff, and for a manager/director's
  // own work (they can self-assign too, via My Tasks).
  const [ownTasks, setOwnTasks] = useState([]);
  const [ownLoading, setOwnLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("tasks").select("*").eq("owner", profile.id);
      setOwnTasks(data || []);
      setOwnLoading(false);
    })();
  }, [profile.id]);

  // Team data — only meaningful for manager/director, harmless empty result for staff.
  const { team, tasks: teamTasks, loading: teamLoading } = useTeamData(profile);

  if (isStaff) {
    if (ownLoading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading your report…</div>;
    const mine = summarize(ownTasks, cutoff);
    return (
      <div>
        <div style={sectionLabel}>Your report</div>
        <div style={{ ...card, padding: 12 }}>
          <PeriodPicker period={period} setPeriod={setPeriod} />
          <div style={{ fontSize: T.font.base, color: T.inkSoft, marginBottom: 10 }}>
            You completed <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.ink }}>{mine.total}</span> task{mine.total === 1 ? "" : "s"} {periodLabel}.
          </div>
          <StatRow assignedDone={mine.assignedDone} selfDone={mine.selfDone} onTimeRate={mine.onTimeRate} />
        </div>
      </div>
    );
  }

  if (teamLoading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading reports…</div>;

  const teamSummaries = team.map((s) => ({ person: s, ...summarize(teamTasks.filter((t) => t.owner === s.id), cutoff) }));
  const totals = teamSummaries.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      assignedDone: acc.assignedDone + s.assignedDone,
      selfDone: acc.selfDone + s.selfDone,
      onTimeSum: acc.onTimeSum + s.onTimeRate * s.total,
    }),
    { total: 0, assignedDone: 0, selfDone: 0, onTimeSum: 0 }
  );
  const overallOnTime = totals.total ? Math.round(totals.onTimeSum / totals.total) : 0;

  return (
    <div>
      <div style={sectionLabel}>Team total</div>
      <div style={{ ...card, padding: 12, marginBottom: 16 }}>
        <PeriodPicker period={period} setPeriod={setPeriod} />
        {team.length === 0 ? (
          <div style={{ fontSize: T.font.base, color: T.inkSoft }}>No one is reporting to you yet.</div>
        ) : (
          <>
            <div style={{ fontSize: T.font.base, color: T.inkSoft, marginBottom: 10 }}>
              Your team completed <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.ink }}>{totals.total}</span> task{totals.total === 1 ? "" : "s"} {periodLabel}.
            </div>
            <StatRow assignedDone={totals.assignedDone} selfDone={totals.selfDone} onTimeRate={overallOnTime} />
          </>
        )}
      </div>

      {team.length > 0 && (
        <>
          <div style={sectionLabel}>By staff member</div>
          {teamSummaries.map(({ person, total, assignedDone, selfDone, onTimeRate }) => (
            <div key={person.id} style={{ ...card, padding: "10px 12px", marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: T.font.base, fontWeight: 600, color: T.ink }}>{person.full_name}</span>
                <span style={{ fontSize: 11, color: T.inkMuted }}>{total} completed {periodLabel}</span>
              </div>
              <StatRow assignedDone={assignedDone} selfDone={selfDone} onTimeRate={onTimeRate} compact />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PeriodPicker({ period, setPeriod }) {
  return (
    <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...input, width: 130, marginBottom: 11 }}>
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
    </select>
  );
}

function StatRow({ assignedDone, selfDone, onTimeRate, compact }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      <ReportStat value={assignedDone} label="Assigned, done" color={T.accent} bg={T.accentSoft} compact={compact} />
      <ReportStat value={selfDone} label="Self-initiated" color={T.inkSoft} bg={T.neutralSoft} compact={compact} />
      <ReportStat value={onTimeRate + "%"} label="On-time" color={onTimeRate >= 70 ? T.good : T.danger} bg={onTimeRate >= 70 ? T.goodSoft : T.dangerSoft} compact={compact} />
    </div>
  );
}

function ReportStat({ value, label, color, bg, compact }) {
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 7, padding: compact ? "5px 7px" : "7px 9px" }}>
      <div style={{ fontSize: compact ? 13 : 15, fontWeight: 700, fontFamily: T.mono, color }}>{value}</div>
      <div style={{ fontSize: 9, color, opacity: 0.75 }}>{label}</div>
    </div>
  );
}
