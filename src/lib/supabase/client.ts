"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (typeof window === "undefined") {
      console.warn("⚠️ Warning: Supabase client environment variables are not configured.");
    }
    return null as any;
  }
  return createBrowserClient(url, anonKey);
}
