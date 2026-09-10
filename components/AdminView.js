"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Archive, ArchiveRestore, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, btnPrimary, btnSecondary, sectionLabel } from "@/lib/theme";

async function authedFetch(path, body, method = "POST") {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Something went wrong.");
  return result;
}

export default function AdminView({ profile }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [banner, setBanner] = useState(null);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const [managerId, setManagerId] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    // Fetch all users, active and inactive
    const { data: everyone } = await supabase.from("profiles").select("*").order("full_name");
    setPeople(everyone || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async (e) => {
    e.preventDefault();
    setBanner(null);
    setInviting(true);
    try {
      await authedFetch("/api/admin/create-user", { email, fullName, role, managerId: managerId || null });
      setBanner({ type: "success", text: `Invite sent to ${email}.` });
      setEmail("");
      setFullName("");
      setRole("staff");
      setManagerId("");
      load();
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    }
    setInviting(false);
  };

  const saveEdit = async (person) => {
    setBanner(null);
    try {
      await authedFetch(
        "/api/admin/update-user",
        { userId: person.id, fullName: person.full_name, role: person.role, managerId: person.manager_id, isAdmin: person.is_admin },
        "PATCH"
      );
      setEditingId(null);
      load();
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    }
  };

  const toggleArchive = async (person) => {
    const action = person.is_active ? "archive" : "unarchive";
    const actionText = action === "archive" ? "Archive" : "Unarchive";
    
    if (!confirm(`${actionText} ${person.full_name}? ${action === "archive" ? "Their task history will be preserved for reports, but they will be marked as inactive." : "This will restore their active status."}`)) return;
    
    setBanner(null);
    try {
      await authedFetch("/api/admin/delete-user", { userId: person.id, action });
      load();
      setBanner({ type: "success", text: `${person.full_name} has been ${action}d.` });
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    }
  };

  if (loading) return <div style={{ color: T.inkMuted, fontSize: T.font.base }}>Loading…</div>;

  const potentialManagers = people.filter((p) => (p.role === "manager" || p.role === "director") && p.is_active);

  return (
    <div>
      <div style={sectionLabel}>Invite someone</div>
      <form onSubmit={invite} style={{ ...card, padding: 12, marginBottom: 14 }}>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={input} />
        </Field>
        <Field label="Full name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required style={input} />
        </Field>
        <div style={{ display: "flex", gap: 7 }}>
          <Field label="Role" style={{ flex: 1 }}>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={input}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </Field>
          {role === "staff" && (
            <Field label="Reports to" style={{ flex: 1 }}>
              <select value={managerId} onChange={(e) => setManagerId(e.target.value)} style={input}>
                <option value="">— None yet —</option>
                {potentialManagers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <button type="submit" disabled={inviting} style={{ ...btnPrimary, width: "100%" }}>
          {inviting ? "Sending invite…" : "Send invite"}
        </button>
      </form>

      {banner && (
        <div style={{ fontSize: T.font.base, marginBottom: 14, color: banner.type === "error" ? T.danger : T.good, fontWeight: 600 }}>
          {banner.text}
        </div>
      )}

      <div style={sectionLabel}>Everyone ({people.length})</div>
      {people.map((p) => (
        <PersonRow
          key={p.id}
          person={p}
          isEditing={editingId === p.id}
          onEdit={() => setEditingId(p.id)}
          onCancel={() => {
            setEditingId(null);
            load();
          }}
          onToggleArchive={() => toggleArchive(p)}
          onSave={saveEdit}
          onFieldChange={(field, value) => setPeople((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)))}
          managers={potentialManagers.filter((m) => m.id !== p.id)}
          canArchive={p.id !== profile.id}
        />
      ))}
    </div>
  );
}

function PersonRow({ person, isEditing, onEdit, onCancel, onToggleArchive, onSave, onFieldChange, managers, canArchive }) {
  const isArchived = !person.is_active;

  if (isEditing) {
    return (
      <div style={{ ...card, padding: 12, marginBottom: 6, opacity: isArchived ? 0.6 : 1 }}>
        <Field label="Full name">
          <input value={person.full_name} onChange={(e) => onFieldChange("full_name", e.target.value)} style={input} />
        </Field>
        <div style={{ display: "flex", gap: 7 }}>
          <Field label="Role" style={{ flex: 1 }}>
            <select value={person.role} onChange={(e) => onFieldChange("role", e.target.value)} style={input}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </Field>
          {person.role === "staff" && (
            <Field label="Reports to" style={{ flex: 1 }}>
              <select value={person.manager_id || ""} onChange={(e) => onFieldChange("manager_id", e.target.value)} style={input}>
                <option value="">— None —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.font.sm, color: T.inkSoft, margin: "2px 0 10px" }}>
          <input type="checkbox" checked={person.is_admin} onChange={(e) => onFieldChange("is_admin", e.target.checked)} />
          Can manage accounts (admin)
        </label>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => onSave(person)} style={{ ...btnPrimary, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Check size={13} /> Save
          </button>
          <button onClick={onCancel} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", marginBottom: 6, opacity: isArchived ? 0.5 : 1, background: isArchived ? T.surface : card.background }}>
      <div>
        <div style={{ fontSize: T.font.base, fontWeight: 600, color: T.ink, display: "flex", alignItems: "center", gap: 6 }}>
          {person.full_name} 
          {person.is_admin && <span style={{ fontSize: 9, fontWeight: 700, color: T.accent, background: T.accentSoft, padding: "1px 5px", borderRadius: 20 }}>ADMIN</span>}
          {isArchived && <span style={{ fontSize: 9, fontWeight: 700, color: T.inkMuted, background: T.border, padding: "1px 5px", borderRadius: 20 }}>ARCHIVED</span>}
        </div>
        <div style={{ fontSize: 11, color: T.inkMuted, textTransform: "capitalize" }}>{person.role}</div>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        <IconButton onClick={onEdit} title="Edit"><Pencil size={13} /></IconButton>
        {canArchive && (
          <IconButton 
            onClick={onToggleArchive} 
            title={isArchived ? "Unarchive" : "Archive"} 
            danger={!isArchived}
          >
            {isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
          </IconButton>
        )}
      </div>
    </div>
  );
}

function IconButton({ onClick, title, children, danger }) {
  return (
    <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, color: danger ? T.danger : T.inkSoft, display: "flex" }}>
      {children}
    </button>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: T.inkSoft, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}