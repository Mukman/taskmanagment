"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { T, card, input, btnPrimary, btnSecondary } from "@/lib/theme";

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function AddTaskForm({ onAdd, staffOptions, showAssignee }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(addDays(0));
  const [dueDate, setDueDate] = useState(addDays(2));
  const [assignee, setAssignee] = useState(staffOptions?.[0]?.id || "");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim()) return;
    if (new Date(dueDate) < new Date(startDate)) {
      setError("Due date can't be before the start date.");
      return;
    }
    setError("");
    await onAdd({ title: title.trim(), startDate, dueDate, assignee: assignee || null });
    setTitle("");
    setStartDate(addDays(0));
    setDueDate(addDays(2));
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ ...btnSecondary, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: T.surface, marginBottom: 12, padding: "9px" }}
      >
        <Plus size={14} /> {showAssignee ? "Assign a task" : "Add a task"}
      </button>
    );
  }

  return (
    <div style={{ ...card, padding: 12, marginBottom: 12 }}>
      <input
        autoFocus
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ ...input, marginBottom: 7 }}
      />
      <div style={{ display: "flex", gap: 7, marginBottom: 7 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: T.inkSoft, marginBottom: 3 }}>From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: T.inkSoft, marginBottom: 3 }}>To</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={input} />
        </div>
      </div>
      {error && <div style={{ color: T.danger, fontSize: 12, marginBottom: 7 }}>{error}</div>}
      {showAssignee && (
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ ...input, marginBottom: 7 }}>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>Assign to {s.full_name}</option>
          ))}
        </select>
      )}
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={submit} style={{ ...btnPrimary, flex: 1, padding: "7px" }}>Save</button>
        <button onClick={() => setOpen(false)} style={{ ...btnSecondary, flex: 1, padding: "7px" }}>Cancel</button>
      </div>
    </div>
  );
}
