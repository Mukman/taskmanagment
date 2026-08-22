"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2B4C7E", textAlign: "center" }}>Taskline</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#14213D", textAlign: "center", margin: "2px 0 20px" }}>Welcome back</h1>

        <form onSubmit={submit} style={{ background: "#FFFFFF", border: "1px solid #E3E7EC", borderRadius: 12, padding: 18 }}>
          <Field label="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </Field>
          <Field label="Password">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </Field>

          {error && <div style={{ color: "#D64550", fontSize: 13, marginBottom: 10 }}>{error}</div>}

          <button type="submit" disabled={loading} style={{ width: "100%", background: "#14213D", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Please wait…" : "Log in"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#9AA5B1" }}>
          Don't have an account? Ask your admin to create one for you.
        </div>
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
