"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Shield,
  Coins,
  Globe,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plane,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Share2,
  Copy
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { computePilotRank } from "@/lib/pilotRank";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface BadgeDetails {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: string;
  };
}

interface PilotProfile {
  id: string;
  name: string;
  pilotId?: string;
  avatarUrl?: string;
  coins: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  age?: string;
  studyTime?: string;
  studyDuration?: string;
  distractibility?: string;
  callDistraction?: string;
  badges: BadgeDetails[];
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

// ─── Aircraft UI Themes ────────────────────────────────────────────────────────
const AIRCRAFT_THEMES: Record<string, {
  gradient: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  badgeStyle: string;
  selectedStyle: string;
  tagline: string;
  icon: string;
  techLabel: string;
}> = {
  a380: {
    gradient: "from-yellow-900/40 via-amber-950/30 to-yellow-950/20",
    accentColor: "#f59e0b",
    borderColor: "border-amber-500/40",
    glowColor: "shadow-amber-500/20",
    badgeStyle: "bg-amber-500/10 border-amber-400/40 text-amber-300",
    selectedStyle: "bg-gradient-to-br from-amber-900/30 to-amber-950/10 border-amber-400/50 shadow-amber-500/10",
    tagline: "⚜️ Superjumbo Class",
    icon: "🛬",
    techLabel: "QUAD TURBOFAN",
  },
  b777: {
    gradient: "from-blue-900/40 via-blue-950/30 to-slate-950/20",
    accentColor: "#3b82f6",
    borderColor: "border-blue-500/40",
    glowColor: "shadow-blue-500/20",
    badgeStyle: "bg-blue-500/10 border-blue-400/40 text-blue-300",
    selectedStyle: "bg-gradient-to-br from-blue-900/30 to-blue-950/10 border-blue-400/50 shadow-blue-500/10",
    tagline: "🌐 Long-Haul Legend",
    icon: "✈️",
    techLabel: "TWIN GE90",
  },
  a350: {
    gradient: "from-teal-900/40 via-emerald-950/30 to-teal-950/20",
    accentColor: "#14b8a6",
    borderColor: "border-teal-500/40",
    glowColor: "shadow-teal-500/20",
    badgeStyle: "bg-teal-500/10 border-teal-400/40 text-teal-300",
    selectedStyle: "bg-gradient-to-br from-teal-900/30 to-teal-950/10 border-teal-400/50 shadow-teal-500/10",
    tagline: "🌿 Carbon Composite Next-Gen",
    icon: "🛩️",
    techLabel: "TRENT XWB",
  },
  b787: {
    gradient: "from-purple-900/40 via-violet-950/30 to-purple-950/20",
    accentColor: "#a855f7",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    badgeStyle: "bg-purple-500/10 border-purple-400/40 text-purple-300",
    selectedStyle: "bg-gradient-to-br from-purple-900/30 to-purple-950/10 border-purple-400/50 shadow-purple-500/10",
    tagline: "✨ Dreamliner Holographic",
    icon: "🌙",
    techLabel: "GENX TWIN",
  },
};

const AIRLINES = [
  { id: "emirates", name: "Emirates", abbrev: "AE", cost: 800, hslColor: "hsl(0, 100%, 60%)", code: "EK", color: "from-red-600/30 to-red-950/20" },
  { id: "singapore", name: "Singapore Airlines", abbrev: "SG", cost: 650, hslColor: "hsl(45, 100%, 55%)", code: "SQ", color: "from-amber-500/30 to-amber-950/20" },
  { id: "qatar", name: "Qatar Airways", abbrev: "QA", cost: 550, hslColor: "hsl(330, 80%, 50%)", code: "QR", color: "from-rose-800/30 to-rose-950/20" },
  { id: "airindia", name: "Air India", abbrev: "IN", cost: 300, hslColor: "hsl(20, 100%, 60%)", code: "AI", color: "from-orange-500/30 to-orange-950/20" },
  { id: "indigo", name: "IndiGo", abbrev: "6E", cost: 0, hslColor: "hsl(215, 100%, 60%)", code: "6E", color: "from-blue-600/30 to-blue-950/20" },
];

const CABIN_CLASSES = [
  { id: "first", name: "First Class Suite", desc: "Row 1 · seats A-B", cost: 500 },
  { id: "business", name: "Business Class", desc: "Row 4–8 · seats A-F", cost: 300 },
  { id: "premium", name: "Premium Economy", desc: "Row 12–16 · seats A-F", cost: 150 },
  { id: "economy", name: "Economy Class", desc: "Row 24–38 · seats A-F", cost: 0 },
];

const AIRCRAFT_MODELS = [
  { id: "a380", name: "Airbus A380 Superjumbo", highlight: "World's largest passenger aircraft" },
  { id: "b777", name: "Boeing 777-300ER Prestige", highlight: "World's most powerful twin-engine" },
  { id: "a350", name: "Airbus A350-1000 XWB", highlight: "Lower cabin altitude for wellbeing" },
  { id: "b787", name: "Boeing 787 Dreamliner", highlight: "Electrochromic dimmable windows" },
];

export default function LicenseClient({ id }: { id: string }) {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [pilot, setPilot] = useState<PilotProfile | null>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState("NONE");
  
  const [currentPassportPage, setCurrentPassportPage] = useState(0);
  const [currentLogPage, setCurrentLogPage] = useState(0);
  const [selectedFlightForPass, setSelectedFlightForPass] = useState<any | null>(null);
  
  const [buddyLoading, setBuddyLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const searchParams = useSearchParams();
  const flightParam = searchParams?.get("flight");

  useEffect(() => {
    if (flights.length > 0 && flightParam) {
      const match = flights.find(f => f.sessionId === flightParam || f.id === flightParam);
      if (match) {
        setSelectedFlightForPass(match);
      }
    }
  }, [flights, flightParam]);

  useEffect(() => {
    async function loadPilotProfile() {
      try {
        const res = await fetch(`/api/user/profile/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPilot(data.profile);
            setFlights(data.flights);
            setRelationshipStatus(data.relationshipStatus);
          } else {
            setFeedback({ type: "error", text: "Failed to load pilot data" });
          }
        } else {
          setFeedback({ type: "error", text: "Pilot license not found in database" });
        }
      } catch (err) {
        setFeedback({ type: "error", text: "Error loading space profile license" });
      } finally {
        setLoading(false);
      }
    }
    loadPilotProfile();
  }, [id]);

  const handleCopyLicenseLink = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/profile/license/${pilot?.pilotId || pilot?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setFeedback({ type: "success", text: "Pilot License link copied to clipboard! 📋" });
    setTimeout(() => {
      setCopiedLink(false);
      setFeedback(null);
    }, 3000);
  };

  const handleAddBuddy = async () => {
    if (!pilot || buddyLoading) return;
    setBuddyLoading(true);

    try {
      if (relationshipStatus === "PENDING_RECEIVED") {
        // Accept buddy request
        const res = await fetch("/api/friends/request", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderId: pilot.id }),
        });
        if (res.ok) {
          setRelationshipStatus("ACCEPTED");
          setFeedback({ type: "success", text: `Buddy request from ${pilot.name} accepted! 🛡️` });
        }
      } else if (relationshipStatus === "NONE") {
        // Send buddy request
        const res = await fetch("/api/friends/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: pilot.id }),
        });
        if (res.ok) {
          setRelationshipStatus("PENDING_SENT");
          setFeedback({ type: "success", text: `Buddy request sent to ${pilot.name}! ⏳` });
        }
      }
    } catch (e) {
      setFeedback({ type: "error", text: "Failed to process buddy request" });
    } finally {
      setBuddyLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white">
        <span className="size-10 rounded-full border-2 border-electric-400 border-t-transparent animate-spin" />
        <p className="mt-4 text-white/50 text-sm font-mono tracking-wider">RETRIEVING PILOT CREDENTIALS...</p>
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#050a17] text-white p-4">
        <AlertTriangle className="size-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="font-['Space_Grotesk',system-ui] text-2xl font-black text-white">License Not Found</h2>
        <p className="text-sm text-white/50 mt-2 max-w-sm text-center">
          The requested pilot call sign or credentials do not exist on GoFocusGen Space Command.
        </p>
        <Link href="/dashboard" className="mt-6 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase transition">
          Return to Cockpit
        </Link>
      </div>
    );
  }

  // --- Aviation Ranks & Achievements Computations ---
  const ASIAN_AIRPORTS = new Set([
    "BLR", "DEL", "BOM", "HYD", "MAA", "CCU", "COK", "AMD", "GOI", "PNQ", "TRV", "BDQ", "CCJ", "COB", "GAU", "JAI", "LKO", "NAG", "PAT", "IXC", "IXJ", "SXR",
    "SIN", "BKK", "DMK", "HKT", "CNX", "KUL", "BKI", "PEN", "CGK", "DPS", "SUB", "SGN", "HAN", "DAD", "MNL", "CEB", "RGN", "PNH", "REP", "LPQ", "VTE", "BWN",
    "DXB", "AUH", "SHJ", "DOH", "MCT", "RUH", "JED", "DMM", "MED", "KWI", "BAH", "TLV", "AMM", "BEY", "MCT", "SLL", "THR", "IKA", "BGW", "EBL",
    "CMB", "DAC", "KTM", "MLE", "ISB", "LHE", "KHI", "TAS", "ALA", "NQZ", "FRU", "DYU", "ASB", "KBL",
    "IST", "SAW", "ESB", "AYT", "ADB", "NRT", "HND", "KIX", "ITM", "FUK", "CTS", "NGO", "OKA", "PEK", "PKX", "PVG", "SHA", "CAN", "SZX", "CTU", "KMG", "XIY", "HGH", "WUH", "HKG", "TPE", "TSA", "ICN", "GMP", "PUS", "CJU"
  ]);

  const uniqueAirports = new Set<string>();
  let asiaRoutesCount = 0;
  let maxFlightDuration = 0;
  let hasRedEye = false;

  flights.forEach((f) => {
    const origin = f.session?.originCode || "";
    const dest = f.session?.destinationCode || "";
    const duration = f.session?.duration || 0;
    const completedAt = f.session?.completedAt || f.joinedAt;

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
  const completedFlightsCount = flights.length;
  
  const rankInfo = computePilotRank(completedFlightsCount, pilot.totalHours, uniqueAirportsCount);

  // Badge list definitions
  const badgesData = [
    { id: "silk_road", name: "Silk Road Scholar", icon: "🕌", desc: "Complete 10 study flights to or from Asian destinations.", unlocked: asiaRoutesCount >= 10 },
    { id: "transatlantic", name: "Transatlantic Grind", icon: "🌊", desc: "Complete a continuous cruise session of 8 hours or more.", unlocked: maxFlightDuration >= 480 },
    { id: "frequent_flyer", name: "Frequent Flyer", icon: "🔥", desc: "Maintain an active focus study streak of 7 days or more.", unlocked: pilot.currentStreak >= 7 || pilot.longestStreak >= 7 },
    { id: "around_the_world", name: "Around The World", icon: "🌍", desc: "Explore the globe by studying in 15 or more unique airports.", unlocked: uniqueAirportsCount >= 15 },
    { id: "red_eye", name: "Red-Eye Warrior", icon: "🦉", desc: "Navigate through the dark hours by landing a study run between 00:00 and 05:00 AM.", unlocked: hasRedEye },
  ];

  const customDbBadges = pilot.badges.filter(
    (dbB) => !["silk_road", "transatlantic", "frequent_flyer", "around_the_world", "red_eye"].includes(dbB.badge.id)
  );

  const allBadgesToDisplay = [
    ...badgesData.map((b) => ({
      ...b,
      color: b.unlocked 
        ? "from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30" 
        : "from-white/2 to-white/1 text-white/20 border-white/5"
    })),
    ...customDbBadges.map((dbB) => ({
      id: dbB.badge.id,
      name: dbB.badge.name,
      icon: dbB.badge.icon,
      desc: dbB.badge.description,
      unlocked: true,
      color: "from-[#00c8a0]/20 to-teal-500/20 text-[#00c8a0] border-[#00c8a0]/30 shadow-[#00c8a0]/10",
    })),
  ];

  // Pagination for Passport Stamps
  const stampsPerPage = 4;
  const totalStampsPages = Math.max(1, Math.ceil(flights.length / stampsPerPage));
  const displayedFlights = flights.slice(currentPassportPage * stampsPerPage, (currentPassportPage + 1) * stampsPerPage);

  // Pagination for Closet
  const logsPerPage = 4;
  const totalLogPages = Math.max(1, Math.ceil(flights.length / logsPerPage));
  const displayedLogs = flights.slice(currentLogPage * logsPerPage, (currentLogPage + 1) * logsPerPage);

  return (
    <main className="relative flex min-h-screen flex-col overflow-y-auto bg-navy-950 pb-32">
      {/* Immersive space background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a17] via-[#0b162b] to-[#050a17]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06)_0%,transparent_60%)]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-6 pb-4 max-w-4xl mx-auto w-full">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition">
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <span className="font-display text-sm font-mono tracking-widest text-[#00c8a0] bg-[#00c8a0]/10 px-3 py-1 rounded-full border border-[#00c8a0]/30 font-bold uppercase">
          💫 verified space pilot license
        </span>
        <div className="w-10" />
      </header>

      <div className="relative z-20 mx-auto w-full max-w-4xl px-4 flex-1 mt-4">
        {/* Feedback Alert */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {feedback.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertTriangle className="size-5 shrink-0" />}
              <span className="text-sm font-medium">{feedback.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* License Hero Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilot Credentials (Left Panel) */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-indigo-500" />
              
              <div className="mx-auto size-24 rounded-full border-2 border-emerald-500/40 p-1 bg-navy-900/60 overflow-hidden shadow-lg shadow-emerald-500/5">
                <img
                  src={pilot.avatarUrl || getAvatarUrl(pilot.name || "pilot")}
                  alt="avatar"
                  className="size-full rounded-full object-cover"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-white truncate">{pilot.name || "Anonymous Pilot"}</h2>
              {pilot.pilotId ? (
                <p className="text-xs font-mono text-emerald-400 mt-0.5 tracking-wider">@{pilot.pilotId}</p>
              ) : (
                <p className="text-[10px] font-mono text-white/30 uppercase mt-0.5 tracking-widest">Unregistered Callsign</p>
              )}

              <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-amber-300 font-bold text-xs">
                  <Coins className="size-4" />
                  <span>{pilot.coins.toLocaleString()} Coins</span>
                </div>

                {/* Dynamic Buddy Status CTA */}
                {relationshipStatus === "SELF" ? (
                  <Link href="/profile" className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5">
                    <User className="size-3.5" /> Edit My License
                  </Link>
                ) : relationshipStatus === "ACCEPTED" ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5 select-none">
                    <Check className="size-3.5" /> verified pilot buddy
                  </div>
                ) : relationshipStatus === "PENDING_SENT" ? (
                  <div className="w-full py-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 select-none animate-pulse">
                    ⏳ Request Pending...
                  </div>
                ) : relationshipStatus === "PENDING_RECEIVED" ? (
                  <button
                    onClick={handleAddBuddy}
                    disabled={buddyLoading}
                    className="w-full py-2.5 rounded-xl bg-[#00c8a0] hover:bg-[#00b08c] text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#00c8a0]/15"
                  >
                    {buddyLoading ? (
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Plus className="size-3.5" /> accept buddy request</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleAddBuddy}
                    disabled={buddyLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/30 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    {buddyLoading ? (
                      <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Plus className="size-3.5" /> add pilot buddy</>
                    )}
                  </button>
                )}

                <button
                  onClick={handleCopyLicenseLink}
                  className="w-full py-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 text-white/70 font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="size-3.5" /> Share License
                </button>
              </div>
            </Card>

            {/* General Specs */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-md">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 font-mono">Telemetry specs</h3>
              <div className="space-y-3.5 text-xs text-white/70">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/35 font-medium">Daily Target</span>
                  <span className="font-bold text-white/90">{pilot.studyDuration || "Flexible"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/35 font-medium">Cadet Age</span>
                  <span className="font-bold text-white/90">{pilot.age || "Not declared"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/35 font-medium">Autopilot Streaks</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    🔥 {pilot.currentStreak}d (Max: {pilot.longestStreak}d)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/35 font-medium">Distractibility</span>
                  <span className="font-bold text-white/90">{pilot.distractibility || "Neutral"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Licenses details (Right Panel) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Rank Card */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center gap-3.5 border-b border-white/10 pb-4 mb-4">
                <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/15 text-3xl shadow-inner">
                  {rankInfo.icon}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#00c8a0] font-mono">active license rank</span>
                  <h4 className="text-xl font-bold text-white tracking-wide">
                    {rankInfo.name}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-sans">{rankInfo.desc}</p>
            </Card>

            {/* Passport Stamps */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                    <Globe className="size-5 text-[#00c8a0]" />
                    License Stamp Booklet
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5 font-sans">Verified global focus Stamp lands</p>
                </div>
                <span className="text-xs bg-navy-900/60 border border-white/10 px-3 py-1 rounded-full text-white/60 font-mono">
                  Page {currentPassportPage + 1} of {totalStampsPages}
                </span>
              </div>

              {/* Physical style stamps container */}
              <div className="bg-[#2a1b14] border-4 border-[#1c120d] rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)]" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {displayedFlights.map((flight, idx) => {
                    const origin = flight.session?.originCode || "???";
                    const dest = flight.session?.destinationCode || "???";
                    const duration = flight.session?.duration || 0;
                    
                    const rotateDeg = ((idx * 9 + currentPassportPage * 13) % 12) - 6;
                    const dateStr = flight.session?.completedAt || flight.joinedAt
                      ? new Date(flight.session?.completedAt || flight.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
                      : "UNKNOWN";

                    return (
                      <motion.div
                        key={flight.id}
                        className="rounded-full aspect-square border-2 border-[#5a4ba1]/60 bg-[#5a4ba1]/5 text-[#a89eff] p-2 flex flex-col items-center justify-center text-center shadow-sm select-none"
                        style={{ transform: `rotate(${rotateDeg}deg)` }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-[7px] font-mono tracking-widest uppercase block opacity-85">{origin}➔{dest}</span>
                        <span className="text-[12px] font-black leading-none my-0.5 font-sans">{dest}</span>
                        <span className="text-[6px] font-mono border-t border-[#a89eff]/15 pt-0.5">{dateStr}</span>
                      </motion.div>
                    );
                  })}
                  {Array.from({ length: 4 - displayedFlights.length }).map((_, i) => (
                    <div key={i} className="rounded-full border border-dashed border-white/5 aspect-square flex items-center justify-center text-[7px] text-white/10 uppercase tracking-widest">
                      Stamp Slot
                    </div>
                  ))}
                </div>

                {totalStampsPages > 1 && (
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] font-mono font-bold text-[#b49e8f]">
                    <button disabled={currentPassportPage === 0} onClick={() => setCurrentPassportPage(p => Math.max(0, p - 1))} className="hover:text-white disabled:opacity-20 flex items-center gap-1">
                      ◀ Prev
                    </button>
                    <span>{currentPassportPage + 1} / {totalStampsPages}</span>
                    <button disabled={currentPassportPage === totalStampsPages - 1} onClick={() => setCurrentPassportPage(p => Math.min(totalStampsPages - 1, p + 1))} className="hover:text-white disabled:opacity-20 flex items-center gap-1">
                      Next ▶
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Visual Boarding Pass Closet */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-xl">🗄️</span>
                    Buddy's Boarding Pass Closet
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Visual cabinet drawer of this pilot's filed boarding tickets</p>
                </div>
                
                <span className="text-xs bg-navy-900/60 border border-white/10 text-white/60 font-mono px-2.5 py-1 rounded-full">
                  Filed: {completedFlightsCount}
                </span>
              </div>

              {displayedLogs.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayedLogs.map((flight) => {
                      const sessionId = flight.sessionId || flight.id || "";
                      
                      const char0 = sessionId.charCodeAt(0) || 69;
                      const char1 = sessionId.charCodeAt(1) || 75;
                      
                      const airline = AIRLINES[char0 % AIRLINES.length];
                      const aircraft = AIRCRAFT_MODELS[char1 % AIRCRAFT_MODELS.length];
                      const seat = flight.seat || `${Math.floor(char0 % 20) + 4}${["A", "C", "F", "K"][char1 % 4]}`;
                      const seatRow = parseInt(seat.replace(/\D/g, "")) || 24;
                      const cabinClass = seatRow <= 2 ? CABIN_CLASSES[0] : seatRow <= 8 ? CABIN_CLASSES[1] : seatRow <= 16 ? CABIN_CLASSES[2] : CABIN_CLASSES[3];
                      const theme = AIRCRAFT_THEMES[aircraft.id] || AIRCRAFT_THEMES.a380;
                      
                      const date = new Date(flight.session?.completedAt || flight.joinedAt);
                      const dateStr = date.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).toUpperCase();
                      
                      const origin = flight.session?.originCode || "DXB";
                      const dest = flight.session?.destinationCode || "SIN";
                      const duration = flight.session?.duration || 0;
                      const coins = flight.coinsEarned || Math.round(duration * 2);
                      
                      let finalSubject = pilot.studyTime || "Focus Study Voyage";
                      let finalSeat = seat;
                      
                      // Check local storage config override if viewing locally (parity check)
                      if (typeof window !== "undefined") {
                        const cachedConfig = localStorage.getItem(`flight_config_${sessionId}`);
                        if (cachedConfig) {
                          try {
                            const parsed = JSON.parse(cachedConfig);
                            if (parsed.studySubject) finalSubject = parsed.studySubject;
                            if (parsed.seatNumber) finalSeat = parsed.seatNumber;
                          } catch {}
                        }
                      }

                      return (
                        <motion.div
                          key={flight.id}
                          onClick={() => setSelectedFlightForPass(flight)}
                          whileHover={{ y: -4 }}
                          className="relative h-44 rounded-2xl border border-white/10 bg-navy-900/60 p-4 shadow-lg overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accentColor}05, rgba(13, 26, 53, 0.4))`,
                          }}
                        >
                          {/* Colored aircraft stripe */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${theme.accentColor}, transparent)` }} />
                          
                          {/* Inner Sliding Ticket Body */}
                          <div className="relative z-10 size-full flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border text-white/50 bg-white/5" style={{ borderColor: `${theme.accentColor}25` }}>
                                  {airline.code} {aircraft.id.toUpperCase()}
                                </span>
                                <h4 className="mt-2 text-xs font-bold text-white/80 line-clamp-1">
                                  📚 {finalSubject}
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                +{coins} 🪙
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-b border-white/5 py-2 my-2">
                              <div>
                                <p className="font-mono text-lg font-black leading-none text-white">{origin}</p>
                                <p className="text-[8px] text-white/30 uppercase mt-0.5">Origin</p>
                              </div>
                              <span className="text-xs text-white/20">➔</span>
                              <div className="text-right">
                                <p className="font-mono text-lg font-black leading-none text-white">{dest}</p>
                                <p className="text-[8px] text-white/30 uppercase mt-0.5">Dest</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono text-white/40">{dateStr}</span>
                              <span className="font-mono font-bold text-amber-400">Seat {finalSeat}</span>
                            </div>
                          </div>

                          {/* Pocket Folder glass cover sheet overlay */}
                          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-950/90 to-navy-950/40 border-t border-white/10 backdrop-blur-[1px] flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                              🎫 Pull Out Pass
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {totalLogPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs font-semibold text-white/50">
                      <Button size="sm" type="button" variant="ghost" disabled={currentLogPage === 0} onClick={() => setCurrentLogPage(p => Math.max(0, p - 1))} className="px-3 py-1.5 h-auto hover:text-white hover:bg-white/5 disabled:opacity-20 flex items-center gap-1 cursor-pointer">
                        ◀ Prev
                      </Button>
                      <span className="font-mono">Page {currentLogPage + 1} of {totalLogPages}</span>
                      <Button size="sm" type="button" variant="ghost" disabled={currentLogPage === totalLogPages - 1} onClick={() => setCurrentLogPage(p => Math.min(totalLogPages - 1, p + 1))} className="px-3 py-1.5 h-auto hover:text-white hover:bg-white/5 disabled:opacity-20 flex items-center gap-1 cursor-pointer">
                        Next ▶
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center select-none text-white/30">
                  <div className="text-4xl mb-3">📭</div>
                  <h4 className="text-xs font-bold font-mono tracking-widest uppercase">Closet empty</h4>
                  <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed">This pilot has not filed any voyages in their stamp closet drawer yet.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Reconstructed Boarding Pass Modal (Viewer parity) */}
      <AnimatePresence>
        {selectedFlightForPass && (() => {
          const flight = selectedFlightForPass;
          const sessionId = flight.sessionId || flight.id || "";
          
          const char0 = sessionId.charCodeAt(0) || 69;
          const char1 = sessionId.charCodeAt(1) || 75;
          const char2 = sessionId.charCodeAt(2) || 88;
          
          const airline = AIRLINES[char0 % AIRLINES.length];
          const aircraft = AIRCRAFT_MODELS[char1 % AIRCRAFT_MODELS.length];
          const gate = ["A-04", "B-12", "C-08", "D-15", "E-20"][char2 % 5];
          const seat = flight.seat || `${Math.floor(char0 % 20) + 4}${["A", "C", "F", "K"][char1 % 4]}`;
          const seatRow = parseInt(seat.replace(/\D/g, "")) || 24;
          const cabinClass = seatRow <= 2 ? CABIN_CLASSES[0] : seatRow <= 8 ? CABIN_CLASSES[1] : seatRow <= 16 ? CABIN_CLASSES[2] : CABIN_CLASSES[3];
          
          const date = new Date(flight.session?.completedAt || flight.joinedAt);
          const dateStr = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).toUpperCase();
          const timeStr = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const duration = flight.session?.duration || 0;
          const coins = flight.coinsEarned || Math.round(duration * 2);
          const originCode = flight.session?.originCode || "DXB";
          const originName = flight.session?.origin?.split(" Airport")[0] || "Dubai International";
          const destinationCode = flight.session?.destinationCode || "SIN";
          const destinationName = flight.session?.destination?.split(" Airport")[0] || "Changi Airport";

          let finalAirline = airline;
          let finalAircraft = aircraft;
          let finalClass = cabinClass;
          let finalSeat = seat;
          let finalGate = gate;
          let finalSubject = pilot.studyTime || "Focus Study Voyage";

          if (typeof window !== "undefined") {
            const cachedConfig = localStorage.getItem(`flight_config_${sessionId}`);
            if (cachedConfig) {
              try {
                const parsed = JSON.parse(cachedConfig);
                if (parsed.airline) finalAirline = parsed.airline;
                if (parsed.aircraft) finalAircraft = parsed.aircraft;
                if (parsed.cabinClass) finalClass = parsed.cabinClass;
                if (parsed.seatNumber) finalSeat = parsed.seatNumber;
                if (parsed.gateNumber) finalGate = parsed.gateNumber;
                if (parsed.studySubject) finalSubject = parsed.studySubject;
              } catch {}
            }
          }

          const finalTheme = AIRCRAFT_THEMES[finalAircraft.id] || AIRCRAFT_THEMES.a380;
          const flightNum = `${finalAirline.code} ${finalAircraft.id === "a380" ? "380" : finalAircraft.id === "b777" ? "777" : finalAircraft.id === "a350" ? "350" : "787"}`;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedFlightForPass(null)}
                className="absolute inset-0 bg-[#050a17]/90 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border text-left"
                style={{
                  borderColor: `${finalTheme.accentColor}30`,
                  background: `linear-gradient(135deg, ${finalTheme.accentColor}08, rgba(5,10,23,0.98))`,
                  boxShadow: `0 20px 60px ${finalTheme.accentColor}15`,
                }}
              >
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${finalTheme.accentColor}, transparent)` }} />

                <div className={`p-4 bg-gradient-to-r ${finalAirline.color} border-b border-white/8 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="font-['Space_Grotesk',system-ui] font-bold text-xs uppercase tracking-widest text-white/80">{finalAirline.name}</span>
                  </div>
                  <div className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase">{flightNum}</div>
                </div>

                <div className="p-6 space-y-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-mono text-4xl font-extrabold tracking-tighter">{originCode}</h2>
                      <p className="text-[10px] text-white/40 mt-1">{originName}</p>
                    </div>
                    <span className="text-xs text-white/20">➔</span>
                    <div className="text-right">
                      <h2 className="font-mono text-4xl font-extrabold tracking-tighter">{destinationCode}</h2>
                      <p className="text-[10px] text-white/40 mt-1">{destinationName}</p>
                    </div>
                  </div>

                  <div className="relative h-4 flex items-center justify-between">
                    <div className="absolute left-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-l-transparent z-10" />
                    <div className="w-full border-t border-dashed border-white/10" />
                    <div className="absolute right-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-r-transparent z-10" />
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Passenger</p>
                      <p className="font-bold text-white mt-0.5 truncate">{pilot.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Cabin Class</p>
                      <p className="font-bold mt-0.5" style={{ color: finalTheme.accentColor }}>{finalClass.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Seat</p>
                      <p className="font-mono font-bold mt-0.5">{finalSeat}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Voyage Date</p>
                      <p className="font-bold text-white/75 mt-0.5">{dateStr}</p>
                    </div>
                    <div className="col-span-2 border-t border-white/5 pt-3">
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Study Focus</p>
                      <p className="font-bold text-yellow-400 mt-0.5 truncate">📚 {finalSubject}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button onClick={() => setSelectedFlightForPass(null)} className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition cursor-pointer text-center">
                      Close card
                    </button>
                    <button
                      onClick={() => {
                        const text = `✈️ Check out my buddy pilot's focus ticket on GoFocusGen! \n\n📚 Focus: ${finalSubject}\n⏱️ Cruise: ${duration} mins completed!\n\nTrack focus voyages together at:`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`, "_blank");
                      }}
                      className="flex-1 py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${finalTheme.accentColor}, ${finalTheme.accentColor}cc)`,
                        boxShadow: `0 4px 15px ${finalTheme.accentColor}20`,
                      }}
                    >
                      <TwitterIcon className="size-3.5 fill-white" /> Share Voyage
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </main>
  );
}
