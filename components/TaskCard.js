"use client";

import { useState } from "react";
import { Check, Clock, X, Paperclip, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, btnPrimary, btnSecondary } from "@/lib/theme";
import { daysAgoLabel, formatShortDate, todayISO } from "@/lib/taskHelpers";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

export default function TaskCard({ task, onAdvance, onDelete, onEdit, assigneeName }) {
  const [isEditing, setIsEditing] = useState(false);

  const overdue = task.status !== "Done" && new Date(task.due_date) < new Date(todayISO());
  const isImage = task.attachment_url && IMAGE_EXT.test(task.attachment_name || task.attachment_url);

  if (isEditing) {
    return <EditForm task={task} onCancel={() => setIsEditing(false)} onSave={onEdit} />;
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: "12px 14px", marginBottom: 8 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontSize: T.font.base, fontWeight: 600, color: T.ink, lineHeight: 1.35 }}>{task.title}</span>
          <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {onEdit && (
              <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, padding: 1, display: "flex" }}>
                <Pencil size={12} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete "${task.title}"? This can't be undone.`)) onDelete(task.id);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, padding: 1, display: "flex" }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5, alignItems: "center" }}>
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

        {task.attachment_url && (
          <a href={task.attachment_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 7 }}>
            {isImage ? (
              <img src={task.attachment_url} alt={task.attachment_name || "attachment"} style={{ maxHeight: 90, borderRadius: 6, border: `1px solid ${T.border}`, display: "block" }} />
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: T.accent, background: T.accentSoft, padding: "3px 8px", borderRadius: 20 }}>
                <Paperclip size={11} /> {task.attachment_name || "Attachment"}
              </span>
            )}
          </a>
        )}

        {onAdvance && task.status !== "Done" && (
          <button
            onClick={() => {
              if (task.status === "In Progress") {
                if (confirm(`Mark "${task.title}" as done?`)) onAdvance(task);
              } else {
                onAdvance(task);
              }
            }}
            style={{
              marginTop: 7,
              fontSize: 11,
              fontWeight: 600,
              background: task.status === "To Do" ? T.accent : T.good,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 9px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {task.status === "To Do" ? <Clock size={11} /> : <Check size={11} />}
            {task.status === "To Do" ? "Start" : "Mark done"}
          </button>
        )}
      </div>
    </div>
  );
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function EditForm({ task, onCancel, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [multiDay, setMultiDay] = useState(task.start_date !== task.due_date);
  const [startDate, setStartDate] = useState(task.start_date || addDays(0));
  const [dueDate, setDueDate] = useState(task.due_date);
  const [file, setFile] = useState(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isImage = task.attachment_url && IMAGE_EXT.test(task.attachment_name || task.attachment_url);

  const save = async () => {
    if (!title.trim()) return;
    const finalStart = multiDay ? startDate : addDays(0);
    const finalDue = multiDay ? dueDate : addDays(0);
    if (new Date(finalDue) < new Date(finalStart)) {
      setError("Due date can't be before the start date.");
      return;
    }
    setError("");
    setSaving(true);

    const updates = { title: title.trim(), start_date: finalStart, due_date: finalDue };

    if (file) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
      if (uploadError) {
        setSaving(false);
        setError("Couldn't upload file: " + uploadError.message);
        return;
      }
      updates.attachment_url = supabase.storage.from("attachments").getPublicUrl(path).data.publicUrl;
      updates.attachment_name = file.name;
    } else if (removeAttachment) {
      updates.attachment_url = null;
      updates.attachment_name = null;
    }

    await onSave(task.id, updates);
    setSaving(false);
  };

  return (
    <div style={{ ...card, padding: 12, marginBottom: 8 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...input, marginBottom: 7 }} />

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
              borderRadius: T.radius - 2,
              border: `1px solid ${multiDay === opt.key ? T.accent : T.border}`,
              background: multiDay === opt.key ? T.accentSoft : T.surface,
              color: multiDay === opt.key ? T.accent : T.inkSoft,
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

      {task.attachment_url && !removeAttachment && !file && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, borderRadius: T.radius - 2, padding: "6px 9px", marginBottom: 7 }}>
          {isImage ? <img src={task.attachment_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} /> : <Paperclip size={13} color={T.inkSoft} />}
          <span style={{ flex: 1, fontSize: 12, color: T.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.attachment_name || "Attachment"}</span>
          <button onClick={() => setRemoveAttachment(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      )}

      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.bg, borderRadius: T.radius - 2, padding: "6px 9px", marginBottom: 7 }}>
          <Paperclip size={13} color={T.inkSoft} />
          <span style={{ flex: 1, fontSize: 12, color: T.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
          <button onClick={() => setFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkMuted, display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      ) : (
        (!task.attachment_url || removeAttachment) && (
          <label style={{ ...btnSecondary, background: T.surface, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7, padding: "7px", boxSizing: "border-box" }}>
            <Paperclip size={13} /> Attach file or image
            <input type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          </label>
        )
      )}

      {error && <div style={{ color: T.danger, fontSize: 12, marginBottom: 7 }}>{error}</div>}

      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={save} disabled={saving} style={{ ...btnPrimary, flex: 1, padding: "7px" }}>{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} style={{ ...btnSecondary, flex: 1, padding: "7px" }}>Cancel</button>
      </div>
    </div>
  );
}
