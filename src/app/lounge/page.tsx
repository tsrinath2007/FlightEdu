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
            Co-Pilots Lounge
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl">
        <AnimatePresence mode="wait">
          {gated && lockedStatus ? (
            /* LOCKED DOOR UI */
            <motion.div
              key="locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass border border-amber-500/20 rounded-[32px] p-6 md:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden mt-8"
            >
              {/* Top ambient gold warning bar */}
              <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
              
              <div className="flex flex-col items-center">
                {/* Secure Hatch Icon */}
                <div className="relative size-32 rounded-full border-4 border-dashed border-amber-500/30 flex items-center justify-center bg-amber-500/5 mb-6 animate-[spin_60s_linear_infinite]">
                  <div className="absolute inset-2 rounded-full border-2 border-amber-500/20 flex items-center justify-center bg-navy-950">
                    <Lock className="size-10 text-amber-500 animate-pulse" />
                  </div>
                </div>

                <h1 className="font-display text-2xl font-black uppercase tracking-wider text-amber-400 md:text-3xl">
                  Crew Access Restricted
                </h1>
                <p className="font-mono text-[10px] tracking-widest text-amber-500/50 uppercase mt-1">
                  SECURITY LEVEL: CO-PILOT CERTIFIED
                </p>

                <p className="text-white/60 text-sm mt-6 max-w-md leading-relaxed">
                  The Co-Pilots Lounge is a gated space for experienced focus aviators. Keep flying. The Lounge opens at Co-Pilot rank.
                </p>

                {/* Progress Indicators Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10 text-left">
                  {/* Flight counts req */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
                      <span>Completed Flights</span>
                      <span className="text-amber-400">{lockedStatus.completedFlightsCount} / 30</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (lockedStatus.completedFlightsCount / 30) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-white/30 mt-2">
                      {lockedStatus.flightsRemaining > 0 
                        ? `✈️ ${lockedStatus.flightsRemaining} flights remaining` 
                        : "✓ Requirement satisfied"}
                    </p>
                  </div>

                  {/* Hours completed req */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
                      <span>Focus Hours Done</span>
                      <span className="text-amber-400">{Math.round(lockedStatus.totalHours)} / 45h</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (lockedStatus.totalHours / 45) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-white/30 mt-2">
                      {lockedStatus.hoursRemaining > 0 
                        ? `⏱️ ${Math.round(lockedStatus.hoursRemaining)} focus hours remaining` 
                        : "✓ Requirement satisfied"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3 w-full">
                  <div className="h-px bg-white/5 w-full my-2" />
                  <p className="text-xs italic text-amber-500/70">
                    &ldquo;Engage study flights from your cockpit dashboard to earn pilot credentials.&rdquo;
                  </p>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-navy-950 font-semibold uppercase tracking-wider text-xs rounded-xl cursor-pointer transition">
                      Return to Cockpit Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE LOUNGE DASHBOARD */
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Lounge Welcome Banner */}
              <div className="glass border border-white/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                    ☕
                  </div>
                  <div>
                    <h1 className="font-display text-xl font-black text-white leading-tight">
                      Co-Pilots STUDY LOUNGE
                    </h1>
                    <p className="text-xs text-white/50 mt-1">
                      Flight Level 380 • Shared study deck presence, logs, and leaderboard active.
                    </p>
                  </div>
                </div>
                
                {/* Active User Rank Specs */}
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl">
                  <span className="text-2xl">👨‍✈️</span>
                  <div className="text-left font-mono">
                    <p className="text-[9px] text-white/40 uppercase tracking-wider">Pilot Rank Info</p>
                    <p className="text-xs font-bold text-amber-400">{currentRank}</p>
                  </div>
                </div>
              </div>

              {/* Sub-navigation Tabs */}
              <div className="flex items-center justify-center md:justify-start border-b border-white/5 gap-2 pb-px">
                <button
                  onClick={() => setActiveTab("deck")}
                  className={`px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === "deck"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  📡 Active Flight Deck ({activePresence.length})
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === "logs"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  📝 Daily Flight Logs ({flightLogs.length})
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                    activeTab === "leaderboard"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  🏆 Weekly Manifest
                </button>
              </div>

              {/* Tab Contents */}
              <div className="min-h-[400px]">
                {activeTab === "deck" && (
                  /* ACTIVE PRESENCE DECK */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                        📡 REAL-TIME AIRSPACE PRESENCE MONITOR
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Radar Online
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePresence.map((pilot) => {
                        const progressPercent = Math.round((pilot.elapsed / pilot.duration) * 100);
                        return (
                          <CardTemplate key={pilot.id} pilot={pilot} progressPercent={progressPercent} />
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "logs" && (
                  /* FLIGHT LOG TRANSMITTER & FEED */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Log Transmitter Form (Left 5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="glass border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500/30" />
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Radio className="size-4 text-amber-500 animate-pulse" />
                          <span className="font-mono text-xs text-white/60 uppercase">Transponder Status Link</span>
                        </div>

                        <form onSubmit={handlePostLog} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5">
                              Transmit Daily Flight Log (1-2 sentences)
                            </label>
                            <textarea
                              value={newLog}
                              onChange={(e) => setNewLog(e.target.value)}
                              placeholder="Describe today's focus cruise. e.g. studying biochemistry exam questions..."
                              maxLength={200}
                              rows={3}
                              className="w-full bg-navy-950/80 border border-white/10 hover:border-white/20 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none transition duration-300 resize-none font-sans"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase">
                            <span>Buffer usage:</span>
                            <span className={newLog.length > 180 ? "text-rose-400 font-bold" : ""}>
                              {newLog.length} / 200 bytes
                            </span>
                          </div>

                          {postError && (
                            <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                              <AlertTriangle className="size-3.5" />
                              <span>{postError}</span>
                            </div>
                          )}

                          {postSuccess && (
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                              <CheckCircle2 className="size-3.5" />
                              <span>Transmission success. Airspace logged.</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={posting || !newLog.trim()}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/5 disabled:text-white/20 text-navy-950 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            {posting ? (
                              <Loader2 className="size-4 animate-spin text-navy-950" />
                            ) : (
                              <>
                                <Send className="size-3.5" />
                                Transmit Flight Log
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Flight Logs Scroll Feed (Right 7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                        📝 RECENT LOG TRANSCRIPT FEED
                      </p>

                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {flightLogs.map((log) => {
                          const dateObj = new Date(log.updatedAt);
                          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                          return (
                            <div key={log.id} className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl p-4 transition-all duration-300">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-[10px] font-mono text-white/40">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">{log.avatarUrl || "✈️"}</span>
                                  <span className="font-bold text-white/80">{log.name}</span>
                                </div>
                                <span>{dateStr} {timeStr}</span>
                              </div>
                              <p className="text-xs leading-relaxed text-white/70 italic pl-1 font-sans">
                                &ldquo;{log.flightLog}&rdquo;
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "leaderboard" && (
                  /* WEEKLY LEADERBOARD TABLE */
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                        🏆 SHIFT WEEKLY FLIGHT HOUR LEADERBOARD (PAST 7 DAYS)
                      </p>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Reset: Sun 00:00 UTC
                      </span>
                    </div>

                    <div className="glass border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-[9.5px] font-mono text-white/40 uppercase tracking-wider">
                            <th className="py-4 px-6 text-center w-16">Rank</th>
                            <th className="py-4 px-4">Pilot Profile</th>
                            <th className="py-4 px-4 text-center">Flights Logged</th>
                            <th className="py-4 px-6 text-right">Total Focus Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs">
                          {weeklyLeaderboard.map((entry, idx) => {
                            const isTopThree = idx < 3;
                            const medalGlows = [
                              "text-yellow-400", // 1st
                              "text-slate-300",  // 2nd
                              "text-amber-600",  // 3rd
                            ];
                            return (
                              <tr key={entry.userId} className="hover:bg-white/[0.01] transition-colors">
                                <td className="py-4 px-6 text-center font-bold font-mono">
                                  {isTopThree ? (
                                    <span className={`text-sm ${medalGlows[idx]} flex items-center justify-center gap-0.5`}>
                                      {["🥇", "🥈", "🥉"][idx]}
                                    </span>
                                  ) : (
                                    <span className="text-white/40">{idx + 1}</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-lg">{entry.avatarUrl || "✈️"}</span>
                                    <span className="font-semibold text-white/80">{entry.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center font-mono text-white/60">
                                  {entry.completedFlights} flights
                                </td>
                                <td className="py-4 px-6 text-right font-mono text-amber-400 font-bold">
                                  {entry.totalHours.toFixed(1)} hrs
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          <span>{pilot.avatarUrl || "✈️"}</span>
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
