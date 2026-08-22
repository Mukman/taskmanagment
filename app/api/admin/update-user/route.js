import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
