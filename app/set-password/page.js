"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, btnPrimary } from "@/lib/theme";

export default function SetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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
    const { data: userData, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }
    const email = userData?.user?.email;
    if (email) {
      await supabase.auth.signInWithPassword({ email, password });
    }
    setSubmitting(false);
    router.replace("/dashboard");
  };

  if (checking) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.inkMuted, fontSize: T.font.base, fontFamily: T.sans }}>Loading…</div>;
  }

  if (!hasSession) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: T.bg, fontFamily: T.sans }}>
        <div style={{ maxWidth: 320, textAlign: "center" }}>
          <h1 style={{ fontSize: T.font.lg, fontWeight: 700, color: T.ink }}>Link expired or invalid</h1>
          <p style={{ fontSize: T.font.base, color: T.inkSoft }}>
            This invite link isn't valid anymore. Ask your admin to send you a new invite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: T.bg, fontFamily: T.sans }}>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: T.mono }}>T</span>
          </div>
        </div>
        <h1 style={{ fontSize: T.font.xl, fontWeight: 700, color: T.ink, textAlign: "center", margin: "0 0 6px" }}>Set your password</h1>
        <p style={{ fontSize: T.font.sm, color: T.inkSoft, textAlign: "center", margin: "0 0 16px" }}>
          Choose a password to finish setting up your account.
        </p>

        <form onSubmit={submit} style={{ ...card, padding: 16 }}>
          <Field label="New password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={input} />
          </Field>
          <Field label="Confirm password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} style={input} />
          </Field>

          {error && <div style={{ color: T.danger, fontSize: T.font.sm, marginBottom: 10 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: "100%" }}>
            {submitting ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: T.inkSoft, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
