import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !callerProfile?.is_admin) {
      return NextResponse.json({ error: "Only admins can create accounts." }, { status: 403 });
    }

    const allowed = await checkRateLimit(`admin-create:${userData.user.id}`, { max: 20, windowMinutes: 5 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many invites sent recently. Please wait a few minutes and try again." }, { status: 429 });
    }

    const { email, fullName, role, managerId } = await request.json();
    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Email, name, and role are required." }, { status: 400 });
    }
    if (!["staff", "manager", "director"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("NEXT_PUBLIC_SITE_URL is not set in environment variables.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, role },
      redirectTo: `${siteUrl}/set-password`,
    });

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);
      return NextResponse.json({ error: "Failed to send invitation. Please check the email address." }, { status: 400 });
    }

    if (managerId) {
      await supabaseAdmin.from("profiles").update({ manager_id: managerId }).eq("id", inviteData.user.id);
    }

    return NextResponse.json({ success: true, userId: inviteData.user.id });
  } catch (err) {
    console.error("Admin create-user error:", err);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}