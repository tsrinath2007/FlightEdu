"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PublicUser {
  id: string;
  name: string | null;
  pilotId: string | null;
  avatarUrl: string | null;
  coins: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [scope, setScope] = useState<"world" | "friends">("world");
  const [metric, setMetric] = useState<"coins" | "hours" | "streak">("coins");
  const [rankings, setRankings] = useState<PublicUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load active user from localStorage just to ensure we can identify them immediately in case db lag
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to parse local user id from cached onboarding
    try {
      const onboardCache = localStorage.getItem("gofocusgen_onboarding");
      if (onboardCache) {
        const parsed = JSON.parse(onboardCache);
        if (parsed.id) setLocalUserId(parsed.id);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
  }, [scope, metric]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?scope=${scope}&metric=${metric}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
        setCurrentUserRank(data.currentUserRank);
        setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error("Failed to load rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricValueString = (user: PublicUser) => {
    if (metric === "coins") return `🪙 ${user.coins.toLocaleString()}`;
    if (metric === "hours") return `⚡ ${user.totalHours.toFixed(1)}h`;
    return `🔥 ${user.currentStreak}d`;
  };

  const getMetricLabel = () => {
    if (metric === "coins") return "Focus Coins";
    if (metric === "hours") return "Flight Hours";
    return "Current Streak";
  };

  // Divide rankings into Podium (top 3) and List (4+)
  const podiumUsers = rankings.slice(0, 3);
  const listUsers = rankings.slice(3);

  // Arrange podium: [2nd, 1st, 3rd] if they exist
  const orderedPodium: { user: PublicUser; rank: number }[] = [];
  if (podiumUsers.length > 1) {
    orderedPodium.push({ user: podiumUsers[1], rank: 2 }); // 2nd on left
  }
  if (podiumUsers.length > 0) {
    orderedPodium.push({ user: podiumUsers[0], rank: 1 }); // 1st in center
  }
  if (podiumUsers.length > 2) {
    orderedPodium.push({ user: podiumUsers[2], rank: 3 }); // 3rd on right
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white noise">
      {/* Deep Space Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a17] via-[#0a0f1e] to-[#0d1426]" />
      
      {/* Dynamic Radar Glow Rings in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] opacity-10 pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-electric-400 animate-[pulse_6s_infinite]" />
        <div className="absolute inset-[15%] rounded-full border border-indigo-400/80 animate-[pulse_4s_infinite_1s]" />
        <div className="absolute inset-[35%] rounded-full border border-purple-500/60" />
      </div>

      <div className="absolute top-[-10%] left-[-15%] size-[60vw] rounded-full bg-electric-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] size-[60vw] rounded-full bg-neon-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-6 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition">
          <span className="text-lg">←</span>
          <span className="text-xs font-semibold tracking-wider font-display uppercase">Home</span>
        </Link>
        <h1 className="font-display text-lg font-black tracking-[0.2em] text-gradient-electric uppercase">
          Pilot Standings
        </h1>
        <div className="w-12" /> {/* Spacer */}
      </header>

      <div className="relative z-30 mx-auto w-full max-w-md flex-1 px-4 pb-32 flex flex-col">
        {/* Toggle Scope: World / Friends */}
        <div className="mb-4 flex gap-1 rounded-2xl bg-white/5 border border-white/8 p-1 backdrop-blur-md">
          <button
            onClick={() => setScope("world")}
            className={`flex-1 rounded-xl py-2.5 text-center text-xs font-bold tracking-wider font-display uppercase transition duration-300 ${
              scope === "world"
                ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            🌍 Global Radar
          </button>
          <button
            onClick={() => setScope("friends")}
            className={`flex-1 rounded-xl py-2.5 text-center text-xs font-bold tracking-wider font-display uppercase transition duration-300 ${
              scope === "friends"
                ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            👥 My Flight Crew
          </button>
        </div>

        {/* Toggle Metrics: Coins, Hours, Streak */}
        <div className="mb-6 flex gap-1 rounded-xl bg-navy-900/60 border border-white/5 p-1 backdrop-blur-sm">
          {[
            { id: "coins", label: "Coins", icon: "🪙" },
            { id: "hours", label: "Hours", icon: "⚡" },
            { id: "streak", label: "Streak", icon: "🔥" },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id as any)}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-bold font-display uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
                metric === m.id
                  ? "bg-electric-500/20 text-electric-400 border border-electric-500/30 shadow-glow-electric"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Leaderboard Rankings */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            {/* Spinning flight radar scan effect */}
            <div className="relative size-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-electric-500/20 border-t-electric-500 animate-spin" />
              <span className="text-xl">✈️</span>
            </div>
            <p className="mt-4 text-xs font-semibold tracking-widest text-electric-400 uppercase animate-pulse">
              Scanning Flight Coordinates...
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {rankings.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
                <span className="text-5xl block animate-bounce mb-3">📡</span>
                <h3 className="text-base font-black tracking-wider font-display uppercase">Radar Silent</h3>
                <p className="mt-2 text-xs text-white/50 leading-relaxed">
                  {scope === "friends"
                    ? "Your personal flight crew is empty. Search and invite wingmen in the Crew tab to view their rankings!"
                    : "No cadets onboarded yet. Be the first pilot to command this sky!"}
                </p>
                {scope === "friends" && (
                  <Link href="/friends">
                    <button className="mt-5 rounded-2xl bg-electric-500/20 border border-electric-400/40 px-6 py-2.5 text-xs font-bold text-electric-400 hover:bg-electric-500/30 transition shadow-glow-electric">
                      Recruit Wingmen 👥
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* 1. Podium display (Top 3) */}
                {podiumUsers.length > 0 && (
                  <div className="relative flex items-end justify-center gap-2 sm:gap-4 pt-12 pb-4 px-2 select-none">
                    <AnimatePresence mode="wait">
                      {orderedPodium.map(({ user, rank }) => {
                        const isFirst = rank === 1;
                        const isSecond = rank === 2;
                        const isThird = rank === 3;
                        const isCurrentUser = user.id === localUserId || (currentUser && user.id === currentUser.id);

                        // Rank-specific styles
                        let podiumHeight = "h-36";
                        let ringColor = "border-amber-400";
                        let glowColor = "shadow-[0_0_15px_rgba(245,158,11,0.2)]";
                        let medal = "🥇";
                        let medalText = "text-amber-400";

                        if (isSecond) {
                          podiumHeight = "h-28";
                          ringColor = "border-slate-300";
                          glowColor = "shadow-[0_0_15px_rgba(203,213,225,0.15)]";
                          medal = "🥈";
                          medalText = "text-slate-300";
                        } else if (isThird) {
                          podiumHeight = "h-24";
                          ringColor = "border-amber-700";
                          glowColor = "shadow-[0_0_15px_rgba(180,83,9,0.15)]";
                          medal = "🥉";
                          medalText = "text-amber-600";
                        }

                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15, delay: rank * 0.1 }}
                            className={`flex flex-col items-center flex-1 min-w-[90px] max-w-[120px] relative`}
                          >
                            {/* Avatar holder */}
                            <div className="relative mb-2">
                              <img
                                src={user.avatarUrl || getAvatarUrl(user.name || "pilot")}
                                alt={user.name || "avatar"}
                                className={`size-14 sm:size-16 rounded-full border-2 bg-[#0c122c] object-cover relative z-10 ${ringColor} ${glowColor}`}
                              />
                              {/* Medal Badge overlay */}
                              <div className="absolute -bottom-1.5 -right-1 z-20 flex size-5 items-center justify-center rounded-full bg-navy-800 border border-white/10 text-xs shadow-md">
                                {medal}
                              </div>
                            </div>

                            {/* Pilot info */}
                            <div className="text-center w-full min-w-0 z-10 px-1 mb-2">
                              <p className={`text-xs font-bold leading-tight truncate ${isCurrentUser ? "text-electric-300 underline underline-offset-2" : "text-white"}`}>
                                {user.name || "Pilot"}
                              </p>
                              <p className="text-[8px] font-mono text-white/40 truncate">
                                @{user.pilotId || "noid"}
                              </p>
                            </div>

                            {/* Solid Podium block */}
                            <div
                              className={`w-full rounded-t-2xl border border-white/5 relative overflow-hidden flex flex-col justify-end items-center pb-3 ${podiumHeight} ${
                                isFirst
                                  ? "bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-white/5 border-t-amber-500/30"
                                  : isSecond
                                  ? "bg-gradient-to-t from-slate-400/10 via-slate-400/5 to-white/5 border-t-slate-400/30"
                                  : "bg-gradient-to-t from-amber-700/10 via-amber-700/5 to-white/5 border-t-amber-700/30"
                              }`}
                            >
                              <span className={`font-display font-black text-2xl ${medalText} opacity-80`}>
                                #{rank}
                              </span>
                              <span className="text-[10px] font-extrabold text-white mt-1 bg-white/5 border border-white/5 rounded-full px-2 py-0.5 shadow-sm">
                                {getMetricValueString(user)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. Scrolling ranking list (Ranks 4+) */}
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  <AnimatePresence initial={false}>
                    {listUsers.map((item, index) => {
                      const absoluteRank = index + 4;
                      const isCurrentUser = item.id === localUserId || (currentUser && item.id === currentUser.id);

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className={`flex items-center gap-3 rounded-2xl p-3.5 backdrop-blur-md transition ${
                            isCurrentUser
                              ? "bg-electric-500/5 border border-electric-400/50 shadow-[0_0_12px_rgba(56,189,248,0.15)]"
                              : "bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/15"
                          }`}
                        >
                          {/* Rank indicator */}
                          <span className="w-6 font-display font-black text-xs text-white/40 text-center">
                            #{absoluteRank}
                          </span>

                          {/* Avatar */}
                          <img
                            src={item.avatarUrl || getAvatarUrl(item.name || "pilot")}
                            alt={item.name || "avatar"}
                            className="size-9 rounded-full border border-white/10 bg-white/5"
                          />

                          {/* Profile name and Callsign */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs truncate">
                                {item.name || "Unknown Pilot"}
                              </span>
                              {isCurrentUser && (
                                <span className="rounded bg-electric-500/10 border border-electric-400/20 px-1 py-0.2 text-[7px] font-black text-electric-400 tracking-widest uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-mono text-white/35 truncate">
                              @{item.pilotId || "noid"}
                            </p>
                          </div>

                          {/* Metric score */}
                          <span className="rounded-xl bg-white/5 border border-white/5 px-2.5 py-1 text-xs font-bold text-white shadow-sm flex-shrink-0">
                            {getMetricValueString(item)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* 3. Floating persistent "Your standing" card */}
                {currentUser && currentUserRank !== null && (
                  <div className="rounded-2xl border border-electric-500/40 bg-[#070c1d] p-3.5 flex items-center gap-3 shadow-lg shadow-electric-500/5">
                    {/* Position Icon badge */}
                    <div className="size-8 rounded-full bg-electric-500/20 border border-electric-400/30 flex items-center justify-center text-xs font-black text-electric-400 font-display">
                      #{currentUserRank}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white/50 tracking-wider font-display uppercase">
                        Your Standings (Current)
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-white leading-tight">
                          {currentUser.name || "You"}
                        </span>
                        <span className="text-[9px] font-mono text-white/40">@{currentUser.pilotId || "noid"}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-medium text-white/40 uppercase">{getMetricLabel()}</p>
                      <p className="text-sm font-black text-electric-300 tracking-wide mt-0.5">
                        {getMetricValueString(currentUser)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav Menu */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center gap-3 pb-8 pt-4">
        <BottomNav />
      </div>
    </main>
  );
}

function BottomNav() {
  const items = [
    { icon: "🏠", label: "Home", href: "/dashboard" },
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
            item.href === "/leaderboard"
              ? "bg-white/10 text-white font-medium"
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
