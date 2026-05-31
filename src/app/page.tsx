"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/brand/Logo";
import { 
  Plane, Shield, Award, Users, Sparkles, Navigation, Globe, Compass, 
  Flame, Calendar, MessageSquare, Coffee, LogIn, Laptop, BookOpen, Clock
} from "lucide-react";

const FEATURES = [
  {
    icon: "✈️",
    title: "Journey-Based Study Flights",
    description: "Convert real-world flight paths into focused work sessions. Select your origin & destination airports; the duration of the flight is your dedicated focus time.",
  },
  {
    icon: "🪙",
    title: "Focus Cabin Economy",
    description: "Earn 200 focus coins per hour of study. Build long-term streaks to unlock exotic new regions. Warning: slacking off could lead to a negative coin balance!",
  },
  {
    icon: "🗺️",
    title: "World Map Navigation",
    description: "Every flight completed pins your interactive pilot map. Progress from small domestic flights to massive intercontinental voyages and claim your global territory.",
  },
  {
    icon: "🤝",
    title: "Chill & Hardcore Flight Modes",
    description: "Study solo in your private suite or join a multiplayer cabin with co-pilots. In Hardcore Mode, if any cadet leaves their seat, the entire crew is penalized!",
  },
  {
    icon: "🤖",
    title: "AI Co-Pilot Study Plans",
    description: "Receive fully custom study plans synthesized dynamically by our flight AI, tailored specifically to your chosen subject and cruise duration.",
  },
  {
    icon: "🏆",
    title: "Live Leaderboard Manifest",
    description: "Track your rank weekly against top focus pilots worldwide by focus hours, accumulated coins, and historical streak milestones.",
  },
];

const TRANSPORT_MODES = [
  { icon: "✈️", label: "Flight", example: "DXB → HYD  3h 45m" },
  { icon: "🚂", label: "Train", example: "NYC → BOS  3h 30m" },
  { icon: "🚗", label: "Car", example: "LA → SF  5h 45m" },
  { icon: "🚌", label: "Bus", example: "LDN → PAR  7h 20m" },
];

const COCKPIT_TIPS = [
  "Maintain your focus cabin pressure by completing daily study streaks.",
  "Streak Freeze protections safeguard your progress if you miss a day's flight.",
  "Accepted wingmen co-pilots can chat in real-time inside the active flight room.",
  "Route mastery badges like 'Red-Eye Warrior' are awarded for night focus sessions."
];

