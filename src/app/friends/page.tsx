"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { computePilotRank } from "@/lib/pilotRank";
import {
  Award,
  Sparkles,
  Plane,
  Globe,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  UserCheck,
  Edit3,
} from "lucide-react";

interface PublicUser {
  id: string;
  name: string | null;
  pilotId: string | null;
  avatarUrl: string | null;
  coins: number;
  age: string | null;
  studyTime: string | null;
  studyDuration: string | null;
  distractibility: string | null;
  callDistraction: string | null;
  friendshipStatus?: string;
  isOutgoingRequest?: boolean;
  isIncomingRequest?: boolean;
  totalHours?: number;
  currentStreak?: number;
  longestStreak?: number;
  badges?: Array<{
    badgeId: string;
    badge: {
      id: string;
      name: string;
      description: string;
      icon: string;
      requirement: string;
    };
  }>;
  sessionParticipants?: Array<{
    session: {
      originCode: string;
      destinationCode: string;
      duration: number;
      completedAt: string | null;
    }
  }>;
}

interface FriendshipData {
  friendshipId: string;
  status: string;
  createdAt: string;
  user: PublicUser;
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function getFriendRankAndBadges(user: PublicUser) {
  const flights = user.sessionParticipants || [];
  const completedFlightsCount = flights.length;
  const totalHours = user.totalHours || 0;

  const uniqueAirports = new Set<string>();
  let asiaRoutesCount = 0;
  let maxFlightDuration = 0;
  let hasRedEye = false;

  const ASIAN_AIRPORTS = new Set([
    "BLR", "DEL", "BOM", "HYD", "MAA", "CCU", "COK", "AMD", "GOI", "PNQ", "TRV", "BDQ", "CCJ", "COB", "GAU", "JAI", "LKO", "NAG", "PAT", "IXC", "IXJ", "SXR",
    "SIN", "BKK", "DMK", "HKT", "CNX", "KUL", "BKI", "PEN", "CGK", "DPS", "SUB", "SGN", "HAN", "DAD", "MNL", "CEB", "RGN", "PNH", "REP", "LPQ", "VTE", "BWN",
    "DXB", "AUH", "SHJ", "DOH", "MCT", "RUH", "JED", "DMM", "MED", "KWI", "BAH", "TLV", "AMM", "BEY", "MCT", "SLL", "THR", "IKA", "BGW", "EBL",
    "CMB", "DAC", "KTM", "MLE", "ISB", "LHE", "KHI", "TAS", "ALA", "NQZ", "FRU", "DYU", "ASB", "KBL",
    "IST", "SAW", "ESB", "AYT", "ADB", "NRT", "HND", "KIX", "ITM", "FUK", "CTS", "NGO", "OKA", "PEK", "PKX", "PVG", "SHA", "CAN", "SZX", "CTU", "KMG", "XIY", "HGH", "WUH", "HKG", "TPE", "TSA", "ICN", "GMP", "PUS", "CJU"
  ]);

  flights.forEach((f) => {
    const origin = f.session?.originCode || "";
    const dest = f.session?.destinationCode || "";
    const duration = f.session?.duration || 0;
    const completedAt = f.session?.completedAt || null;

    if (origin) uniqueAirports.add(origin);
    if (dest) uniqueAirports.add(dest);

    if (ASIAN_AIRPORTS.has(origin) || ASIAN_AIRPORTS.has(dest)) {
      asiaRoutesCount++;
    }

    if (duration > maxFlightDuration) {
      maxFlightDuration = duration;
    }

    if (completedAt) {
      const date = new Date(completedAt);
      const hour = date.getHours();
      if (hour >= 0 && hour <= 5) {
        hasRedEye = true;
      }
    }
  });

  const uniqueAirportsCount = uniqueAirports.size;
  const rank = computePilotRank(completedFlightsCount, totalHours, uniqueAirportsCount);

  // Unlocked Badges count
  const unlockedBadges: string[] = [];
  if (asiaRoutesCount >= 10) unlockedBadges.push("🕌");
  if (maxFlightDuration >= 480) unlockedBadges.push("🌊");
  if ((user.currentStreak || 0) >= 7 || (user.longestStreak || 0) >= 7) unlockedBadges.push("🔥");
  if (uniqueAirportsCount >= 15) unlockedBadges.push("🌍");
  if (hasRedEye) unlockedBadges.push("🦉");

  // Include custom database badges (granted via table editor or auto-grant)
  if (user.badges && Array.isArray(user.badges)) {
    user.badges.forEach((ub: any) => {
      const icon = ub.badge?.icon;
      if (icon && !["silk_road", "transatlantic", "frequent_flyer", "around_the_world", "red_eye"].includes(ub.badgeId) && !unlockedBadges.includes(icon)) {
        unlockedBadges.push(icon);
      }
    });
  }

  return { rank, unlockedBadges, completedFlightsCount, uniqueAirportsCount };
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<"crew" | "add" | "requests">("crew");
  const [friends, setFriends] = useState<FriendshipData[]>([]);
  const [incoming, setIncoming] = useState<FriendshipData[]>([]);
  const [outgoing, setOutgoing] = useState<FriendshipData[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Nicknames & Modal Edit state
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState("");

  // Modal state
  const [selectedFriend, setSelectedFriend] = useState<PublicUser | null>(null);

  // Load custom local nicknames on mount
  useEffect(() => {
    const saved = localStorage.getItem("gofocusgen_friend_nicknames");
    if (saved) {
      try {
        setNicknames(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleSaveNickname = (userId: string, newName: string) => {
    const updated = { ...nicknames, [userId]: newName.trim() };
    setNicknames(updated);
    localStorage.setItem("gofocusgen_friend_nicknames", JSON.stringify(updated));
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends/request");
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      }
    } catch (err) {
      console.error("Failed to load friends:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/friends/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        // Refresh local lists and update search result button
        fetchFriendsData();
        setSearchResults((prev) =>
          prev.map((u) =>
            u.id === receiverId
              ? { ...u, friendshipStatus: "PENDING", isOutgoingRequest: true }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  };

  const acceptFriendRequest = async (senderId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });

      if (res.ok) {
        fetchFriendsData();
      }
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  const removeFriendship = async (otherUserId: string) => {
    const confirmDelete = confirm("Are you sure you want to remove this relationship?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/friends/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId }),
      });

      if (res.ok) {
        fetchFriendsData();
        // Update search results status back to NONE if user is currently searched
        setSearchResults((prev) =>
          prev.map((u) =>
            u.id === otherUserId
              ? { ...u, friendshipStatus: "NONE", isOutgoingRequest: false, isIncomingRequest: false }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Failed to remove friendship:", err);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0f1e] text-white">
      {/* Space glow backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1a35] to-[#0a1628]" />
      <div className="absolute top-[-10%] left-[-10%] size-[60vw] rounded-full bg-electric-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[60vw] rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition">
          <span>←</span>
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <h1 className="font-display text-lg font-bold tracking-wider text-white">FLIGHT CREW</h1>
        <div className="w-16" /> {/* spacer */}
      </header>

      <div className="relative z-20 mx-auto w-full max-w-lg flex-1 px-4 pb-32">
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("crew")}
            className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "crew"
                ? "bg-white/15 text-white shadow-md border border-white/10"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            My Crew ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "add"
                ? "bg-white/15 text-white shadow-md border border-white/10"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Add Pilot
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`relative flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
              activeTab === "requests"
                ? "bg-white/15 text-white shadow-md border border-white/10"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Inbox
            {incoming.length > 0 && (
              <span className="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-100 bg-red-500 rounded-full">
                {incoming.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-electric-400 border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "crew" && (
              <motion.div
                key="crew"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {friends.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                    <span className="text-4xl">👥</span>
                    <h3 className="mt-3 text-lg font-bold">No Wingmen Yet</h3>
                    <p className="mt-1 text-sm text-white/50">
                      Co-pilots make the focus journey better! Search and add other study pilots to build your crew.
                    </p>
                    <button
                      onClick={() => setActiveTab("add")}
                      className="mt-4 rounded-xl bg-electric-500/20 border border-electric-400/40 px-4 py-2 text-xs font-semibold text-electric-400 hover:bg-electric-500/30 transition"
                    >
                      Search Pilots
                    </button>
                  </div>
                ) : (
                  friends.map((f) => {
                    const nickname = nicknames[f.user.id];
                    const displayName = nickname || f.user.name || "Unknown Pilot";
                    const { rank, unlockedBadges } = getFriendRankAndBadges(f.user);

                    return (
                      <div
                        key={f.friendshipId}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-white/20 transition"
                      >
                        <img
                          src={getAvatarUrl(f.user.name || "pilot")}
                          alt={f.user.name || "avatar"}
                          className="size-12 rounded-full border border-white/10 bg-white/5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {displayName}
                            </span>
                            {nickname && (
                              <span className="text-[10px] text-white/40 truncate font-mono">
                                ({f.user.name})
                              </span>
                            )}
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              🪙 {f.user.coins}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-white/50">
                            <span className="font-mono text-neon-400 text-[10px] flex items-center gap-0.5">
                              <span>{rank.icon}</span> <span>{rank.name}</span>
                            </span>
                            {unlockedBadges.length > 0 && (
                              <span className="text-[10px] tracking-wide flex items-center">
                                • <span className="ml-1">{unlockedBadges.join("")}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedFriend(f.user);
                              setIsEditingNickname(false);
                            }}
                            className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition flex items-center gap-1 cursor-pointer"
                            title="View Onboarding Manifest"
                          >
                            Manifest 📋
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {activeTab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by Name or Pilot ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-electric-400 focus:outline-none backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="rounded-2xl bg-electric-500 px-5 text-sm font-semibold text-white hover:bg-electric-600 transition disabled:opacity-50"
                  >
                    {isSearching ? "Searching..." : "Search"}
                  </button>
                </form>

                {/* Search Results */}
                <div className="space-y-3">
                  {searchResults.length === 0 && searchQuery && !isSearching && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm text-white/50 text-sm">
                      No pilots found matching "{searchQuery}"
                    </div>
                  )}

                  {searchResults.map((u) => {
                    const { rank, unlockedBadges } = getFriendRankAndBadges(u);
                    
                    return (
                      <div
                        key={u.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                      >
                        <img
                          src={getAvatarUrl(u.name || "pilot")}
                          alt={u.name || "avatar"}
                          className="size-12 rounded-full border border-white/10 bg-white/5"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {u.name || "Unknown Pilot"}
                            </span>
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              🪙 {u.coins}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] font-mono text-white/40">
                            <span className="text-neon-400">@{u.pilotId || "noid"}</span>
                            <span>•</span>
                            <span className="text-electric-400 flex items-center gap-0.5">
                              <span>{rank.icon}</span> <span>{rank.name}</span>
                            </span>
                            {unlockedBadges.length > 0 && (
                              <span className="flex items-center">
                                • <span className="ml-1">{unlockedBadges.join("")}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {u.friendshipStatus === "ACCEPTED" ? (
                          <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400">
                            Active Crew
                          </span>
                        ) : u.friendshipStatus === "PENDING" ? (
                          u.isOutgoingRequest ? (
                            <button
                              onClick={() => removeFriendship(u.id)}
                              className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition cursor-pointer"
                              title="Cancel Request"
                            >
                              Requested ⏳
                            </button>
                          ) : (
                            <button
                              onClick={() => acceptFriendRequest(u.id)}
                              className="rounded-xl bg-electric-500 px-3 py-2 text-xs font-semibold text-white hover:bg-electric-600 transition cursor-pointer"
                            >
                              Accept Request
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(u.id)}
                            className="rounded-xl bg-electric-500/20 border border-electric-400/40 px-3.5 py-2 text-xs font-semibold text-electric-400 hover:bg-electric-500/30 transition cursor-pointer"
                          >
                            Add Wingman
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "requests" && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Incoming Requests */}
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
                    Incoming Requests ({incoming.length})
                  </h3>
                  <div className="space-y-3">
                    {incoming.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm text-white/30 text-sm">
                        No pending incoming requests
                      </div>
                    ) : (
                      incoming.map((f) => {
                        const { rank, unlockedBadges } = getFriendRankAndBadges(f.user);
                        return (
                          <div
                            key={f.friendshipId}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                          >
                            <img
                              src={getAvatarUrl(f.user.name || "pilot")}
                              alt={f.user.name || "avatar"}
                              className="size-12 rounded-full border border-white/10 bg-white/5"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white truncate">
                                  {f.user.name || "Unknown Pilot"}
                                </span>
                                <span className="rounded bg-electric-500/10 border border-electric-400/20 px-1.5 py-0.5 text-[10px] font-medium text-electric-400">
                                  🪙 {f.user.coins}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] font-mono text-white/40">
                                <span className="text-neon-400">@{f.user.pilotId || "noid"}</span>
                                <span>•</span>
                                <span className="text-electric-400 flex items-center gap-0.5">
                                  <span>{rank.icon}</span> <span>{rank.name}</span>
                                </span>
                                {unlockedBadges.length > 0 && (
                                  <span className="flex items-center">
                                    • <span className="ml-1">{unlockedBadges.join("")}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => acceptFriendRequest(f.user.id)}
                                className="rounded-xl bg-electric-500 px-3 py-2 text-xs font-semibold text-white hover:bg-electric-600 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => removeFriendship(f.user.id)}
                                className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition"
                              >
                                Ignore
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Outgoing Requests */}
                <div>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
                    Sent Pending Requests ({outgoing.length})
                  </h3>
                  <div className="space-y-3">
                    {outgoing.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm text-white/30 text-sm">
                        No pending sent requests
                      </div>
                    ) : (
                      outgoing.map((f) => {
                        const { rank, unlockedBadges } = getFriendRankAndBadges(f.user);
                        return (
                          <div
                            key={f.friendshipId}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                          >
                            <img
                              src={getAvatarUrl(f.user.name || "pilot")}
                              alt={f.user.name || "avatar"}
                              className="size-12 rounded-full border border-white/10 bg-white/5"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-white truncate">
                                {f.user.name || "Unknown Pilot"}
                              </span>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] font-mono text-white/40">
                                <span className="text-neon-400">@{f.user.pilotId || "noid"}</span>
                                <span>•</span>
                                <span className="text-electric-400 flex items-center gap-0.5">
                                  <span>{rank.icon}</span> <span>{rank.name}</span>
                                </span>
                                {unlockedBadges.length > 0 && (
                                  <span className="flex items-center">
                                    • <span className="ml-1">{unlockedBadges.join("")}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFriendship(f.user.id)}
                              className="rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-semibold hover:bg-white/15 transition"
                            >
                              Cancel Request
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Profile/Manifest Popup Modal */}
      <AnimatePresence>
        {selectedFriend && (() => {
          const friendNickname = nicknames[selectedFriend.id];
          const displayName = friendNickname || selectedFriend.name || "Unknown Pilot";
          const { rank, unlockedBadges, completedFlightsCount, uniqueAirportsCount } = getFriendRankAndBadges(selectedFriend);

          // Construct badge list for friend
          const friendBadges = [
            { id: "silk_road", name: "Silk Road Scholar", icon: "🕌", unlocked: unlockedBadges.includes("🕌") },
            { id: "transatlantic", name: "Transatlantic Grind", icon: "🌊", unlocked: unlockedBadges.includes("🌊") },
            { id: "frequent_flyer", name: "Frequent Flyer", icon: "🔥", unlocked: unlockedBadges.includes("🔥") },
            { id: "around_the_world", name: "Around The World", icon: "🌍", unlocked: unlockedBadges.includes("🌍") },
            { id: "red_eye", name: "Red-Eye Warrior", icon: "🦉", unlocked: unlockedBadges.includes("🦉") },
          ];

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm overflow-y-auto py-10"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-[#0f172a] shadow-2xl max-h-[90vh] flex flex-col"
              >
                {/* Glow header overlay */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-electric-500/20 to-transparent pointer-events-none" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="absolute top-4 right-4 z-10 size-8 flex items-center justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition cursor-pointer animate-pulse"
                >
                  ✕
                </button>

                <div className="relative p-6 pt-8 flex-1 overflow-y-auto space-y-5">
                  {/* Avatar & Identifiers */}
                  <div className="flex flex-col items-center">
                    <img
                      src={getAvatarUrl(selectedFriend.name || "pilot")}
                      alt="avatar"
                      className="size-20 rounded-full border-2 border-electric-400 bg-white/5 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    />

                    {/* Nickname & Name details */}
                    <div className="mt-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <h2 className="text-xl font-bold tracking-wide">
                          {displayName}
                        </h2>
                        
                        {!isEditingNickname && (
                          <button
                            onClick={() => {
                              setTempNickname(friendNickname || "");
                              setIsEditingNickname(true);
                            }}
                            className="text-xs text-white/40 hover:text-white transition cursor-pointer"
                            title="Edit Nickname"
                          >
                            ✏️
                          </button>
                        )}
                      </div>

                      {friendNickname && (
                        <p className="text-xs text-white/40 mt-0.5">
                          Real Name: {selectedFriend.name}
                        </p>
                      )}

                      {isEditingNickname ? (
                        <div className="flex items-center justify-center gap-1.5 mt-2 bg-white/5 p-2 rounded-xl border border-white/10">
                          <input
                            type="text"
                            value={tempNickname}
                            onChange={(e) => setTempNickname(e.target.value)}
                            className="bg-[#0c1220] border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none w-36 text-center"
                            placeholder="Set nickname"
                            maxLength={16}
                          />
                          <button
                            onClick={() => {
                              handleSaveNickname(selectedFriend.id, tempNickname);
                              setIsEditingNickname(false);
                            }}
                            className="bg-electric-500 hover:bg-electric-600 px-2.5 py-1 rounded-lg text-xs text-white font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditingNickname(false)}
                            className="text-white/40 text-xs px-1 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-neon-400 mt-0.5">
                          @{selectedFriend.pilotId || "noid"}
                        </p>
                      )}
                    </div>

                    {/* Coins details */}
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
                      <span>🪙</span>
                      <span>{selectedFriend.coins} focus coins</span>
                    </div>
                  </div>

                  <div className="w-full border-t border-white/10 my-4" />

                  {/* 1. Aviation Rank Progression Card */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-electric-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                        {rank.icon}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-electric-400 block">Co-Pilot Rank</span>
                        <h4 className="text-sm font-bold text-white tracking-wide">{rank.name}</h4>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-white/60 leading-relaxed">{rank.desc}</p>
                    <p className="text-[10px] text-white/30 font-mono">Completed: {completedFlightsCount} flights • {Math.round(selectedFriend.totalHours || 0)} focus hours</p>
                  </div>

                  {/* 2. Badges Showcase Case */}
                  <div className="space-y-2.5">
                    <h3 className="text-center font-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Badge Cabinet
                    </h3>

                    <div className="grid grid-cols-5 gap-2">
                      {friendBadges.map((b) => (
                        <div
                          key={b.id}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center relative aspect-square transition ${
                            b.unlocked
                              ? "bg-purple-500/10 border-purple-500/30 text-white shadow-inner shadow-purple-500/5"
                              : "bg-white/[0.01] border-white/5 opacity-30 grayscale"
                          }`}
                          title={`${b.name}: ${b.unlocked ? "Earned ⭐" : "Locked"}`}
                        >
                          <span className="text-2xl">{b.icon}</span>
                          {b.unlocked && (
                            <span className="absolute top-0.5 right-0.5 text-[6px] text-amber-400">⭐</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Flight Onboarding Manifest details */}
                  <div className="space-y-2.5">
                    <h3 className="text-center font-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Flight Onboarding Manifest
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                        <p className="text-[9px] font-semibold text-white/40 uppercase">Pilot Age</p>
                        <p className="mt-0.5 text-xs font-medium">{selectedFriend.age || "21"} yrs</p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                        <p className="text-[9px] font-semibold text-white/40 uppercase">Study Hours</p>
                        <p className="mt-0.5 text-xs font-medium">{selectedFriend.studyTime || "Flexible"}</p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                        <p className="text-[9px] font-semibold text-white/40 uppercase">Avg Flight Time</p>
                        <p className="mt-0.5 text-xs font-medium">{selectedFriend.studyDuration || "Flexible"}</p>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                        <p className="text-[9px] font-semibold text-white/40 uppercase">Distractibility</p>
                        <p className="mt-0.5 text-xs font-medium capitalize">{selectedFriend.distractibility || "Medium"}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[9px] font-semibold text-white/40 uppercase">Call Distractions</p>
                      <p className="mt-0.5 text-xs font-medium">{selectedFriend.callDistraction || "Flexible"}</p>
                    </div>
                  </div>

                  {/* 4. Remove Friend Option (Placed at the very end to prevent easy deletion) */}
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        removeFriendship(selectedFriend.id);
                        setSelectedFriend(null);
                      }}
                      className="w-full py-2.5 rounded-2xl bg-red-950/20 hover:bg-red-900/40 border border-red-500/10 hover:border-red-500/30 text-red-400/40 hover:text-red-400 transition text-xs font-semibold uppercase tracking-wider cursor-pointer text-center"
                    >
                      Remove Co-Pilot ❌
                    </button>
                    
                    <button
                      onClick={() => setSelectedFriend(null)}
                      className="w-full rounded-2xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition cursor-pointer text-center"
                    >
                      Close Manifest
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Bottom Nav Menu */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 pb-8 pt-4">
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
            item.href === "/friends"
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
