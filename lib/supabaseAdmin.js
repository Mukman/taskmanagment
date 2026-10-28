import { createClient } from "@supabase/supabase-js";

// SERVER-SIDE ONLY. This client uses the service role key, which bypasses
// all row-level security. It must never be imported into a "use client"
// component or exposed to the browser — only used inside app/api/* routes.
//
// The client is created lazily (on first use) so a missing environment
// variable cannot break `next build`; it fails with a clear message on the
// request instead.
let client = null;

function getClient() {
  if (client) return client;
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/(rest|auth)\/v1$/, "");
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Server is missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them in Vercel → Settings → Environment Variables and redeploy."
    );
  }
  client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      return getClient()[prop];
    },
  }
);
