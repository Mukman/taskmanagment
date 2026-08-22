"use client";

import { Check, Clock, X } from "lucide-react";
import { PRIORITY, daysAgoLabel, todayISO } from "@/lib/taskHelpers";

export default function TaskCard({ task, onAdvance, onDelete, assigneeName }) {
  const overdue = task.status !== "Done" && new Date(task.due_date) < new Date(todayISO());

  return (
    <div style={{ display: "flex", gap: 10, background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: "10px 12px", marginBottom: 8, boxShadow: "0 1px 2px rgba(20,33,61,0.03)" }}>
      <span style={{ width: 4, borderRadius: 2, background: PRIORITY[task.priority].color, alignSelf: "stretch", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#14213D", lineHeight: 1.3 }}>{task.title}</span>
          {onDelete && (
            <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9AA5B1", padding: 2, flexShrink: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: PRIORITY[task.priority].color }}>{task.priority}</span>
          <span style={{ fontSize: 12, color: overdue ? "#D64550" : "#5C6B7A", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{daysAgoLabel(task.due_date)}</span>
          {assigneeName && (
            <span style={{ fontSize: 11, background: "#EEF0F3", color: "#5C6B7A", padding: "1px 7px", borderRadius: 20, fontWeight: 500 }}>{assigneeName}</span>
          )}
          {!assigneeName && task.source === "assigned" && (
            <span style={{ fontSize: 11, background: "#EEF0F3", color: "#2B4C7E", padding: "1px 7px", borderRadius: 20, fontWeight: 500 }}>assigned</span>
          )}
          {!assigneeName && task.source === "self" && (
            <span style={{ fontSize: 11, background: "#EEF0F3", color: "#5C6B7A", padding: "1px 7px", borderRadius: 20, fontWeight: 500 }}>self-initiated</span>
          )}
        </div>
        {onAdvance && task.status !== "Done" && (
          <button
            onClick={() => onAdvance(task)}
            style={{ marginTop: 8, fontSize: 12, fontWeight: 600, background: "#14213D", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            {task.status === "To Do" ? <Clock size={12} /> : <Check size={12} />}
            {task.status === "To Do" ? "Start" : "Mark done"}
          </button>
        )}
      </div>
    </div>
  );
}
