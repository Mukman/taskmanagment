import { supabaseAdmin } from "./supabaseAdmin";

// SERVER-SIDE ONLY. Checks whether a given key (e.g. "admin:<userId>") has
// made too many attempts within the time window, using a Supabase table as
// the counter instead of an in-memory store (which wouldn't work reliably
// across separate serverless function invocations).
export async function checkRateLimit(key, { max = 30, windowMinutes = 5 } = {}) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if ((count || 0) >= max) {
    return false;
  }

  await supabaseAdmin.from("rate_limit_log").insert({ key });
  return true;
}
