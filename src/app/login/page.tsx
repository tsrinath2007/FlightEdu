"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Logo from "@/components/brand/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setMagicSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Turbulence detected — " + error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[20%] size-[500px] rounded-full bg-electric-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] size-[400px] rounded-full bg-neon-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="mb-8 block">
          <Logo layout="vertical" size="lg" />
        </Link>

        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-8">
          {magicSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-4 text-5xl">✉️</div>
              <h2 className="font-display text-xl font-bold text-white">Check your inbox</h2>
              <p className="mt-2 text-sm text-white/50">
                We sent a magic link to <span className="text-white">{email}</span>
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="mt-6 text-sm text-electric-400 hover:underline"
              >
                Try a different email
              </button>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-sm text-white/50">Sign in to continue your journey</p>

              {/* Google */}
              <Button
                variant="ghost"
                size="lg"
                className="mt-6 w-full"
                loading={googleLoading}
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-xs text-white/30">or</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                  />
                </div>

                {mode === "password" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                    />
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-xs text-coral-400"
                  >
                    ⚡ {error}
                  </motion.p>
                )}

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  {mode === "magic" ? "Send magic link ✨" : "Sign in →"}
                </Button>
              </form>

              <button
                onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(""); }}
                className="mt-4 w-full text-center text-xs text-white/40 hover:text-white/70 transition"
              >
                {mode === "magic" ? "Use password instead" : "Use magic link instead"}
              </button>

              <p className="mt-6 text-center text-sm text-white/40">
                No account?{" "}
                <Link href="/register" className="text-electric-400 hover:underline">
                  Create one
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
