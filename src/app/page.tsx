"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: "✈️",
    title: "Journey-Based Sessions",
    description: "Pick origin & destination. Real travel time = your study duration.",
  },
  {
    icon: "🪙",
    title: "Coin Economy",
    description: "Earn 200 coins/hr. Build streaks. Unlock world maps. Coins can go negative.",
  },
  {
    icon: "🗺️",
    title: "World Map Unlocks",
    description: "Every destination pins your map. Cities → Countries → Continents.",
  },
  {
    icon: "🤝",
    title: "Chill & Hardcore Modes",
    description: "Study solo or with friends. Hardcore mode: if one leaves, all lose coins.",
  },
  {
    icon: "🤖",
    title: "AI Study Plans",
    description: "AI generates a structured plan based on your subject and journey length.",
  },
  {
    icon: "🏆",
    title: "Live Leaderboard",
    description: "Weekly rankings by hours, coins, and streaks. Last Survivor challenges.",
  },
];

const TRANSPORT_MODES = [
  { icon: "✈️", label: "Flight", example: "DXB → HYD  3h 45m" },
  { icon: "🚂", label: "Train", example: "NYC → BOS  3h 30m" },
  { icon: "🚗", label: "Car", example: "LA → SF  5h 45m" },
  { icon: "🚌", label: "Bus", example: "LDN → PAR  7h 20m" },
];

export default function LandingPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    async function checkExistingSession() {
      const supabase = createClient();
      if (!supabase) {
        setCheckLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User has active session, check their onboarding completion
        try {
          const res = await fetch("/api/user/onboard");
          const status = await res.json() as { onboarded: boolean };
          if (status.onboarded) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch {
          router.push("/onboarding");
        }
      } else {
        setCheckLoading(false);
      }
    }
    checkExistingSession();
  }, [router]);

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      alert("Takeoff failed: Supabase client is not configured.");
      return;
    }
    
    // Trigger real Supabase OAuth redirect to Google
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      console.error("Google login failed:", error.message);
      setLoading(false);
      alert("Takeoff failed: " + error.message);
    }
  }

  if (checkLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white gap-4">
        <span className="size-8 rounded-full border-4 border-electric-500 border-t-transparent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-white/40">Securing Flight Gate...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950 px-4 py-8 md:p-8 noise animate-fade-in">
      {/* Background ambient cosmic glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] size-[600px] rounded-full bg-electric-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] size-[400px] rounded-full bg-neon-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] size-[500px] rounded-full bg-electric-600/8 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            FlightEdu
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleGoogleLogin}
            loading={loading}
            className="border border-white/10 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white"
          >
            Launch Cabin
          </Button>
        </div>
      </nav>

      {/* Hero Entrance Portal */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-16 text-center md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold text-electric-400 uppercase tracking-widest"
        >
          <span className="size-1.5 rounded-full bg-electric-400 animate-pulse" />
          Real Routes • Real Time • Real Focus
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-7xl"
        >
          Study like you&apos;re <span className="text-gradient-electric">travelling</span>
          <br />
          the world
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60"
        >
          Pick an origin, pick a destination. The real travel time becomes your study session. Board your flight, focus, land, earn coins, and unlock the world.
        </motion.p>

        {/* Real Google Sign-in Card Gate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-12 max-w-md"
        >
          <Card className="glass relative overflow-hidden p-8 border border-white/10 shadow-2xl">
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-electric-400 via-neon-500 to-amber-500" />
            
            <div className="mb-6 flex flex-col items-center">
              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-electric-400">
                Step 1: Pilot Boarding Gate
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-white">
                Authorize Google flight credentials
              </h3>
            </div>

            <Button
              variant="ghost"
              size="lg"
              loading={loading}
              onClick={handleGoogleLogin}
              className="relative w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 py-6 text-sm"
            >
              <svg className="mr-3 size-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[10px] text-white/30 uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/onboarding?simulated=true")}
              className="w-full bg-gradient-to-r from-electric-500/10 to-neon-500/10 hover:from-electric-500/20 hover:to-neon-500/20 border border-electric-500/30 hover:border-electric-500/50 text-electric-300 font-semibold transition-all duration-300 py-5 text-xs uppercase tracking-wider"
            >
              ⚡ Simulation Takeoff (Bypass OAuth)
            </Button>

            <div className="mt-6 flex items-center justify-between text-[10px] text-white/30">
              <span className="flex items-center gap-1.5">
                🔒 Secure Supabase Link
              </span>
              <span className="flex items-center gap-1.5">
                ⚡ Then configure details
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Transport modes */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {TRANSPORT_MODES.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-xs text-white/70"
            >
              <span className="text-sm">{t.icon}</span>
              <span className="font-semibold text-white">{t.label}</span>
              <span className="text-white/20">·</span>
              <span>{t.example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white md:text-3xl">
          Everything you need to <span className="text-gradient-gold">stay on track</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-display text-base font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed text-white/40">
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-white/20 font-display">
        FlightEdu — Study Like You&apos;re Travelling the World • Powered by Google OAuth & Supabase
      </footer>
    </main>
  );
}
