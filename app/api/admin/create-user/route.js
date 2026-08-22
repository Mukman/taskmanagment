import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // Verify the token belongs to a real logged-in user.
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    // Verify that user is actually an admin.
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !callerProfile?.is_admin) {
      return NextResponse.json({ error: "Only admins can create accounts." }, { status: 403 });
    }

    const { email, fullName, role, managerId } = await request.json();
    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Email, name, and role are required." }, { status: 400 });
    }
    if (!["staff", "manager", "director"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Invite the user by email. Supabase emails them a link that lands on
    // /set-password, where they choose their own password before entering
    // the app — the admin never sees or sets a password on their behalf.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role },
      redirectTo: `${siteUrl}/set-password`,
    });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    // If a manager was specified, set it now (the profile row was just
    // created by the handle_new_user trigger).
    if (managerId) {
      await supabaseAdmin.from("profiles").update({ manager_id: managerId }).eq("id", inviteData.user.id);
    }

    return NextResponse.json({ success: true, userId: inviteData.user.id });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
