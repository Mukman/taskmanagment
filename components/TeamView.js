"use client";

import { useState } from "react";
import { User, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, sectionLabel } from "@/lib/theme";
import AddTaskForm from "./AddTaskForm";
import TaskCard from "./TaskCard";
import { todayISO } from "@/lib/taskHelpers";
import { useTeamData } from "@/lib/useTeamData";

export default function TeamView({ profile }) {
  const { team, tasks, loading, reload } = useTeamData(profile);
  const [expanded, setExpanded] = useState(null);

  const assign = async ({ title, startDate, dueDate, assignee, attachmentUrl, attachmentName }) => {
    const { error } = await supabase.from("tasks").insert({
      title,
      start_date: startDate,
      due_date: dueDate,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
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

  const removeAssigned = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      alert("Couldn't remove task: " + error.message);
      return;
    }
    reload();
  };

  if (loading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading your team…</div>;

  if (team.length === 0) {
    return (
      <div style={{ ...card, padding: 14, fontSize: T.font.base, color: T.inkSoft }}>
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
      <div style={{ ...sectionLabel }}>{profile.role === "director" ? "All staff" : "Your team"} · task status</div>
      <div style={{ marginBottom: 14 }}>
        {teamStats.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <div key={s.id} style={{ ...card, marginBottom: 6, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(isOpen ? null : s.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={13} color={T.accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.font.base, fontWeight: 600, color: T.ink }}>{s.full_name}</div>
                  <div style={{ fontSize: 10.5, color: T.inkMuted }}>{s.owned.length} task{s.owned.length === 1 ? "" : "s"}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.mono, color: T.ink }}>{s.rate}%</div>
                  {s.overdue > 0 && (
                    <div style={{ fontSize: 9.5, color: T.danger, display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                      <AlertCircle size={9} /> {s.overdue} overdue
                    </div>
                  )}
                </div>
                {isOpen ? <ChevronUp size={14} color={T.inkMuted} /> : <ChevronDown size={14} color={T.inkMuted} />}
              </button>
              {isOpen && (
                <div style={{ padding: "0 11px 11px" }}>
                  {s.owned.length === 0 ? (
                    <div style={{ fontSize: T.font.sm, color: T.inkMuted, padding: "5px 0" }}>No tasks yet.</div>
                  ) : (
                    s.owned.map((t) => (
                      <TaskCard key={t.id} task={t} onDelete={t.assigned_by === profile.id ? () => removeAssigned(t.id) : undefined} />
                    ))
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
