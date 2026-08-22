"use client";

import { useState } from "react";
import { User, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AddTaskForm from "./AddTaskForm";
import TaskCard from "./TaskCard";
import { todayISO } from "@/lib/taskHelpers";
import { useTeamData } from "@/lib/useTeamData";

export default function TeamView({ profile }) {
  const { team, tasks, loading, reload } = useTeamData(profile);
  const [expanded, setExpanded] = useState(null);

  const assign = async ({ title, priority, dueDate, assignee }) => {
    const { error } = await supabase.from("tasks").insert({
      title,
      priority,
      due_date: dueDate,
      status: "To Do",
      source: "assigned",
      owner: assignee,
      assigned_by: profile.id,
    });
    if (error) {
      alert("Couldn't assign task: " + error.message);
      return;
    }
    reload();
  };

  if (loading) return <div style={{ padding: 20, color: "#5C6B7A", fontSize: 14 }}>Loading your team…</div>;

  if (team.length === 0) {
    return (
      <div style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: 16, fontSize: 13, color: "#5C6B7A" }}>
        No one is reporting to you yet. In Supabase, set a staff member's <code>manager_id</code> to your user id (Table editor → profiles) to see them here.
      </div>
    );
  }

  const teamStats = team.map((s) => {
    const owned = tasks.filter((t) => t.owner === s.id);
    const done = owned.filter((t) => t.status === "Done").length;
    const overdue = owned.filter((t) => t.status !== "Done" && new Date(t.due_date) < new Date(todayISO())).length;
    const rate = owned.length ? Math.round((done / owned.length) * 100) : 0;
    return { ...s, owned, done, overdue, rate };
  });

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C6B7A", marginBottom: 8 }}>
        {profile.role === "director" ? "All staff" : "Your team"} · task status
      </div>
      <div style={{ marginBottom: 16 }}>
        {teamStats.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <div key={s.id} style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, marginBottom: 8, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF0F3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={16} color="#2B4C7E" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#14213D" }}>{s.full_name}</div>
                  <div style={{ fontSize: 11, color: "#9AA5B1" }}>{s.owned.length} task{s.owned.length === 1 ? "" : "s"}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "#14213D" }}>{s.rate}%</div>
                  {s.overdue > 0 && (
                    <div style={{ fontSize: 10, color: "#D64550", display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                      <AlertCircle size={10} /> {s.overdue} overdue
                    </div>
                  )}
                </div>
                {isOpen ? <ChevronUp size={16} color="#9AA5B1" /> : <ChevronDown size={16} color="#9AA5B1" />}
              </button>
              {isOpen && (
                <div style={{ padding: "0 12px 12px" }}>
                  {s.owned.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#9AA5B1", padding: "6px 0" }}>No tasks yet.</div>
                  ) : (
                    s.owned.map((t) => <TaskCard key={t.id} task={t} />)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddTaskForm onAdd={assign} staffOptions={team} showAssignee={true} />
    </div>
  );
}
