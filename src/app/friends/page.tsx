"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
  
  // Modal state
  const [selectedFriend, setSelectedFriend] = useState<PublicUser | null>(null);

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
                  friends.map((f) => (
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
                            {f.user.name || "Unknown Pilot"}
                          </span>
                          <span className="rounded bg-electric-500/10 border border-electric-400/20 px-1.5 py-0.5 text-[10px] font-medium text-electric-400">
                            🪙 {f.user.coins}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate">
                          @{f.user.pilotId || "noid"}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedFriend(f.user)}
                          className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15 transition"
                          title="View Onboarding Manifest"
                        >
                          Manifest 📋
                        </button>
                        <button
                          onClick={() => removeFriendship(f.user.id)}
                          className="rounded-xl bg-red-500/15 border border-red-500/30 p-2 text-xs font-semibold text-red-400 hover:bg-red-500/25 transition"
                          title="Remove Friend"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))
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

                  {searchResults.map((u) => (
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
                          <span className="rounded bg-electric-500/10 border border-electric-400/20 px-1.5 py-0.5 text-[10px] font-medium text-electric-400">
                            🪙 {u.coins}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate">
                          @{u.pilotId || "noid"}
                        </p>
                      </div>

                      {u.friendshipStatus === "ACCEPTED" ? (
                        <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400">
                          Active Crew
                        </span>
                      ) : u.friendshipStatus === "PENDING" ? (
                        u.isOutgoingRequest ? (
                          <button
                            onClick={() => removeFriendship(u.id)}
                            className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/20 transition"
                            title="Cancel Request"
                          >
                            Requested ⏳
                          </button>
                        ) : (
                          <button
                            onClick={() => acceptFriendRequest(u.id)}
                            className="rounded-xl bg-electric-500 px-3 py-2 text-xs font-semibold text-white hover:bg-electric-600 transition"
                          >
                            Accept Request
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(u.id)}
                          className="rounded-xl bg-electric-500/20 border border-electric-400/40 px-3.5 py-2 text-xs font-semibold text-electric-400 hover:bg-electric-500/30 transition"
                        >
                          Add Wingman
                        </button>
                      )}
                    </div>
                  ))}
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
                      incoming.map((f) => (
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
                            <p className="text-xs text-white/50 truncate">
                              @{f.user.pilotId || "noid"}
                            </p>
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
                      ))
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
                      outgoing.map((f) => (
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
                            <p className="text-xs text-white/50 truncate">
                              @{f.user.pilotId || "noid"}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFriendship(f.user.id)}
                            className="rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-xs font-semibold hover:bg-white/15 transition"
                          >
                            Cancel Request
                          </button>
                        </div>
                      ))
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
        {selectedFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-[#0f172a] shadow-2xl"
            >
              {/* Glow header overlay */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-electric-500/20 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedFriend(null)}
                className="absolute top-4 right-4 z-10 size-8 flex items-center justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>

              <div className="relative p-6 pt-8 flex flex-col items-center">
                {/* Avatar */}
                <img
                  src={getAvatarUrl(selectedFriend.name || "pilot")}
                  alt="avatar"
                  className="size-20 rounded-full border-2 border-electric-400 bg-white/5 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                />

                {/* Name details */}
                <h2 className="mt-4 text-xl font-bold tracking-wide">
                  {selectedFriend.name || "Unknown Pilot"}
                </h2>
                <p className="text-sm font-mono text-electric-400">
                  @{selectedFriend.pilotId || "noid"}
                </p>

                {/* Coins details */}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-sm font-semibold text-yellow-400">
                  <span>🪙</span>
                  <span>{selectedFriend.coins} focus coins</span>
                </div>

                <div className="w-full border-t border-white/10 my-6" />

                {/* Flight Onboarding Manifest details */}
                <div className="w-full space-y-4">
                  <h3 className="text-center font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Flight Onboarding Manifest
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] font-semibold text-white/40 uppercase">Pilot Age</p>
                      <p className="mt-0.5 text-sm font-medium">{selectedFriend.age || "21"} yrs</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] font-semibold text-white/40 uppercase">Study Hours</p>
                      <p className="mt-0.5 text-sm font-medium">{selectedFriend.studyTime || "Flexible"}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] font-semibold text-white/40 uppercase">Avg Flight Time</p>
                      <p className="mt-0.5 text-sm font-medium">{selectedFriend.studyDuration || "Flexible"}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                      <p className="text-[10px] font-semibold text-white/40 uppercase">Distractibility</p>
                      <p className="mt-0.5 text-sm font-medium capitalize">{selectedFriend.distractibility || "Medium"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5">
                    <p className="text-[10px] font-semibold text-white/40 uppercase">Call Distractions</p>
                    <p className="mt-0.5 text-sm font-medium">{selectedFriend.callDistraction || "Flexible"}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFriend(null)}
                  className="mt-6 w-full rounded-2xl bg-electric-500 py-3 text-sm font-semibold text-white hover:bg-electric-600 transition"
                >
                  Close Manifest
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
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
