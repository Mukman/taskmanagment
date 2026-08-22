"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function AddTaskForm({ onAdd, staffOptions, showAssignee }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Med");
  const [dueDate, setDueDate] = useState(addDays(2));
  const [assignee, setAssignee] = useState(staffOptions?.[0]?.id || "");

  const submit = async () => {
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), priority, dueDate, assignee: assignee || null });
    setTitle("");
    setPriority("Med");
    setDueDate(addDays(2));
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#14213D", color: "#fff", border: "none", borderRadius: 12, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}
      >
        <Plus size={16} /> {showAssignee ? "Assign a task" : "Add a task"}
      </button>
    );
  }

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <input
        autoFocus
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", border: "1px solid #E3E7EC", borderRadius: 7, padding: "8px 10px", fontSize: 14, marginBottom: 8, boxSizing: "border-box", fontFamily: "inherit" }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ flex: 1, minWidth: 90, border: "1px solid #E3E7EC", borderRadius: 7, padding: "8px 6px", fontSize: 13, fontFamily: "inherit" }}>
          <option value="High">High priority</option>
          <option value="Med">Med priority</option>
          <option value="Low">Low priority</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ flex: 1, minWidth: 130, border: "1px solid #E3E7EC", borderRadius: 7, padding: "8px 6px", fontSize: 13, fontFamily: "inherit" }} />
      </div>
      {showAssignee && (
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ width: "100%", border: "1px solid #E3E7EC", borderRadius: 7, padding: "8px 6px", fontSize: 13, marginBottom: 8, fontFamily: "inherit", boxSizing: "border-box" }}>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>Assign to {s.full_name}</option>
          ))}
        </select>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ flex: 1, background: "#14213D", color: "#fff", border: "none", borderRadius: 7, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
        <button onClick={() => setOpen(false)} style={{ flex: 1, background: "#EEF0F3", color: "#5C6B7A", border: "none", borderRadius: 7, padding: "8px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}
