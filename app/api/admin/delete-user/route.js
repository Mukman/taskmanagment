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

    const allowed = await checkRateLimit(`admin-delete:${userData.user.id}`, { max: 15, windowMinutes: 5 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many deletions recently. Please wait a few minutes and try again." }, { status: 429 });
    }

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    if (userId === userData.user.id) {
      return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
    }

    // Deleting the auth user cascades to their profile row and, from there,
    // to their tasks (both have "on delete cascade" foreign keys).
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
