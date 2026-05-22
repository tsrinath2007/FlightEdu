import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Verify the caller is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };

  try {
    const dbUser = await prisma.user.upsert({
      where: { id: body.id },
      update: {
        name: body.name ?? undefined,
        avatarUrl: body.avatarUrl ?? undefined,
      },
      create: {
        id: body.id,
        email: body.email,
        name: body.name,
        avatarUrl: body.avatarUrl,
        coins: 0,
      },
    });

    return NextResponse.json({ user: dbUser });
  } catch (err) {
    console.error("User sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
