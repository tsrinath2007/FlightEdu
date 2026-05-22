import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 1. Delete user from Postgres database (Prisma handles manual deletion of related records if needed)
    try {
      // Cascade delete foreign key relations
      await prisma.userBadge.deleteMany({
        where: { userId: userId },
      });
      await prisma.leaderboardEntry.deleteMany({
        where: { userId: userId },
      });
      await prisma.transaction.deleteMany({
        where: { userId: userId },
      });
      await prisma.sessionParticipant.deleteMany({
        where: { userId: userId },
      });
      await prisma.session.deleteMany({
        where: { hostId: userId },
      });
      
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (dbErr) {
      console.warn("Database deletion warning (could be database sync/tenant restriction or already deleted):", dbErr);
    }

    // 2. Delete user from Supabase Auth using the admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Supabase auth delete error:", deleteError);
      return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 });
    }

    // 3. Clear session cookies on the client side by signing them out
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion failed:", err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
