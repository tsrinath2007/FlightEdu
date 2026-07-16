import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn("⚠️ Warning: Supabase server environment variables are not configured.");
    return null as any;
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}

export async function getUser(request: Request) {
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  console.log("🔍 getUser called. Auth header present:", !!authHeader);
  console.log("🔍 Auth header value (first 20 chars):", authHeader?.substring(0, 20));

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("🔍 Token extracted, length:", token.length);
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      console.log("🔍 Supabase getUser(token) result - user:", !!data?.user, "error:", error?.message);
      return data?.user || null;
    }
  } else {
    console.log("🔍 No Bearer header found, falling back to cookies");
    const supabase = await createClient();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      console.log("🔍 Cookie-based getUser result - user:", !!data?.user, "error:", error?.message);
      return data?.user || null;
    }
  }
  return null;
}
