"use client";

import { useState } from "react";
import { Plus, Paperclip, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, btnPrimary, btnSecondary } from "@/lib/theme";

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function AddTaskForm({ onAdd, staffOptions, showAssignee }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const [startDate, setStartDate] = useState(addDays(0));
  const [dueDate, setDueDate] = useState(addDays(2));
  const [assignee, setAssignee] = useState(staffOptions?.[0]?.id || "");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim()) return;
    const finalStart = multiDay ? startDate : addDays(0);
    const finalDue = multiDay ? dueDate : addDays(0);
    if (new Date(finalDue) < new Date(finalStart)) {
      setError("Due date can't be before the start date.");
      return;
    }
    setError("");

    let attachmentUrl = null;
    let attachmentName = null;

    if (file) {
      setUploading(true);
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
      setUploading(false);
      if (uploadError) {
        setError("Couldn't upload file: " + uploadError.message);
        return;
      }
      attachmentUrl = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
      attachmentName = file.name;
    }

    await onAdd({ title: title.trim(), startDate: finalStart, dueDate: finalDue, assignee: assignee || null, attachmentUrl, attachmentName });
    setTitle("");
    setMultiDay(false);
    setStartDate(addDays(0));
    setDueDate(addDays(2));
    setFile(null);
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

      <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
        {[{ key: false, label: "Today" }, { key: true, label: "Date range" }].map((opt) => (
          <button
            key={String(opt.key)}
            type="button"
            onClick={() => setMultiDay(opt.key)}
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: 600,
              padding: "7px 0",
              borderRadius: T.radius,
              border: `1px solid ${multiDay === opt.key ? T.ink : T.border}`,
              background: multiDay === opt.key ? T.ink : T.surface,
              color: multiDay === opt.key ? "#fff" : T.inkSoft,
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {multiDay && (
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
      )}

      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, borderRadius: T.radius, padding: "6px 9px", marginBottom: 7 }}>
          <Paperclip size={13} color={T.inkSoft} />
          <span style={{ flex: 1, fontSize: 12, color: T.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
          <button onClick={() => setFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        <label style={{ ...btnSecondary, background: T.surface, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7, padding: "7px", boxSizing: "border-box" }}>
          <Paperclip size={13} /> Attach file or image
          <input type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
        </label>
      )}

      {error && <div style={{ color: T.danger, fontSize: 12, marginBottom: 7 }}>{error}</div>}
      {showAssignee && (
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ ...input, marginBottom: 7 }}>
          {staffOptions.map((s) => (
            <option key={s.id} value={s.id}>Assign to {s.full_name}</option>
          ))}
        </select>
      )}
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={submit} disabled={uploading} style={{ ...btnPrimary, flex: 1, padding: "7px" }}>{uploading ? "Uploading…" : "Save"}</button>
        <button onClick={() => setOpen(false)} style={{ ...btnSecondary, flex: 1, padding: "7px" }}>Cancel</button>
      </div>
    </div>
  );
}
