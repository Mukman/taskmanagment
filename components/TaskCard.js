"use client";

import { Check, Clock, X } from "lucide-react";
import { T, priorityColor } from "@/lib/theme";
import { daysAgoLabel, formatShortDate, todayISO } from "@/lib/taskHelpers";

export default function TaskCard({ task, onAdvance, onDelete, assigneeName }) {
  const overdue = task.status !== "Done" && new Date(task.due_date) < new Date(todayISO());

  return (
    <div style={{ display: "flex", gap: 9, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "9px 10px", marginBottom: 6 }}>
      <span style={{ width: 3, borderRadius: 2, background: priorityColor[task.priority], alignSelf: "stretch", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: T.font.base, fontWeight: 600, color: T.ink, lineHeight: 1.35 }}>{task.title}</span>
          {onDelete && (
            <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, padding: 1, flexShrink: 0 }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5, alignItems: "center" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: priorityColor[task.priority] }}>{task.priority}</span>
          {task.start_date && (
            <span style={{ fontSize: 10.5, color: T.inkMuted, fontFamily: T.mono }}>
              {formatShortDate(task.start_date)} → {formatShortDate(task.due_date)}
            </span>
          )}
          <span style={{ fontSize: 11, color: overdue ? T.danger : T.inkSoft, fontFamily: T.mono }}>{daysAgoLabel(task.due_date)}</span>
          {assigneeName && (
            <span style={{ fontSize: 10, background: T.bg, color: T.inkSoft, padding: "1px 6px", borderRadius: 20, fontWeight: 500 }}>{assigneeName}</span>
          )}
          {!assigneeName && task.source === "assigned" && (
            <span style={{ fontSize: 10, background: T.accentSoft, color: T.accent, padding: "1px 6px", borderRadius: 20, fontWeight: 500 }}>assigned</span>
          )}
          {!assigneeName && task.source === "self" && (
            <span style={{ fontSize: 10, background: T.bg, color: T.inkSoft, padding: "1px 6px", borderRadius: 20, fontWeight: 500 }}>self-initiated</span>
          )}
        </div>
        {onAdvance && task.status !== "Done" && (
          <button
            onClick={() => onAdvance(task)}
            style={{ marginTop: 7, fontSize: 11, fontWeight: 600, background: T.ink, color: "#fff", border: "none", borderRadius: 6, padding: "4px 9px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {task.status === "To Do" ? <Clock size={11} /> : <Check size={11} />}
            {task.status === "To Do" ? "Start" : "Mark done"}
          </button>
        )}
      </div>
    </div>
  );
}
