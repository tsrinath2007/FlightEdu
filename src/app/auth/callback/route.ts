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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    // Collect cookies to set dynamically
    const sessionCookies: { name: string; value: string; options: any }[] = [];

    const supabase = createServerClient(
      url,
      anonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => {
              const idx = sessionCookies.findIndex((c) => c.name === cookie.name);
              if (idx !== -1) {
                sessionCookies[idx] = cookie;
              } else {
                sessionCookies.push(cookie);
              }
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const cookieNames = cookieStore.getAll().map(c => c.name).join(", ");
      const debugMsg = `${error.message} (Cookies received: [${cookieNames}])`;
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(debugMsg)}`);
    }

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
    
    const type = searchParams.get("type");
    let isRecoveryFlow = 
      cookieStore.get("gofocusgen_recovery_flow")?.value === "true" ||
      next?.startsWith("/reset-password") ||
      type === "recovery";

    // Attempt to inspect JWT AMR claim to check if session was initiated by password recovery
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const payloadBase64 = session.access_token.split(".")[1];
        if (payloadBase64) {
          const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
          const payloadJson = atob(base64);
          const payload = JSON.parse(payloadJson);
          const amr = payload.amr;
          if (Array.isArray(amr)) {
            const hasRecoveryAmr = amr.some((entry: any) => {
              if (typeof entry === "string") return entry === "recovery";
              if (entry && typeof entry === "object") return entry.method === "recovery";
              return false;
            });
            if (hasRecoveryAmr) {
              isRecoveryFlow = true;
            }
          }
        }
      }
    } catch (jwtError) {
      console.error("Direct JWT AMR recovery check failed:", jwtError);
    }

    let destination = next ?? (onboarded ? "/dashboard" : "/onboarding");
    if (isRecoveryFlow) {
      destination = "/reset-password";
    }

    const response = NextResponse.redirect(`${origin}${destination}`);
    
    // Write all collected cookies to the response object
    sessionCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    // Clear the recovery flow cookie if it was set
    response.cookies.set("gofocusgen_recovery_flow", "", { maxAge: 0, path: "/" });

    return response;
  }

  return NextResponse.redirect(`${origin}/login?error=code_missing`);
}
