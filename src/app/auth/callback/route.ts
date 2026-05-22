import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync user to our database directly (prevents HTTP fetch deadlocks & cookie passing failures!)
      const { data: { user } } = await supabase.auth.getUser();
      let onboarded = false;
      if (user && user.email) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: {
              name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? undefined,
              avatarUrl: user.user_metadata?.avatar_url ?? undefined,
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
              avatarUrl: user.user_metadata?.avatar_url ?? null,
              coins: 0,
            },
          });
          onboarded = dbUser?.onboarded ?? false;
        } catch (dbError) {
          console.error("Direct database sync error in auth callback:", dbError);
        }
      }
      
      const destination = searchParams.get("next") ?? (onboarded ? "/dashboard" : "/onboarding");
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
