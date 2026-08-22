"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // The invite link puts a token in the URL. supabase-js reads it
    // automatically on page load and creates a session from it — we just
    // need to wait a moment for that to happen, then check.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setChecking(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        checkSession();
      }
    });

    checkSession();
    return () => listener.subscription.unsubscribe();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/dashboard");
  };

  if (checking) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5C6B7A", fontSize: 14 }}>Loading…</div>;
  }

  if (!hasSession) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ maxWidth: 360, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#14213D" }}>Link expired or invalid</h1>
          <p style={{ fontSize: 14, color: "#5C6B7A" }}>
            This invite link isn't valid anymore. Ask your admin to send you a new invite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2B4C7E", textAlign: "center" }}>Taskline</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#14213D", textAlign: "center", margin: "2px 0 8px" }}>Set your password</h1>
        <p style={{ fontSize: 13, color: "#5C6B7A", textAlign: "center", margin: "0 0 18px" }}>
          Choose a password to finish setting up your account.
        </p>

        <form onSubmit={submit} style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: 18 }}>
          <Field label="New password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
          </Field>
          <Field label="Confirm password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} style={inputStyle} />
          </Field>

          {error && <div style={{ color: "#D64550", fontSize: 13, marginBottom: 10 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ width: "100%", background: "#14213D", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {submitting ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5C6B7A", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #E3E7EC",
  borderRadius: 7,
  padding: "9px 10px",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
