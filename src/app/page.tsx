"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/brand/Logo";
import { 
  Plane, Shield, Award, Users, Sparkles, Navigation, Globe, Compass, 
  Flame, Calendar, MessageSquare, Coffee, LogIn, Laptop, BookOpen, Clock, ChevronDown, CheckCircle
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

const FAQ_ITEMS = [
  {
    question: "How does the study flight timing work?",
    answer: "GoFocusGen maps real-world routes to your focus blocks. For example, if you want a 3.5 hour focus session, you select a flight like London (LHR) to Athens (ATH). The actual scheduled airline travel duration defines your cruise time. You must stay focused in your tab until you land!",
  },
  {
    question: "What is the Focus Coin economy?",
    answer: "Every successful study hour earns you 200 Focus Coins. These coins let you purchase Streak Freezes to protect your streak when you're busy, or charter private multiplayer cabins. Be careful: leaving your seat (closing or abandoning the active session) in Hardcore Mode penalizes you and can cause your coin treasury to go negative!",
  },
  {
    question: "How personalized are the AI co-pilot study plans?",
    answer: "Extremely personalized! When you start a flight, you input your study topic (e.g. 'Intro to Rust' or 'Biochemistry Exam Prep'). Our AI Co-Pilot analyzes the topic and divides it into precise milestones mapped to your takeoff, cruise, and descent phases, providing a step-by-step custom syllabus for that specific flight's duration.",
  },
  {
    question: "What is the difference between Chill and Hardcore modes?",
    answer: "In Chill Mode, you study at your own pace and can pause the flight if needed. In Hardcore Mode, you enter a strict accountability contract. In multiplayer hardcore flights, if any cadet leaves their seat or navigates away, the entire flight crew suffers a coin penalty. It's high-stakes shared accountability!",
  },
  {
    question: "Is there support for other transport modes?",
    answer: "Yes! While airplanes are the default, you can select Trains, Cars, or Buses to match shorter or longer study slots (e.g., a short 45-minute bus commute vs. a 12-hour road trip).",
  },
];

const PRESET_DEMO_ROUTES = [
  {
    origin: "LHR (London)",
    destination: "CDG (Paris)",
    duration: "1h 15m",
    haul: "Short Haul",
    subject: "JavaScript Array Methods",
    coins: 250,
    syllabus: [
      { phase: "Takeoff (15m)", task: "Review map(), filter(), and reduce() syntax and returns." },
      { phase: "Cruise (45m)", task: "Build a mini database-filtering script using array chaining." },
      { phase: "Descent (15m)", task: "Test performance limits of map vs standard for loops." }
    ]
  },
  {
    origin: "DXB (Dubai)",
    destination: "LHR (London)",
    duration: "7h 00m",
    haul: "Medium Haul",
    subject: "Deep Learning Foundations",
    coins: 1400,
    syllabus: [
      { phase: "Takeoff (1h 00m)", task: "Study backpropagation calculus & computational graphs." },
      { phase: "Cruise (5h 00m)", task: "Implement a multi-layer perceptron from scratch in NumPy." },
      { phase: "Descent (1h 00m)", task: "Tune learning rates and analyze loss curves." }
    ]
  },
  {
    origin: "JFK (New York)",
    destination: "NRT (Tokyo)",
    duration: "14h 30m",
    haul: "Long Haul",
    subject: "Distributed Systems Architecture",
    coins: 2900,
    syllabus: [
      { phase: "Takeoff (2h 00m)", task: "Review Raft and Paxos consensus algorithms." },
      { phase: "Cruise (10h 30m)", task: "Design a sharded key-value store with masterless replication." },
      { phase: "Descent (2h 00m)", task: "Analyze network partition split-brain recovery procedures." }
    ]
  }
];

const TESTIMONIALS = [
  {
    quote: "Booking a study flight from London to Singapore physically shifts my brain into deep focus. The gamification is brilliant — I actually care about earning coins to unlock the next continent!",
    author: "Captain Sarah K.",
    role: "Medical Resident",
    avatar: "👩‍⚕️"
  },
  {
    quote: "Hardcore multiplayer mode is wild. Study groups are usually easy to slack off in, but when the entire crew is penalized if you leave the tab, you stay in your seat. Zero distractions.",
    author: "First Officer Daniel M.",
    role: "Senior Engineer",
    avatar: "👨‍💻"
  },
  {
    quote: "The AI Co-pilot sliced my calculus exam prep into takeoff, cruise, and landing milestones. Having custom resource checkpoints matched to my study blocks was a game-changer.",
    author: "Cadet Elena R.",
    role: "High School Student",
    avatar: "👩‍🎓"
  }
];

export default function LandingPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [activeDemoRoute, setActiveDemoRoute] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const code = searchParams.get("code") || hashParams.get("code");
        if (code) {
          setIsRedirecting(true);
          router.push(`/auth/callback?code=${code}`);
          return;
        }

        const error = searchParams.get("error") || hashParams.get("error");
        const errorDesc = 
          searchParams.get("error_description") || 
          hashParams.get("error_description") || 
          searchParams.get("error_code") || 
          hashParams.get("error_code");
          
        if (error || errorDesc) {
          setIsRedirecting(true);
          router.push(`/login?error=${encodeURIComponent(errorDesc || error || "auth_failed")}`);
          return;
        }
      }

      const supabase = createClient();
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsRedirecting(true); // Show redirecting spinner in the background
        try {
          const res = await fetch("/api/user/onboard");
          if (!res.ok) {
            setIsRedirecting(false);
            return;
          }
          const status = await res.json() as { onboarded: boolean };
          if (status.onboarded) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch (err) {
          console.warn("Failed to check onboarding status:", err);
          setIsRedirecting(false);
        }
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

  const demoRoute = PRESET_DEMO_ROUTES[activeDemoRoute];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 px-4 py-8 md:p-8 noise animate-fade-in text-white selection:bg-electric-500">
      {/* Background ambient cosmic glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] size-[600px] rounded-full bg-electric-500/10 blur-[120px]" />
        <div className="absolute top-[30%] right-[5%] size-[400px] rounded-full bg-pink-500/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] size-[500px] rounded-full bg-electric-600/8 blur-[100px]" />
      </div>

      {/* Redirecting Overlay Block */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950/80 backdrop-blur-md text-white gap-4">
          <span className="size-8 rounded-full border-4 border-electric-500 border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest text-white/40 font-mono">Securing Flight Gate...</p>
        </div>
      )}

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

        {/* Dual Grid: OAuth Card & Interactive Route Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-12 max-w-5xl mx-auto">
          
          {/* Left Column: Sign-in Card Gate */}
          <div className="lg:col-span-5 w-full mx-auto max-w-sm flex flex-col">
            <Card className="glass relative overflow-hidden p-6 border border-white/10 shadow-2xl rounded-3xl flex-1 flex flex-col justify-between">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-electric-400 via-neon-500 to-amber-500" />
              
              <div className="mb-6 flex flex-col items-center">
                <span className="rounded-full bg-white/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-electric-400">
                  Pilot Boarding Gate
                </span>
                <h3 className="mt-2 font-display text-sm font-extrabold text-white text-center">
                  Authorize Flight Credentials
                </h3>
              </div>

              <div className="space-y-4">
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

                <div className="flex items-center gap-3">
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
              </div>

              <div className="mt-6 flex items-center justify-between text-[8px] text-white/35 font-mono uppercase border-t border-white/5 pt-4">
                <span className="flex items-center gap-1">
                  🔒 Encrypted Gateway Link
                </span>
                <span className="flex items-center gap-1">
                  ✈️ Onboard checklist
                </span>
              </div>
            </Card>
          </div>

          {/* Right Column: Interactive Flight Simulator Widget */}
          <div className="lg:col-span-7 w-full flex flex-col">
            <Card className="glass border border-white/10 rounded-[32px] p-5 relative overflow-hidden backdrop-blur-xl text-left shadow-2xl flex-1 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-electric-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Simulator Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-electric-500 animate-pulse" />
                  <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">Interactive Flight HUD & Plan Simulator</span>
                </div>
                <div className="flex gap-1">
                  {PRESET_DEMO_ROUTES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDemoRoute(idx)}
                      className={`text-[8px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        activeDemoRoute === idx
                          ? "bg-electric-500 border-electric-400 text-white font-bold"
                          : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                      }`}
                    >
                      Preset {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Route Specs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                  <div>
                    <p className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Origin</p>
                    <p className="font-mono text-xs font-bold text-white">{demoRoute.origin}</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-electric-400 font-semibold uppercase tracking-wider">{demoRoute.duration} • {demoRoute.haul}</span>
                    <div className="w-24 h-[1px] bg-white/20 relative mt-1">
                      <Plane className="size-3 text-electric-400 rotate-90 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] font-mono text-white/40 uppercase tracking-widest">Destination</p>
                    <p className="font-mono text-xs font-bold text-white">{demoRoute.destination}</p>
                  </div>
                </div>

                {/* Estimated Rewards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs font-black text-amber-400">🪙 {demoRoute.coins} Coins</span>
                    <span className="text-[7px] font-mono text-white/40 uppercase mt-0.5">Est. Landing Treasury</span>
                  </div>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs font-black text-electric-400">🤖 AI Co-Pilot</span>
                    <span className="text-[7px] font-mono text-white/40 uppercase mt-0.5">Syllabus Synthesized</span>
                  </div>
                </div>

                {/* Mock AI Study Plan Output */}
                <div className="p-3.5 bg-white/[0.02] border border-blue-500/10 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-[8px] font-mono text-electric-400 uppercase tracking-wider">
                    <span>⚡ AI FLIGHT SYLLABUS: {demoRoute.subject}</span>
                    <span className="text-white/40">UNDER PROCESS</span>
                  </div>
                  <div className="space-y-2">
                    {demoRoute.syllabus.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-left">
                        <CheckCircle className="size-3.5 text-electric-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-white leading-tight">{s.phase}</p>
                          <p className="text-[9.5px] text-white/50 mt-0.5 leading-normal">{s.task}</p>
                        </div>
                      </div>
                    ))}
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

      {/* SECTION: How it Works visual workflow */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 border-t border-white/5 text-center">
        <span className="rounded-full bg-electric-500/10 px-3.5 py-1 text-[10px] font-bold text-electric-400 border border-electric-500/20 uppercase tracking-wider">
          🗺️ Flight Plan Manual
        </span>
        <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight md:text-4xl">
          Chart Your Course In <span className="text-gradient-electric">Four Easy Steps</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xs text-white/60 leading-relaxed">
          GoFocusGen shifts focus routines into gamified geographic expeditions. Here is how your flight schedule transforms into deep study milestones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 text-left">
          <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
            <span className="text-2xl">1️⃣</span>
            <h4 className="font-bold text-sm text-white mt-3">Select Route</h4>
            <p className="text-[11px] text-white/40 mt-1">Pick your takeoff and landing airports. The real travel duration becomes your focus block.</p>
          </div>
          <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
            <span className="text-2xl">2️⃣</span>
            <h4 className="font-bold text-sm text-white mt-3">AI Flight Syllabus</h4>
            <p className="text-[11px] text-white/40 mt-1">Input your study goal. Our AI divides it into takeoff, cruise, and descent checkpoints.</p>
          </div>
          <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
            <span className="text-2xl">3️⃣</span>
            <h4 className="font-bold text-sm text-white mt-3">Lock the Cockpit</h4>
            <p className="text-[11px] text-white/40 mt-1">Turn on jet sound sweeps, enter private suites, or join a multiplayer group. Stay in your tab to protect cabin pressure.</p>
          </div>
          <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition duration-300">
            <span className="text-2xl">4️⃣</span>
            <h4 className="font-bold text-sm text-white mt-3">Collect Rewards</h4>
            <p className="text-[11px] text-white/40 mt-1">Land successfully to earn focus coins, claim vintage passport stamps, and climb pilot ranks.</p>
          </div>
        </div>
      </section>

      {/* SECTION: Deep Study Mechanics & Mockup Grid */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="rounded-full bg-electric-500/10 px-3.5 py-1 text-[10px] font-bold text-electric-400 border border-electric-500/20 uppercase tracking-wider">
              🛠️ Cockpit Telemetry Mockups
            </span>
            <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight">
              A Study Dashboard Designed <br />
              <span className="text-gradient-electric">for Active Habit Building</span>
            </h2>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Track progress through a comprehensive telemetry dashboard. Unlock vintage stamps for landing in new continents, protect your active streak with freezes, and maintain real-time chat logs inside active cabins.
            </p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-electric-500/10 flex items-center justify-center text-xs border border-electric-500/20 flex-shrink-0">✓</div>
                <p className="text-xs text-white/80"><strong>Streak Protection Locks</strong>: Duolingo-style streak freeze shields automatically trigger to prevent streak decay on busy days.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-lg bg-electric-500/10 flex items-center justify-center text-xs border border-electric-500/20 flex-shrink-0">✓</div>
                <p className="text-xs text-white/80"><strong>Geographic Achievements</strong>: Interactive maps trace completed flight lines and store collected stamps in your Pilot License.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mockup 1: Streak Calendar */}
            <Card className="p-4 border border-white/5 bg-white/[0.01] rounded-3xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-[9px] font-mono text-white/40">STREAK CONTROL SYSTEM</span>
                <span className="text-xs">🔥 12</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[8px] font-mono text-center text-white/40">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="bg-electric-500/40 text-electric-300 rounded-full font-bold">★</span>
                <span className="text-white/20">◦</span>
                <span className="text-white/20">◦</span>
              </div>
              <p className="text-[9px] text-white/40 mt-2 font-mono">1 freeze active. Next freeze in 3 flights.</p>
            </Card>

            {/* Mockup 2: Vintage Stamps */}
            <Card className="p-4 border border-white/5 bg-white/[0.01] rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-[9px] font-mono text-white/40">PASSPORT LOG STAMPS</span>
                <span className="text-xs">🛃</span>
              </div>
              <div className="flex gap-2 justify-center">
                <div className="size-8 rounded-full border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-xs" title="Dubai stamp">🕌</div>
                <div className="size-8 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-xs" title="Singapore stamp">🦁</div>
                <div className="size-8 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-xs" title="London stamp">🇬🇧</div>
              </div>
              <p className="text-[9px] text-white/40 mt-2 text-center font-mono">3 regions claimed. 12 available.</p>
            </Card>

            {/* Mockup 3: In-Flight Lounge Chat */}
            <Card className="p-4 border border-white/5 bg-white/[0.01] rounded-3xl sm:col-span-2 text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="text-[9px] font-mono text-white/40">CO-PILOTS LOUNGE CHAT</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-1.5 font-mono text-[9px] max-h-16 overflow-y-auto">
                <p><span className="text-electric-400">@sophia</span>: Just reached Flight Level 380! Aerodynamics notes are solid ✈️</p>
                <p><span className="text-indigo-400">@daniel</span>: Studying macroeconomics. Real accountability in multiplayer.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION: Testimonials & Social Proof */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 border-t border-white/5 text-center">
        <span className="rounded-full bg-amber-500/10 px-3.5 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/20 uppercase tracking-wider">
          🗣️ Pilot Testimonials
        </span>
        <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight">
          What the <span className="text-gradient-electric">Study Fleet</span> is Saying
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xs text-white/60 leading-relaxed">
          From medical board exams to distributed systems engineering, here is how GoFocusGen is helping cadets stay locked inside the study cockpit.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          {TESTIMONIALS.map((t, idx) => (
            <Card key={idx} className="p-5 border border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 rounded-3xl flex flex-col justify-between">
              <p className="text-xs italic leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-white/5">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 py-20 border-t border-white/5">
        <div className="text-center mb-10">
          <span className="rounded-full bg-electric-500/10 px-3.5 py-1 text-[10px] font-bold text-electric-400 border border-electric-500/20 uppercase tracking-wider">
            💡 Flight Dispatch FAQ
          </span>
          <h2 className="mt-4 font-display text-3xl font-black text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs text-white/60">
            Aviation logs and algorithmic transparency details for prospective focus pilots.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div
                key={idx}
                className="border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <span className="text-xs font-bold text-white">{item.question}</span>
                  <ChevronDown
                    className={`size-4 text-white/40 transition-transform duration-300 ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-4 pt-0 text-[11px] leading-relaxed text-white/50 border-t border-white/5">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center font-display">
        <p className="text-xs text-white/35">
          GoFocusGen — Study Like You&apos;re Travelling the World
        </p>
        
        {/* Social Media Footer Links */}
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-white/30">
          <a
            href="https://www.instagram.com/gofocusgen/?utm_source=ig_web_button_share_sheet"
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
