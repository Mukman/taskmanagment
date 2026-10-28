import { createClient } from "@supabase/supabase-js";

// Trim whitespace/tabs/trailing slashes that sneak in when env values are
// pasted into Vercel — a stray character here breaks every request.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/(rest|auth)\/v1$/, "");
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Copy .env.local.example to .env.local and fill in your project values."
  );
}

if (typeof window !== "undefined") {
  // Visible in the browser console (F12) to confirm which project the app talks to.
  console.info("[Taskline] Supabase URL in use:", JSON.stringify(supabaseUrl));
}

// Placeholders keep `next build` from crashing if a variable is missing;
// the console warning above tells you what to fix, and requests will fail
// until the real values are set in Vercel and the site is redeployed.
export const supabase = createClient(
  supabaseUrl || "https://missing-env.supabase.co",
  supabaseAnonKey || "missing-env"
);
