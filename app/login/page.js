"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { T, card, input, btnPrimary } from "@/lib/theme";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timedOut = searchParams.get("timeout") === "1";

  const [mode, setMode] = useState("login"); // 'login' | 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/dashboard");
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/set-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setResetSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: T.bg, fontFamily: T.sans }}>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: T.mono }}>T</span>
          </div>
        </div>
        <h1 style={{ fontSize: T.font.xl, fontWeight: 700, color: T.ink, textAlign: "center", margin: "0 0 18px" }}>
          {mode === "login" ? "Sign in to Taskline" : "Reset your password"}
        </h1>

        {timedOut && mode === "login" && (
          <div style={{ background: T.accentSoft, color: T.accent, fontSize: T.font.sm, padding: "9px 12px", borderRadius: T.radius, marginBottom: 12, textAlign: "center" }}>
            You were signed out after a period of inactivity. Please log in again.
          </div>
        )}

        {mode === "login" ? (
          <>
            <form onSubmit={submit} style={{ ...card, padding: 16 }}>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={input} />
              </Field>
              <Field label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={input} />
              </Field>

              {error && <div style={{ color: T.danger, fontSize: T.font.sm, marginBottom: 10 }}>{error}</div>}

              <button type="submit" disabled={loading} style={{ ...btnPrimary, width: "100%" }}>
                {loading ? "Please wait…" : "Log in"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                onClick={() => {
                  setMode("reset");
                  setError("");
                  setResetSent(false);
                }}
                style={{ background: "none", border: "none", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Forgot password?
              </button>
            </div>

            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11.5, color: T.inkMuted }}>
              Don't have an account? Ask your admin to create one for you.
            </div>
          </>
        ) : (
          <>
            <form onSubmit={submitReset} style={{ ...card, padding: 16 }}>
              {resetSent ? (
                <div style={{ fontSize: T.font.sm, color: T.inkSoft, textAlign: "center", padding: "6px 0" }}>
                  If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your email.
                </div>
              ) : (
                <>
                  <Field label="Email">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={input} />
                  </Field>
                  {error && <div style={{ color: T.danger, fontSize: T.font.sm, marginBottom: 10 }}>{error}</div>}
                  <button type="submit" disabled={loading} style={{ ...btnPrimary, width: "100%" }}>
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </>
              )}
            </form>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setResetSent(false);
                }}
                style={{ background: "none", border: "none", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Back to log in
              </button>
            </div>
          </>
        )}
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
