import { createClient } from "@supabase/supabase-js";

// SERVER-SIDE ONLY. This client uses the service role key, which bypasses
// all row-level security. It must never be imported into a "use client"
// component or exposed to the browser — only used inside app/api/* routes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Missing Supabase admin environment variables. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only, no NEXT_PUBLIC prefix)."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
