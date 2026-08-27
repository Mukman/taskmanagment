"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, sectionLabel } from "@/lib/theme";
import TaskCard from "./TaskCard";
import AddTaskForm from "./AddTaskForm";
import { STATUSES, todayISO } from "@/lib/taskHelpers";

export default function StaffView({ profile }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner", profile.id)
      .order("created_at", { ascending: false });
    if (!error) setTasks(data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const add = async ({ title, priority, dueDate }) => {
    const { error } = await supabase.from("tasks").insert({
      title,
      priority,
      due_date: dueDate,
      status: "To Do",
      source: "self",
      owner: profile.id,
    });
    if (error) {
      alert("Couldn't add task: " + error.message);
      return;
    }
    loadTasks();
  };

  const advance = async (task) => {
    const next = task.status === "To Do" ? "In Progress" : "Done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: next, completed_date: next === "Done" ? todayISO() : null })
      .eq("id", task.id);
    if (!error) loadTasks();
  };

  const del = async (id) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) loadTasks();
  };

  if (loading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading your tasks…</div>;

  const filtered = tasks.filter((t) => filter === "All" || (filter === "self" ? t.source === "self" : t.source === "assigned"));
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdueCount = tasks.filter((t) => t.status !== "Done" && new Date(t.due_date) < new Date(todayISO())).length;
  const urgentTasks = tasks
    .filter((t) => t.status !== "Done" && (t.priority === "High" || new Date(t.due_date) < new Date(todayISO())))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div>
      <div style={{ ...card, display: "flex", marginBottom: 14, overflow: "hidden" }}>
        <Stat label="Open" value={tasks.length} color={T.ink} />
        <Divider />
        <Stat label="Completed" value={doneCount} color={T.good} />
        <Divider />
        <Stat label="Overdue" value={overdueCount} color={overdueCount ? T.danger : T.ink} />
      </div>

      {urgentTasks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.danger }} />
            <span style={{ ...sectionLabel, color: T.danger, marginBottom: 0 }}>Urgent · {urgentTasks.length}</span>
          </div>
          {urgentTasks.map((t) => (
            <TaskCard key={t.id} task={t} onAdvance={advance} onDelete={del} />
          ))}
        </div>
      )}

      <AddTaskForm onAdd={add} showAssignee={false} />

      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {[{ key: "All", label: "All" }, { key: "assigned", label: "Assigned" }, { key: "self", label: "Self-initiated" }].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${filter === f.key ? T.ink : T.border}`,
              background: filter === f.key ? T.ink : T.surface,
              color: filter === f.key ? "#fff" : T.inkSoft,
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {STATUSES.map((status) => {
        const items = filtered.filter((t) => t.status === status);
        if (items.length === 0) return null;
        return (
          <div key={status} style={{ marginBottom: 14 }}>
            <div style={sectionLabel}>{status} · {items.length}</div>
            {items.map((t) => (
              <TaskCard key={t.id} task={t} onAdvance={advance} onDelete={del} />
            ))}
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ textAlign: "center", color: T.inkMuted, fontSize: T.font.base, padding: "20px 0" }}>Nothing here yet.</div>}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: "10px 12px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: T.mono, color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: T.inkSoft }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: T.border }} />;
}
