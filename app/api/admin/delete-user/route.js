import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !callerProfile?.is_admin) {
      return NextResponse.json({ error: "Only admins can do this." }, { status: 403 });
    }

    const allowed = await checkRateLimit(`admin-archive:${userData.user.id}`, { max: 15, windowMinutes: 5 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many actions recently. Please wait a few minutes and try again." }, { status: 429 });
    }

    const { userId, action } = await request.json(); // 'action' can be 'archive' or 'unarchive'
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    if (userId === userData.user.id) {
      return NextResponse.json({ error: "You can't archive your own account." }, { status: 400 });
    }

    const isActive = action === "unarchive";
    
    // Soft delete: just toggle the is_active flag. 
    // This preserves all their tasks for historical reporting.
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) {
      console.error("Supabase archive error:", error);
      return NextResponse.json({ error: "Failed to update user status." }, { status: 400 });
    }

    return NextResponse.json({ success: true, is_active: isActive });
  } catch (err) {
    console.error("Admin archive-user error:", err);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}