export default function LandingPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);

  // Cycle cockpit tips every 6 seconds for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % COCKPIT_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function checkExistingSession() {
      // Fail-safe: If Supabase falls back to Site URL and appends ?code=..., forward it to /auth/callback immediately!
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          router.push(`/auth/callback?code=${code}`);
          return;
        }
      }

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
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
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
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 px-4 py-8 md:p-8 noise animate-fade-in text-white selection:bg-electric-500">
      {/* Background ambient cosmic glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] size-[600px] rounded-full bg-electric-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] size-[400px] rounded-full bg-pink-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] size-[500px] rounded-full bg-electric-600/8 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between py-4 border-b border-white/5 mb-6">
        <div className="flex items-center gap-2">
          <Logo layout="horizontal" size="md" />
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleGoogleLogin}
            loading={loading}
            className="border border-white/10 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white rounded-xl backdrop-blur-sm cursor-pointer"
          >
            Launch Cabin
          </Button>
        </div>
      </nav>

      {/* Hero Entrance Portal */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 text-center md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-[10px] font-semibold text-electric-400 uppercase tracking-widest"
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
          className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60"
        >
          Pick an origin, pick a destination. The real travel time becomes your study session. Board your flight, configure your focus cabin, land, earn focus coins, and unlock the world.
        </motion.p>

        {/* Dynamic Tips Ticker */}
        <div className="h-6 mt-4 flex items-center justify-center overflow-hidden">
          <p className="text-xs font-mono text-electric-400/80 tracking-wide transition-all duration-500">
            ✈️ PILOT ADVISORY: {COCKPIT_TIPS[currentTip]}
          </p>
        </div>

        {/* Dual Grid: OAuth Card & Cockpit Mockup Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-12 max-w-5xl mx-auto">
          
          {/* Left Column: Sign-in Card Gate */}
          <div className="lg:col-span-5 w-full mx-auto max-w-sm">
            <Card className="glass relative overflow-hidden p-6 border border-white/10 shadow-2xl rounded-3xl">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-electric-400 via-neon-500 to-amber-500" />
              
              <div className="mb-6 flex flex-col items-center">
                <span className="rounded-full bg-white/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-electric-400">
                  Pilot Boarding Gate
                </span>
                <h3 className="mt-2 font-display text-sm font-extrabold text-white text-center">
                  Authorize Flight Credentials
                </h3>
              </div>

              <Button
                variant="ghost"
                size="lg"
                loading={loading}
                onClick={handleGoogleLogin}
                className="relative w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 py-6 text-xs rounded-2xl cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none">
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

              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">or</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push("/onboarding?simulated=true")}
                className="w-full bg-gradient-to-r from-electric-500/10 to-neon-500/10 hover:from-electric-500/20 hover:to-neon-500/20 border border-electric-500/30 hover:border-electric-500/50 text-electric-300 font-semibold transition-all duration-300 py-4 text-[10px] uppercase tracking-wider rounded-2xl cursor-pointer"
              >
                ⚡ Simulation Takeoff (Bypass OAuth)
              </Button>

              <div className="mt-4 flex items-center justify-between text-[8px] text-white/35 font-mono uppercase">
                <span className="flex items-center gap-1">
                  🔒 Encrypted Gateway Link
                </span>
                <span className="flex items-center gap-1">
                  ✈️ Onboard checklist
                </span>
              </div>
            </Card>
          </div>

          {/* Right Column: Immersive Interactive Dashboard Preview Mockup */}
          <div className="lg:col-span-7 w-full">
            <Card className="glass border border-white/10 rounded-[32px] p-5 relative overflow-hidden backdrop-blur-xl text-left shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-electric-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Mockup Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">Flight Cockpit System HUD</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-white/10" />
                  <span className="size-2 rounded-full bg-white/10" />
                  <span className="size-2 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Mockup Body Content */}
              <div className="space-y-4">
                {/* Active Flight Coordinates Banner */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                  <div>
                    <p className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Origin</p>
                    <p className="font-mono text-sm font-bold text-white">DXB (Dubai)</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-electric-400 font-semibold uppercase tracking-wider">3h 45m Study Cruise</span>
                    <div className="w-24 h-[1px] bg-white/20 relative mt-1">
                      <Plane className="size-3 text-electric-400 rotate-90 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Destination</p>
                    <p className="font-mono text-sm font-bold text-white">SIN (Singapore)</p>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs font-black text-electric-400">🔥 12 Days</span>
                    <span className="text-[7px] font-mono text-white/40 uppercase mt-0.5">Study Streak</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs font-black text-amber-400">🪙 4,850</span>
                    <span className="text-[7px] font-mono text-white/40 uppercase mt-0.5">Focus Coins</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs font-black text-purple-400">✈️ Captain</span>
                    <span className="text-[7px] font-mono text-white/40 uppercase mt-0.5">Pilot Rank</span>
                  </div>
                </div>

                {/* Active study telemetry progress */}
                <div className="p-3 bg-white/[0.02] border border-blue-500/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[8px] font-mono text-blue-400 uppercase tracking-wider">
                    <span>⚡ ACTIVE FLIGHT CHECKLIST</span>
                    <span>Elapsed: 01h 45m</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[46%] bg-gradient-to-r from-electric-500 to-blue-600 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold">📚 Subject: Advanced UI Engineering</span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-emerald-400 font-mono text-[8px] font-bold">FOCUS ACTIVE</span>
                  </div>
                </div>

              </div>
            </Card>
          </div>

        </div>

        {/* Transport modes info bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {TRANSPORT_MODES.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-xs text-white/70 backdrop-blur-sm"
            >
              <span className="text-sm">{t.icon}</span>
              <span className="font-semibold text-white">{t.label}</span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-white/50">{t.example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Immersive Content Sections (Greatly enriched content!) */}
      
      {/* SECTION 1: Deep Study Mechanics */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="rounded-full bg-electric-500/10 px-3.5 py-1 text-[10px] font-bold text-electric-400 border border-electric-500/20 uppercase tracking-wider">
              🛠️ Aviation Gamification
            </span>
            <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight">
              A Study Companion Engineered <br />
              <span className="text-gradient-electric">To Block Distractions</span>
            </h2>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Unlike generic focus timers, GoFocusGen harnesses immersive aviation gamification to make deep study addicting. Translating coordinates into active flight schedules gives your focus session a spatial sense of progress, complete with actual airline multipliers and cabin shields.
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-electric-500/10 flex items-center justify-center text-xs border border-electric-500/20 flex-shrink-0">✓</div>
                <p className="text-xs text-white/80"><strong>Noise-Safeguard Ambience</strong>: Select your fleet and turn on ambient jet engine sweeps to filter external auditory clutter completely.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-electric-500/10 flex items-center justify-center text-xs border border-electric-500/20 flex-shrink-0">✓</div>
                <p className="text-xs text-white/80"><strong>Holographic Focus Shield</strong>: Upgraded cabins feature advanced shields (up to 100% protection) that keep your study parameters isolated.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
              <span className="text-2xl">🕌</span>
              <h4 className="font-bold text-sm text-white mt-3">Route Achievements</h4>
              <p className="text-[11px] text-white/40 mt-1">Earn colorful vintage passport stamps for completing regional focus voyages.</p>
            </div>
            <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
              <span className="text-2xl">🔥</span>
              <h4 className="font-bold text-sm text-white mt-3">Daily Streaks</h4>
              <p className="text-[11px] text-white/40 mt-1">Keep study habits warm with Duolingo-style fire ticks and ice freezes.</p>
            </div>
            <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
              <span className="text-2xl">💬</span>
              <h4 className="font-bold text-sm text-white mt-3">Wingman Chats</h4>
              <p className="text-[11px] text-white/40 mt-1">Connect with flight crews and chat side-by-side inside study flights.</p>
            </div>
            <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
              <span className="text-2xl">🎖️</span>
              <h4 className="font-bold text-sm text-white mt-3">Pilot Ranks</h4>
              <p className="text-[11px] text-white/40 mt-1">Climb from simple Cadet status to Commander by completing flight hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Multiplayer Social Crew Cabin Benefits */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 order-last md:order-first">
            <Card className="glass border border-white/10 rounded-[32px] p-5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
                <span className="text-xl">👥</span>
                <div>
                  <h4 className="font-display font-extrabold text-xs text-white leading-tight">In-Flight Co-Pilots Lounge</h4>
                  <p className="text-[8px] text-white/45 font-mono">ACTIVE CABIN FLIGHT: AI-380</p>
                </div>
              </div>

              {/* Chat feed simulation */}
              <div className="space-y-3 h-48 overflow-y-auto pr-1">
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] leading-relaxed">
                    <p className="font-bold text-electric-400 text-[8px] mb-0.5">@co_pilot_sophia</p>
                    <p>Just reached Flight Level 380! Aerodynamics notes are looking solid ✈️</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl bg-gradient-to-r from-electric-500 to-indigo-600 px-3 py-1.5 text-[10px] leading-relaxed text-white">
                    <p>Nice! I&apos;m grinding macroeconomics notes right beside you. 👏</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] leading-relaxed">
                    <p className="font-bold text-electric-400 text-[8px] mb-0.5">@cadet_liam</p>
                    <p>Study shield active at 100%. Let&apos;s land this 4-hour flight! 🚀</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-7">
            <span className="rounded-full bg-indigo-500/10 px-3.5 py-1 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              👥 Social Cabin Connection
            </span>
            <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight">
              Study Together, Earn Together, <br />
              <span className="text-gradient-gold">Keep Each Other Accountable</span>
            </h2>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Why fly solo when you can invite co-pilots? Search other study pilots, add them to your flight crew, and manage nicknames. Board flights together to unlock multiplier perks and maintain joint focus.
            </p>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <span className="text-electric-400 text-lg">💬</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Cockpit Chat</h4>
                  <p className="text-[10.5px] text-white/45 mt-0.5">Exhange direct telemetry coordinate logs in real-time with accepted crew members.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-electric-400 text-lg">✈️</span>
                <div>
                  <h4 className="text-xs font-bold text-white">In-Plane Friend Requests</h4>
                  <p className="text-[10.5px] text-white/45 mt-0.5">See someone sitting in the same plane? Send instant requests they can accept inside the plane.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 border-t border-white/5">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white md:text-3xl">
          Everything you need to <span className="text-gradient-gold">stay on track</span>
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6 border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 rounded-3xl">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-display text-base font-bold text-white">
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
      <footer className="relative z-10 border-t border-white/5 py-8 text-center font-display">
        <p className="text-xs text-white/35">
          GoFocusGen — Study Like You&apos;re Travelling the World
        </p>
        
        {/* Instagram / Social Media Footer Links */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-white/30">
          <a
            href="https://www.instagram.com/voyage_iq/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-400 transition-colors font-medium"
          >
            Instagram 📸
          </a>
          <span>•</span>
          <a
            href="https://www.linkedin.com/in/tses/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-electric-400 transition-colors font-medium"
          >
            LinkedIn 👥
          </a>
        </div>

        <p className="mt-4 text-[10px] text-white/20">
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/tses/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-electric-400 hover:text-electric-300 underline underline-offset-2 transition-colors"
          >
            Srinath
          </a>
        </p>
      </footer>
    </main>
  );
}
