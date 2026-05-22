"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";

const SAMPLE_STUDIERS = [
  { id: "1", name: "Arjun", country: "India", flag: "🇮🇳", subject: "Calculus", seconds: 7380 },
  { id: "2", name: "Sofia", country: "Spain", flag: "🇪🇸", subject: "IELTS Prep", seconds: 5040 },
  { id: "3", name: "Yuki", country: "Japan", flag: "🇯🇵", subject: "Machine Learning", seconds: 9600 },
  { id: "4", name: "Emre", country: "Turkey", flag: "🇹🇷", subject: "Physics", seconds: 3240 },
  { id: "5", name: "Lena", country: "Germany", flag: "🇩🇪", subject: "Organic Chem", seconds: 2100 },
  { id: "6", name: "Priya", country: "India", flag: "🇮🇳", subject: "Data Structures", seconds: 4500 },
];

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export default function DashboardPage() {
  const { user, loading } = useUser();
  const [studiers, setStudiers] = useState(SAMPLE_STUDIERS.slice(0, 4));
  const [totalRooms] = useState(243);

  // Simulate live feed: add a new person every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStudiers((prev) => {
        const next = SAMPLE_STUDIERS[(prev.length) % SAMPLE_STUDIERS.length];
        return [next, ...prev].slice(0, 6);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function handleSignOut() {
    const { createClient: makeClient } = await import("@/lib/supabase/client");
    const supabase = makeClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950">
      {/* Globe background */}
      <GlobeBackground />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-display text-lg font-bold text-white">FlightEdu</span>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user && (
            <div className="flex items-center gap-2">
              <img
                src={getAvatarUrl(user.email ?? "user")}
                alt="avatar"
                className="size-8 rounded-full border border-white/20 bg-white/10"
              />
              <span className="hidden text-sm font-medium text-white/80 sm:block">
                {user.user_metadata?.name ?? user.email?.split("@")[0]}
              </span>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1.5 text-xs text-white/40 hover:bg-white/8 hover:text-white/70 transition"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Live feed */}
      <div className="relative z-20 mx-auto w-full max-w-md flex-1 px-4 pb-28">
        <div className="mb-4">
          <p className="text-center text-sm text-white/40">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            {totalRooms} sessions active right now
          </p>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {studiers.map((s) => (
              <motion.div
                key={s.id + s.subject}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 backdrop-blur-sm shadow-lg"
              >
                <img
                  src={getAvatarUrl(s.name)}
                  alt={s.name}
                  className="size-11 rounded-full bg-white/50 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">
                    {s.flag} {s.name} from {s.country}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{s.subject}</p>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold text-gray-700">
                  {formatDuration(s.seconds)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 pb-8 pt-4">
        <Link href="/journey">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 rounded-full bg-white/95 px-8 py-3.5 text-base font-semibold text-gray-800 shadow-2xl backdrop-blur"
          >
            Start a journey ✈️
            <span className="flex gap-0.5">
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </motion.button>
        </Link>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </main>
  );
}

function BottomNav() {
  const items = [
    { icon: "🏠", label: "Home", href: "/dashboard" },
    { icon: "🗺️", label: "Map", href: "/map" },
    { icon: "✈️", label: "Journey", href: "/journey" },
    { icon: "🏆", label: "Ranks", href: "/leaderboard" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-2xl bg-navy-800/80 backdrop-blur border border-white/10 px-2 py-1.5">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function GlobeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1a35] to-[#0a1628]" />

      {/* Globe circle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 size-[120vw] max-w-3xl rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 35% 35%, #1e4d8c 0%, #0e2d5e 35%, #071428 70%, #040b1a 100%)",
          boxShadow: "0 0 80px 20px rgba(14,80,180,0.15), inset 0 0 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Grid lines */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(100,180,255,0.15) 38px, rgba(100,180,255,0.15) 39px), repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(100,180,255,0.15) 38px, rgba(100,180,255,0.15) 39px)",
          }}
        />
      </motion.div>

      {/* Glow points on globe (cities) */}
      {[
        { top: "42%", left: "48%", delay: 0 },
        { top: "38%", left: "55%", delay: 1.5 },
        { top: "45%", left: "60%", delay: 0.8 },
        { top: "50%", left: "43%", delay: 2 },
        { top: "35%", left: "52%", delay: 1.2 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
          className="absolute size-1.5 rounded-full bg-electric-400"
          style={{ top: dot.top, left: dot.left }}
        />
      ))}

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15 }}
          className="absolute size-0.5 rounded-full bg-white"
          style={{
            top: `${(i * 17 + 5) % 55}%`,
            left: `${(i * 23 + 3) % 95}%`,
          }}
        />
      ))}
    </div>
  );
}
