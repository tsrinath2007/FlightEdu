import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const cookieStore = await cookies();
    
    // We declare the redirect response first so we can attach the cookies directly to it!
    const response = NextResponse.redirect(`${origin}/onboarding`);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

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
      
      const destination = next ?? (onboarded ? "/dashboard" : "/onboarding");
      
      // Update the redirect location in the response header while keeping the cookies attached!
      response.headers.set("Location", `${origin}${destination}`);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
