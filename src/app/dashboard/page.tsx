"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user, loading } = useUser();
  const [studiers, setStudiers] = useState(SAMPLE_STUDIERS.slice(0, 4));
  const [totalRooms] = useState(243);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("Pilot");
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userStreak, setUserStreak] = useState<number>(0);
  const [userStreakFreezes, setUserStreakFreezes] = useState<number>(2);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [flightInvites, setFlightInvites] = useState<any[]>([]);
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);
  const [focusRemindersEnabled, setFocusRemindersEnabled] = useState(false);

  // Load custom user details and avatar on user changes
  useEffect(() => {
    // A. Perform local key migration immediately to ensure any existing legacy progress is synced
    const legacyPrefixes = ["flightedu", "focuszen", "voyageiq"];
    const targetPrefix = "gofocusgen";
    const keySuffixes = ["_onboarding", "_avatar", "_username", "_pilot_id", "_pilot_details"];

    for (const suffix of keySuffixes) {
      const targetKey = `${targetPrefix}${suffix}`;
      if (!localStorage.getItem(targetKey)) {
        for (const legacyPrefix of legacyPrefixes) {
          const legacyKey = `${legacyPrefix}${suffix}`;
          const val = localStorage.getItem(legacyKey);
          if (val) {
            localStorage.setItem(targetKey, val);
            break;
          }
        }
      }
    }

    // B. Load from localStorage cache (critical for simulated sessions and instant loading)
    const savedAvatar = localStorage.getItem("gofocusgen_avatar");
    if (savedAvatar) setAvatarPreview(savedAvatar);

    const cachedOnboarding = localStorage.getItem("gofocusgen_onboarding");
    if (cachedOnboarding) {
      try {
        const parsed = JSON.parse(cachedOnboarding);
        if (parsed.name) setDisplayName(parsed.name);
        if (parsed.avatarUrl) setAvatarPreview(parsed.avatarUrl);
        if (parsed.coins !== undefined) setUserCoins(parsed.coins);
        if (parsed.currentStreak !== undefined) setUserStreak(parsed.currentStreak);
        if (parsed.streakFreezes !== undefined) setUserStreakFreezes(parsed.streakFreezes);
      } catch {}
    }

    if (!user) {
      // If we are in simulated mode, set robust default fallbacks so offline pilots have simulated coins!
      if (typeof window !== "undefined" && window.location.search.includes("simulated=true")) {
        if (!cachedOnboarding) {
          setDisplayName("Alex Groves");
          setUserCoins(10000);
        }
      }
      return;
    }

    // 1. Initial fallbacks
    setDisplayName(user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Pilot");

    // 3. Fetch fresh data from backend DB
    fetch("/api/user/onboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("fail");
      })
      .then((data) => {
        if (data.user) {
          if (data.user.name) setDisplayName(data.user.name);
          if (data.user.coins !== undefined) setUserCoins(data.user.coins);
          if (data.user.currentStreak !== undefined) setUserStreak(data.user.currentStreak);
          if (data.user.streakFreezes !== undefined) setUserStreakFreezes(data.user.streakFreezes);
          if (data.user.avatarUrl) {
            setAvatarPreview(data.user.avatarUrl);
            localStorage.setItem("gofocusgen_avatar", data.user.avatarUrl);
          }
          localStorage.setItem("gofocusgen_onboarding", JSON.stringify(data.user));
        }
      })
      .catch(() => {});

    // 4. Fetch pending friend requests
    fetch("/api/friends/request")
      .then((res) => res.json())
      .then((data) => {
        if (data.incoming) setIncomingRequests(data.incoming);
      })
      .catch(() => {});

    // 5. Fetch pending private cockpit session invites
    fetch("/api/sessions/invitations")
      .then((res) => res.json())
      .then((data) => {
        if (data.invites) setFlightInvites(data.invites);
      })
      .catch(() => {});

    // 6. Fetch admin coin notifications
    fetch("/api/user/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          try {
            const dismissed = JSON.parse(localStorage.getItem("dismissed_admin_notifs") || "[]") as string[];
            const active = data.notifications.filter((n: any) => !dismissed.includes(n.id));
            setAdminNotifs(active);
          } catch {
            setAdminNotifs(data.notifications);
          }
        }
      })
      .catch(() => {});
  }, [user]);

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

  const handleAcceptRequest = async (senderId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });
      if (res.ok) {
        setIncomingRequests((prev) => prev.filter((r) => r.user.id !== senderId));
      }
    } catch {}
  };

  const handleDeclineRequest = async (otherUserId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId }),
      });
      if (res.ok) {
        setIncomingRequests((prev) => prev.filter((r) => r.user.id !== otherUserId));
      }
    } catch {}
  };

  const handleAcceptFlightInvite = async (sessionId: string) => {
    try {
      const res = await fetch("/api/sessions/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        // Engage engines and launch boarding!
        window.location.href = `/session/${sessionId}/boarding`;
      }
    } catch {}
  };

  const handleDeclineFlightInvite = async (sessionId: string) => {
    try {
      const res = await fetch("/api/sessions/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setFlightInvites((prev) => prev.filter((inv) => inv.sessionId !== sessionId));
      }
    } catch {}
  };

  useEffect(() => {
    const sound = localStorage.getItem("sound_effects_enabled");
    if (sound !== null) {
      setSoundEffectsEnabled(sound === "true");
    } else {
      setSoundEffectsEnabled(false); // Keep sound off initially when entering
    }

    const reminders = localStorage.getItem("focus_reminders_enabled");
    if (reminders !== null) setFocusRemindersEnabled(reminders === "true");
  }, []);

  const toggleSoundEffects = () => {
    const nextVal = !soundEffectsEnabled;
    setSoundEffectsEnabled(nextVal);
    localStorage.setItem("sound_effects_enabled", String(nextVal));
  };

  const toggleFocusReminders = () => {
    const nextVal = !focusRemindersEnabled;
    setFocusRemindersEnabled(nextVal);
    localStorage.setItem("focus_reminders_enabled", String(nextVal));
  };

  const handleDismissAdminNotif = (notifId: string) => {
    try {
      const dismissed = JSON.parse(localStorage.getItem("dismissed_admin_notifs") || "[]") as string[];
      dismissed.push(notifId);
      localStorage.setItem("dismissed_admin_notifs", JSON.stringify(dismissed));
      setAdminNotifs((prev) => prev.filter((n) => n.id !== notifId));
    } catch {}
  };

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
      <header className="relative z-40 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-display text-lg font-bold text-white tracking-wide">GoFocusGen</span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 relative">
          {/* Coins Display */}
          {!loading && user && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-amber-400 font-bold text-[10px] sm:text-xs tracking-wide shadow-[0_0_8px_rgba(245,158,11,0.15)] select-none">
              <span>🪙</span>
              <span>{userCoins}</span>
            </div>
          )}

          {/* Streak Display */}
          {!loading && user && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-2 py-1 text-orange-400 font-bold text-[10px] sm:text-xs tracking-wide shadow-[0_0_8px_rgba(249,115,22,0.15)] select-none" title="Current Daily Streak">
              <span>🔥</span>
              <span>{userStreak}d</span>
            </div>
          )}

          {/* Streak Freezes Display */}
          {!loading && user && (
            <div className="flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-cyan-400 font-bold text-[10px] sm:text-xs tracking-wide shadow-[0_0_8px_rgba(6,182,212,0.15)] select-none" title="Streak Freezes Available">
              <span>🧊</span>
              <span>{userStreakFreezes}</span>
            </div>
          )}

          {/* Settings Button */}
          {!loading && user && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition cursor-pointer flex items-center justify-center text-white/70 hover:text-white"
              title="Open Settings"
            >
              <span className="text-xs">⚙️</span>
            </button>
          )}

          {/* Notifications Bell */}
          {!loading && user && (() => {
            const totalNotifs = incomingRequests.length + flightInvites.length + adminNotifs.length;
            return (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition cursor-pointer flex items-center justify-center"
                >
                  <span className="text-xs">🔔</span>
                  {totalNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono font-bold text-[8px] size-3.5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                      {totalNotifs}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      {/* Click outside backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotifications(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-[#0c122c]/95 border border-white/10 rounded-2xl p-4 shadow-2xl space-y-4 z-50 backdrop-blur-md text-left"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-wider">Cadet Crew Alerts</h4>
                          <span className="text-[8px] font-mono text-white/40">{totalNotifs} pending</span>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                          {totalNotifs === 0 ? (
                            <p className="text-center py-6 text-[10px] text-white/35">No pending notifications.</p>
                          ) : (
                            <>
                              {/* 1. Private Flight Cabin Invitations */}
                              {flightInvites.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[7px] font-mono tracking-widest text-emerald-400 uppercase font-bold border-b border-white/5 pb-1">✦ Flight Invitations ✦</p>
                                  {flightInvites.map((inv) => (
                                    <div key={inv.id} className="flex flex-col gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-display font-extrabold text-emerald-300 text-[8px] uppercase">
                                          🛫
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[9px] font-bold text-white leading-tight truncate">Private Cabin Invitation</p>
                                          <p className="text-[7px] text-white/50 truncate mt-0.5">From: {inv.session.host.name} • {inv.session.originCode} → {inv.session.destinationCode}</p>
                                        </div>
                                      </div>

                                      <div className="flex gap-1.5 mt-1">
                                        <button
                                          onClick={() => handleAcceptFlightInvite(inv.sessionId)}
                                          className="flex-1 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[8px] font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-600/10"
                                        >
                                          Accept & Board
                                        </button>
                                        <button
                                          onClick={() => handleDeclineFlightInvite(inv.sessionId)}
                                          className="flex-1 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-mono text-[8px] font-bold uppercase tracking-wider transition cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 2. Friend Requests */}
                              {incomingRequests.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[7px] font-mono tracking-widest text-purple-400 uppercase font-bold border-b border-white/5 pb-1">✦ Crew Requests ✦</p>
                                  {incomingRequests.map((req) => (
                                    <div key={req.friendshipId} className="flex flex-col gap-2 bg-white/4 border border-white/5 rounded-xl p-2">
                                      <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-display font-extrabold text-purple-300 text-[8px] uppercase">
                                          {req.user.name?.substring(0, 2) || "PL"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[10px] font-bold text-white leading-tight truncate">{req.user.name}</p>
                                          <p className="text-[7px] font-mono text-white/40 mt-0.5 truncate">ID: {req.user.pilotId}</p>
                                        </div>
                                      </div>

                                      <div className="flex gap-1.5 mt-1">
                                        <button
                                          onClick={() => handleAcceptRequest(req.user.id)}
                                          className="flex-1 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-mono text-[8px] font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-purple-600/10"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleDeclineRequest(req.user.id)}
                                          className="flex-1 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-mono text-[8px] font-bold uppercase tracking-wider transition cursor-pointer"
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* 3. Admin Coin Grants */}
                              {adminNotifs.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-[7px] font-mono tracking-widest text-yellow-400 uppercase font-bold border-b border-white/5 pb-1">✦ Crew Treasury Alerts ✦</p>
                                  {adminNotifs.map((notif) => (
                                    <div key={notif.id} className="flex flex-col gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-2 relative group animate-fade-in">
                                      <div className="flex items-center gap-2">
                                        <div className="size-6 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-[10px]">
                                          🪙
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-[9px] font-bold text-white leading-tight">Admin Reward</p>
                                          <p className="text-[7px] text-white/70 mt-0.5">{notif.reason}</p>
                                          <p className="text-[6px] font-mono text-white/30 mt-0.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleDismissAdminNotif(notif.id)}
                                        className="absolute top-2 right-2 text-[8px] text-white/30 hover:text-white/70 cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* User Details (Redirects to Profile) */}
          {!loading && user && (
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer bg-transparent border-none p-0 text-left outline-none"
            >
              <img
                src={avatarPreview || getAvatarUrl(user.email ?? "user")}
                alt="avatar"
                className="size-8 rounded-full border border-white/20 bg-white/10"
              />
              <span className="hidden text-sm font-medium text-white/80 sm:block">
                {displayName}
              </span>
            </button>
          )}
          
          <button
            onClick={handleSignOut}
            className="rounded-lg px-2 py-1 text-xs text-white/40 hover:bg-white/8 hover:text-white/70 transition cursor-pointer"
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

        {/* Glowing Gold Admin Coin Alerts Banner */}
        {adminNotifs.length > 0 && (
          <div className="mb-4 space-y-2">
            {adminNotifs.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-yellow-500/40 p-4 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-2xl animate-pulse">🪙</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-yellow-400 text-sm tracking-wide leading-tight">Focus Reward Granted!</p>
                    <p className="text-white/80 text-xs font-medium mt-0.5 leading-relaxed">
                      You received <span className="text-yellow-300 font-extrabold">{notif.amount}</span> focus coins from Admin
                    </p>
                    <p className="text-[10px] text-white/55 font-mono mt-1 font-semibold italic">"{notif.reason}"</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissAdminNotif(notif.id)}
                  className="relative z-10 p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer text-white/40 hover:text-white border-none bg-transparent"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        )}

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
            className="flex items-center gap-2.5 rounded-full bg-white/95 px-8 py-3.5 text-base font-semibold text-gray-800 shadow-2xl backdrop-blur cursor-pointer"
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

      {/* Warm-themed Premium Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#FAF8F5] text-[#4A3E3D] shadow-2xl border border-[#EBE7DF]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EBE7DF]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <h3 className="font-display text-lg font-bold tracking-wide">GoFocusGen Settings</h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full hover:bg-[#EBE7DF] transition cursor-pointer text-[#8C7A78] border-none bg-transparent"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Profile card */}
                <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#EBE7DF]">
                  <img
                    src={avatarPreview || getAvatarUrl(user?.email ?? "user")}
                    alt="avatar"
                    className="size-12 rounded-full border border-[#EBE7DF] bg-[#FAF8F5]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#4A3E3D] truncate">{displayName}</p>
                    <p className="text-xs text-[#8C7A78] truncate">{user?.email}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    Cadet
                  </span>
                </div>

                {/* Section: General */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono tracking-widest text-[#8C7A78] uppercase font-bold">Preferences</p>
                  <div className="space-y-2.5">
                    {/* Language Selection */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#EBE7DF]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌐</span>
                        <span className="text-sm font-semibold">App Language</span>
                      </div>
                      <select 
                        defaultValue="en"
                        className="text-xs bg-[#FAF8F5] border border-[#EBE7DF] rounded-lg px-2 py-1 outline-none text-[#4A3E3D] font-medium"
                      >
                        <option value="en">English (US)</option>
                        <option value="tr">Türkçe (TR)</option>
                        <option value="es">Español (ES)</option>
                        <option value="ja">日本語 (JP)</option>
                      </select>
                    </div>

                    {/* Sound Effects Switch */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#EBE7DF]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔊</span>
                        <span className="text-sm font-semibold">Sound Effects</span>
                      </div>
                      <button
                        onClick={toggleSoundEffects}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          soundEffectsEnabled ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            soundEffectsEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Focus Reminders Switch */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#EBE7DF]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔔</span>
                        <span className="text-sm font-semibold">Focus Reminders</span>
                      </div>
                      <button
                        onClick={toggleFocusReminders}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          focusRemindersEnabled ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            focusRemindersEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Support */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono tracking-widest text-[#8C7A78] uppercase font-bold">Support & Feedback</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={`mailto:gofocusgen@gmail.com?subject=%5BBug%20Report%5D%20GoFocusGen%20Cadet%20Alert&body=Pilot%20Details%3A%0D%0A-%20Name%3A%20${encodeURIComponent(displayName)}%0D%0A-%20Email%3A%20${encodeURIComponent(user?.email || "")}%0D%0A-%20Client%20Version%3A%20v1.2.0%0D%0A%0D%0APlease%20describe%20the%20bug%20and%20steps%20to%20reproduce%3A%0D%0A`}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-[#FAF8F5] transition cursor-pointer text-center text-xs font-semibold gap-1 text-[#4A3E3D]"
                    >
                      <span>🐛</span>
                      <span>Report Bug</span>
                    </a>
                    <a 
                      href={`mailto:gofocusgen@gmail.com?subject=%5BFeedback%5D%20GoFocusGen%20Cadet%20Review&body=Pilot%20Details%3A%0D%0A-%20Name%3A%20${encodeURIComponent(displayName)}%0D%0A-%20Email%3A%20${encodeURIComponent(user?.email || "")}%0D%0A%0D%0AShare%20your%20thoughts%20or%20ideas%20here%3A%0D%0A`}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-[#FAF8F5] transition cursor-pointer text-center text-xs font-semibold gap-1 text-[#4A3E3D]"
                    >
                      <span>💡</span>
                      <span>Share Feedback</span>
                    </a>
                    <a 
                      href={`mailto:gofocusgen@gmail.com?subject=%5BFeature%20Request%5D%20GoFocusGen%20Cabin%20Upgrade&body=Pilot%20Details%3A%0D%0A-%20Name%3A%20${encodeURIComponent(displayName)}%0D%0A-%20Email%3A%20${encodeURIComponent(user?.email || "")}%0D%0A%0D%0ADescribe%20the%20new%20feature%20or%20dashboard%20upgrade%20you%20want%3A%0D%0A`}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-[#FAF8F5] transition cursor-pointer text-center text-xs font-semibold gap-1 text-[#4A3E3D]"
                    >
                      <span>✨</span>
                      <span>Request Feature</span>
                    </a>
                    <a 
                      href="https://www.instagram.com/gofocusgen/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-[#EBE7DF] hover:bg-[#FAF8F5] transition cursor-pointer text-center text-xs font-semibold gap-1 text-[#4A3E3D]"
                    >
                      <span>📸</span>
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>

                {/* Section: About */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono tracking-widest text-[#8C7A78] uppercase font-bold">About Flight</p>
                  <div className="space-y-2.5">
                    {/* App Version */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#EBE7DF]">
                      <span className="text-sm font-semibold">App Version</span>
                      <span className="text-xs font-mono text-[#8C7A78]">v1.2.0</span>
                    </div>

                    {/* Referral Code */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3.5 border border-[#EBE7DF]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">Referral Code</span>
                        <span className="text-[10px] text-[#8C7A78]">Share with study buddies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-[#FAF8F5] border border-[#EBE7DF] px-2 py-1 rounded-md font-bold">
                          FLY-CADET-77
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("FLY-CADET-77");
                            alert("Referral code copied to clipboard!");
                          }}
                          className="p-1 rounded-md bg-[#FAF8F5] hover:bg-[#EBE7DF] border border-[#EBE7DF] transition cursor-pointer text-xs"
                          title="Copy referral code"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Account Actions */}
                <div className="pt-2 space-y-2">
                  <button 
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition cursor-pointer text-center font-bold text-sm tracking-wide"
                  >
                    Sign out of GoFocusGen
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Are you absolutely sure you want to delete your cadet profile? This action is permanent and cannot be undone.")) {
                        alert("Delete account request submitted to ground control.");
                      }
                    }}
                    className="w-full py-3 rounded-2xl hover:bg-red-50 text-red-600/60 hover:text-red-600 transition cursor-pointer text-center font-semibold text-xs"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
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
