import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatarUrl } = await request.json() as { avatarUrl: string };

    if (!avatarUrl) {
      return NextResponse.json({ error: "No avatarUrl provided" }, { status: 400 });
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      });
    } catch (dbErr) {
      console.warn("DB avatar update failed:", dbErr);
      // Non-fatal — preview still works client-side
    }

    return NextResponse.json({ success: true, avatarUrl });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
