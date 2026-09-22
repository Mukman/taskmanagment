import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

async function requireAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) return { error: NextResponse.json({ error: "Invalid session." }, { status: 401 }) };

  const { data: callerProfile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !callerProfile?.is_admin) {
    return { error: NextResponse.json({ error: "Only admins can do this." }, { status: 403 }) };
  }
  return { callerId: userData.user.id };
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const allowed = await checkRateLimit(`admin-update:${auth.callerId}`, { max: 40, windowMinutes: 5 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many changes made recently. Please wait a few minutes and try again." }, { status: 429 });
    }

    const { userId, fullName, role, managerId, isAdmin } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    if (role && !["staff", "manager", "director"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // A staff member's manager_id must point to a manager or director (or be null).
    const update = {};
    if (fullName !== undefined) update.full_name = fullName;
    if (role !== undefined) update.role = role;
    if (managerId !== undefined) update.manager_id = managerId || null;
    if (isAdmin !== undefined) update.is_admin = isAdmin;

    // Safety net: don't let the last admin remove their own admin access —
    // that would lock everyone out of account management with no way back
    // in short of editing the database directly.
    if (userId === auth.callerId && isAdmin === false) {
      const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", true);
      if ((count || 0) <= 1) {
        return NextResponse.json({ error: "You're the only admin — promote someone else first before removing your own access." }, { status: 400 });
      }
    }

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
