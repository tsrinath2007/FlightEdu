"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Lock, ShieldAlert, Coffee, Compass, Trophy, Radio, Send, Loader2,
  ChevronRight, Sparkles, Clock, User, LogOut, CheckCircle2, AlertTriangle
} from "lucide-react";
import Logo from "@/components/brand/Logo";

interface LockedStatus {
  currentRank: string;
  flightsRemaining: number;
  hoursRemaining: number;
  completedFlightsCount: number;
  totalHours: number;
}

interface ActivePilot {
  id: string;
  name: string;
  originCode: string;
  destinationCode: string;
  duration: number;
  elapsed: number;
  subject: string;
  mode: string;
  avatarUrl: string;
  isSimulated: boolean;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  totalHours: number;
  completedFlights: number;
}

interface FlightLog {
  id: string;
  name: string;
  avatarUrl: string;
  flightLog: string;
  updatedAt: string;
}

export default function LoungePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);
  const [lockedStatus, setLockedStatus] = useState<LockedStatus | null>(null);

  // Lounge data state
  const [currentRank, setCurrentRank] = useState("");
  const [activePresence, setActivePresence] = useState<ActivePilot[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);

  // Log post state
  const [newLog, setNewLog] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState(false);

  // Active Lounge Tab
  const [activeTab, setActiveTab] = useState<"deck" | "logs" | "leaderboard">("deck");

  // Fetch Lounge stats
  const fetchLoungeData = async () => {
    try {
      const res = await fetch("/api/lounge");
      if (res.status === 401) {
        router.push("/login?message=session_required");
        return;
      }
      const data = await res.json();
      if (res.status === 403) {
        setGated(true);
        setLockedStatus(data);
      } else if (res.ok) {
        setGated(false);
        setCurrentRank(data.currentRank);
        setActivePresence(data.activePresence);
        setWeeklyLeaderboard(data.weeklyLeaderboard);
        setFlightLogs(data.flightLogs);
      }
    } catch (err) {
      console.error("Failed to load Lounge:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoungeData();

    // Auto refresh active pilots list every 45 seconds
    const interval = setInterval(() => {
      if (!gated && !loading) {
        fetchLoungeData();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [gated, loading]);

  const handlePostLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setPosting(true);
    setPostError("");
    setPostSuccess(false);

    try {
      const res = await fetch("/api/lounge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: newLog }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPostError(data.error || "Failed to transmit log.");
      } else {
        setNewLog("");
        setPostSuccess(true);
        // Refresh logs immediately
        await fetchLoungeData();
        // Hide success message after 3s
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (err) {
      setPostError("Network error occurred.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white gap-4">
        <Loader2 className="size-10 animate-spin text-amber-500" />
        <p className="text-xs uppercase tracking-widest text-amber-500/60 font-mono">Securing Crew Lounge Access...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 px-4 py-8 md:p-8 noise text-white pb-32">
      {/* Background ambient gold/amber glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[20%] size-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] size-[400px] rounded-full bg-electric-500/5 blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between py-4 border-b border-white/5 mb-8">
        <div className="flex items-center gap-2">
          <Logo layout="horizontal" size="md" />
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Lounge Access: Under Process
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass border border-amber-500/20 rounded-[32px] p-6 md:p-12 text-center shadow-2xl relative overflow-hidden mt-8"
        >
          {/* Top ambient gold warning bar */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
          
          <div className="flex flex-col items-center">
            {/* Under Construction Gear/Radio Icon */}
            <div className="relative size-32 rounded-full border-4 border-dashed border-amber-500/30 flex items-center justify-center bg-amber-500/5 mb-6">
              <div className="absolute inset-2 rounded-full border-2 border-amber-500/20 flex items-center justify-center bg-navy-950">
                <Coffee className="size-10 text-amber-500 animate-bounce" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-black uppercase tracking-wider text-amber-400 md:text-3xl">
              Lounge Under Process
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-amber-500/50 uppercase mt-1">
              SYSTEM STATUS: UNDER DEVELOPMENT
            </p>

            <p className="text-white/60 text-sm mt-6 leading-relaxed">
              Our ground crew is currently prepping the In-Flight Lounge space. Please note that access to this area requires a rank of <strong>Co-Pilot or higher (Co-Pilot+)</strong>. Once the lounge is ready and open for boarding, you will receive a notification to join.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 w-full">
              <div className="h-px bg-white/5 w-full my-2" />
              <p className="text-xs italic text-amber-500/70">
                &ldquo;Prepping cabin amenities. Keep checking the dispatch manifest for updates.&rdquo;
              </p>
              <Link href="/dashboard" className="w-full">
                <button className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-navy-950 font-semibold uppercase tracking-wider text-xs rounded-xl cursor-pointer transition">
                  Return to Cockpit Dashboard
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 pb-8 pt-4">
        <BottomNav />
      </div>
    </main>
  );
}

function CardTemplate({ pilot, progressPercent }: { pilot: ActivePilot; progressPercent: number }) {
  return (
    <div className="glass border border-white/10 hover:border-white/20 rounded-2xl p-5 relative overflow-hidden backdrop-blur-xl transition duration-300 flex flex-col justify-between">
      {/* Top Tag bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-[9px] font-mono">
        <div className="flex items-center gap-1.5 text-white/40">
          {pilot.avatarUrl && (pilot.avatarUrl.startsWith("http://") || pilot.avatarUrl.startsWith("https://")) ? (
            <img
              src={pilot.avatarUrl}
              alt={pilot.name}
              className="size-5 rounded-full border border-white/10 bg-white/5 object-cover"
            />
          ) : (
            <span>{pilot.avatarUrl || "✈️"}</span>
          )}
          <span className="font-bold text-white/80">{pilot.name}</span>
          {pilot.isSimulated && (
            <span className="text-[8px] bg-white/5 border border-white/10 px-1 rounded-sm text-white/30 uppercase">
              Sim
            </span>
          )}
        </div>
        <span
          className={`px-1.5 py-0.5 rounded border ${
            pilot.mode === "HARDCORE"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-electric-500/10 border-electric-500/20 text-electric-300"
          }`}
        >
          {pilot.mode}
        </span>
      </div>

      {/* Route Info */}
      <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-xl p-2.5 mb-3">
        <div>
          <p className="text-[7px] font-mono text-white/40 uppercase">Origin</p>
          <p className="font-mono text-xs font-black text-white">{pilot.originCode}</p>
        </div>

        <div className="flex flex-col items-center flex-1 mx-4">
          <span className="text-[7.5px] font-mono text-white/40">
            {pilot.elapsed}m / {pilot.duration}m
          </span>
          <div className="w-full h-0.5 bg-white/10 relative mt-1">
            <div
              className="absolute top-0 bottom-0 left-0 bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <Plane
              className="size-3 text-amber-500 rotate-90 absolute top-1/2 transform -translate-y-1/2"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
        </div>

        <div className="text-right">
          <p className="text-[7px] font-mono text-white/40 uppercase">Destination</p>
          <p className="font-mono text-xs font-black text-white">{pilot.destinationCode}</p>
        </div>
      </div>

      {/* Study Topic */}
      <div className="flex items-start gap-2 bg-white/[0.01] border border-white/5 rounded-xl p-3">
        <span className="text-xs">📚</span>
        <div>
          <p className="text-[8px] font-mono text-white/30 uppercase leading-none">Focus Subject</p>
          <p className="text-[11.5px] font-bold text-white/80 leading-snug mt-1 truncate max-w-[280px]">
            {pilot.subject}
          </p>
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  const items = [
    { icon: "🏠", label: "Home", href: "/dashboard" },
    { icon: "☕", label: "Lounge", href: "/lounge" },
    { icon: "👥", label: "Friends", href: "/friends" },
    { icon: "🗺️", label: "Map", href: "/map" },
    { icon: "✈️", label: "Journey", href: "/journey" },
    { icon: "🏆", label: "Ranks", href: "/leaderboard" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-2xl bg-navy-800/80 backdrop-blur border border-white/10 px-2 py-1.5 shadow-2xl">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition ${
            item.href === "/lounge"
              ? "bg-amber-500/20 text-amber-400 font-semibold"
              : "text-white/50 hover:bg-white/8 hover:text-white"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
