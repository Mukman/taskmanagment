"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
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

  if (loading) return <div style={{ padding: 20, color: "#5C6B7A", fontSize: 14 }}>Loading your tasks…</div>;

  const filtered = tasks.filter((t) => filter === "All" || (filter === "self" ? t.source === "self" : t.source === "assigned"));
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const overdueCount = tasks.filter((t) => t.status !== "Done" && new Date(t.due_date) < new Date(todayISO())).length;

  const urgentTasks = tasks
    .filter((t) => t.status !== "Done" && (t.priority === "High" || new Date(t.due_date) < new Date(todayISO())))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Stat label="Open tasks" value={tasks.length} color="#14213D" />
        <Stat label="Completed" value={doneCount} color="#3D8361" />
        <Stat label="Overdue" value={overdueCount} color={overdueCount ? "#D64550" : "#14213D"} />
      </div>

      {urgentTasks.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D64550" }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D64550" }}>
              Urgent · {urgentTasks.length}
            </span>
          </div>
          {urgentTasks.map((t) => (
            <TaskCard key={t.id} task={t} onAdvance={advance} onDelete={del} />
          ))}
        </div>
      )}

      <AddTaskForm onAdd={add} showAssignee={false} />

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[{ key: "All", label: "All" }, { key: "assigned", label: "Assigned" }, { key: "self", label: "Self-initiated" }].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 11px",
              borderRadius: 20,
              border: "1px solid " + (filter === f.key ? "#14213D" : "#E3E7EC"),
              background: filter === f.key ? "#14213D" : "#fff",
              color: filter === f.key ? "#fff" : "#5C6B7A",
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
          <div key={status} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#5C6B7A", marginBottom: 8 }}>
              {status} · {items.length}
            </div>
            {items.map((t) => (
              <TaskCard key={t.id} task={t} onAdvance={advance} onDelete={del} />
            ))}
          </div>
        );
      })}
      {filtered.length === 0 && <div style={{ textAlign: "center", color: "#9AA5B1", fontSize: 13, padding: "24px 0" }}>Nothing here yet.</div>}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#5C6B7A" }}>{label}</div>
    </div>
  );
}
