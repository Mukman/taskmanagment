"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
  const [banner, setBanner] = useState(null); // { type: 'error'|'success', text }

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");
  const [managerId, setManagerId] = useState("");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
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

  const remove = async (person) => {
    if (!confirm(`Delete ${person.full_name}? This also deletes all of their tasks. This can't be undone.`)) return;
    setBanner(null);
    try {
      await authedFetch("/api/admin/delete-user", { userId: person.id });
      load();
    } catch (err) {
      setBanner({ type: "error", text: err.message });
    }
  };

  if (loading) return <div style={{ padding: 4, color: "#5C6B7A", fontSize: 14 }}>Loading…</div>;

  const potentialManagers = people.filter((p) => p.role === "manager" || p.role === "director");

  return (
    <div>
      <SectionLabel>Invite someone</SectionLabel>
      <form onSubmit={invite} style={cardStyle}>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </Field>
        <Field label="Full name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 8 }}>
          <Field label="Role" style={{ flex: 1 }}>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </Field>
          {role === "staff" && (
            <Field label="Reports to" style={{ flex: 1 }}>
              <select value={managerId} onChange={(e) => setManagerId(e.target.value)} style={inputStyle}>
                <option value="">— None yet —</option>
                {potentialManagers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <button type="submit" disabled={inviting} style={primaryBtnStyle}>
          {inviting ? "Sending invite…" : "Send invite"}
        </button>
      </form>

      {banner && (
        <div style={{ fontSize: 13, marginBottom: 16, color: banner.type === "error" ? "#D64550" : "#3D8361", fontWeight: 600 }}>
          {banner.text}
        </div>
      )}

      <SectionLabel>Everyone ({people.length})</SectionLabel>
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
          onDelete={() => remove(p)}
          onSave={saveEdit}
          onFieldChange={(field, value) => setPeople((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)))}
          managers={potentialManagers.filter((m) => m.id !== p.id)}
          canDelete={p.id !== profile.id}
        />
      ))}
    </div>
  );
}

function PersonRow({ person, isEditing, onEdit, onCancel, onDelete, onSave, onFieldChange, managers, canDelete }) {
  if (isEditing) {
    return (
      <div style={{ ...cardStyle, marginBottom: 8 }}>
        <Field label="Full name">
          <input value={person.full_name} onChange={(e) => onFieldChange("full_name", e.target.value)} style={inputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 8 }}>
          <Field label="Role" style={{ flex: 1 }}>
            <select value={person.role} onChange={(e) => onFieldChange("role", e.target.value)} style={inputStyle}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
          </Field>
          {person.role === "staff" && (
            <Field label="Reports to" style={{ flex: 1 }}>
              <select value={person.manager_id || ""} onChange={(e) => onFieldChange("manager_id", e.target.value)} style={inputStyle}>
                <option value="">— None —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#5C6B7A", margin: "2px 0 12px" }}>
          <input type="checkbox" checked={person.is_admin} onChange={(e) => onFieldChange("is_admin", e.target.checked)} />
          Can manage accounts (admin)
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onSave(person)} style={{ ...primaryBtnStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Check size={14} /> Save
          </button>
          <button onClick={onCancel} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: "11px 14px", marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#14213D" }}>
          {person.full_name} {person.is_admin && <span style={{ fontSize: 10, fontWeight: 700, color: "#2B4C7E", background: "#EAF0FA", padding: "1px 6px", borderRadius: 20, marginLeft: 4 }}>ADMIN</span>}
        </div>
        <div style={{ fontSize: 12, color: "#9AA5B1", textTransform: "capitalize" }}>{person.role}</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <IconButton onClick={onEdit} title="Edit"><Pencil size={15} /></IconButton>
        {canDelete && (
          <IconButton onClick={onDelete} title="Delete" danger><Trash2 size={15} /></IconButton>
        )}
      </div>
    </div>
  );
}

function IconButton({ onClick, title, children, danger }) {
  return (
    <button onClick={onClick} title={title} style={{ background: "none", border: "none", cursor: "pointer", padding: 7, borderRadius: 8, color: danger ? "#D64550" : "#5C6B7A", display: "flex" }}>
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8B95A3", marginBottom: 10, marginTop: 4 }}>{children}</div>;
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5C6B7A", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const cardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E3E7EC",
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
  boxShadow: "0 1px 2px rgba(20,33,61,0.04)",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #DDE1E6",
  borderRadius: 8,
  padding: "9px 10px",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const primaryBtnStyle = {
  width: "100%",
  background: "#14213D",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#F1F3F6",
  color: "#5C6B7A",
  border: "none",
  borderRadius: 8,
  padding: "10px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
