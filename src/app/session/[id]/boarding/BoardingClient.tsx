"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Star, Shield, ArrowRight, Volume2, VolumeX, Sparkles, Award, Zap } from "lucide-react";

interface FlightSession {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  transportMode: string;
  duration: number;
  mode: "CHILL" | "HARDCORE";
}

// ─── Aircraft UI Themes ────────────────────────────────────────────────────────
// Each aircraft has its own color palette, texture descriptor, and ambience theme.
const AIRCRAFT_THEMES: Record<string, {
  gradient: string;
  accentColor: string;
  borderColor: string;
  glowColor: string;
  bgOverlay: string;
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
    bgOverlay: "from-amber-950/20 to-black",
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
    bgOverlay: "from-blue-950/20 to-black",
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
    bgOverlay: "from-teal-950/20 to-black",
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
    bgOverlay: "from-purple-950/20 to-black",
    badgeStyle: "bg-purple-500/10 border-purple-400/40 text-purple-300",
    selectedStyle: "bg-gradient-to-br from-purple-900/30 to-purple-950/10 border-purple-400/50 shadow-purple-500/10",
    tagline: "✨ Dreamliner Holographic",
    icon: "🌙",
    techLabel: "GENX TWIN",
  },
};

const AIRLINES = [
  {
    id: "emirates",
    name: "Emirates",
    abbrev: "AE",
    cost: 800,
    hslColor: "hsl(0, 100%, 60%)",
    code: "EK",
    color: "from-red-600/30 to-red-950/20",
    glow: "shadow-red-500/20 border-red-500/30",
    textGlow: "text-red-400",
    badge: "First class luxury",
    perk: "+2.5x Coins & Fine Dining",
    baseMultiplier: 2.5,
  },
  {
    id: "singapore",
    name: "Singapore Airlines",
    abbrev: "SG",
    cost: 650,
    hslColor: "hsl(45, 100%, 55%)",
    code: "SQ",
    color: "from-amber-500/30 to-amber-950/20",
    glow: "shadow-amber-500/20 border-amber-500/30",
    textGlow: "text-amber-400",
    badge: "5-Star premium service",
    perk: "+2.2x Coins & Comfort Cabins",
    baseMultiplier: 2.2,
  },
  {
    id: "qatar",
    name: "Qatar Airways",
    abbrev: "QA",
    cost: 550,
    hslColor: "hsl(330, 80%, 50%)",
    code: "QR",
    color: "from-rose-800/30 to-rose-950/20",
    glow: "shadow-rose-500/20 border-rose-500/30",
    textGlow: "text-rose-400",
    badge: "World's best business class",
    perk: "+2.0x Coins & Elite Lounges",
    baseMultiplier: 2.0,
  },
  {
    id: "airindia",
    name: "Air India",
    abbrev: "IN",
    cost: 300,
    hslColor: "hsl(20, 100%, 60%)",
    code: "AI",
    color: "from-orange-500/30 to-orange-950/20",
    glow: "shadow-orange-500/20 border-orange-500/30",
    textGlow: "text-orange-400",
    badge: "Global Indian spirit",
    perk: "+1.8x Coins & Indian Delicacies",
    baseMultiplier: 1.8,
  },
  {
    id: "indigo",
    name: "IndiGo",
    abbrev: "6E",
    cost: 0,
    hslColor: "hsl(215, 100%, 60%)",
    code: "6E",
    color: "from-blue-600/30 to-blue-950/20",
    glow: "shadow-blue-500/20 border-blue-500/30",
    textGlow: "text-blue-400",
    badge: "On-time & affordable",
    perk: "+1.5x Coins & Super Fast Entry",
    baseMultiplier: 1.5,
  },
];

const CABIN_CLASSES = [
  {
    id: "first",
    name: "First Class Suite",
    desc: "Row 1 · seats A-B",
    cost: 500,
    priceMultiplier: 2.5,
    perks: ["Private Suite Door", "Holographic Focus Shield (100%)", "Double Coins", "Row 1 Assigned"],
  },
  {
    id: "business",
    name: "Business Class",
    desc: "Row 4–8 · seats A-F",
    cost: 300,
    priceMultiplier: 1.8,
    perks: ["Workspace Console", "Enhanced Focus Shield (70%)", "+80% Coins", "Row 4-8 Assigned"],
  },
  {
    id: "premium",
    name: "Premium Economy",
    desc: "Row 12–16 · seats A-F",
    cost: 150,
    priceMultiplier: 1.3,
    perks: ["Extra Wide Seat", "Standard Focus Shield (40%)", "+30% Coins", "Row 12-16 Assigned"],
  },
  {
    id: "economy",
    name: "Economy Class",
    desc: "Row 24–38 · seats A-F",
    cost: 0,
    priceMultiplier: 1.0,
    perks: ["Standard Cockpit Utilities", "Eco-Takeoff Mode", "Base Coins Reward", "Row 24-38 Assigned"],
  },
];

const AIRCRAFT_MODELS = [
  {
    id: "a380",
    name: "Airbus A380 Superjumbo",
    desc: "Double-decker sky giant. Unrivaled stability and silence.",
    engines: "4x Engine Alliance GP7200",
    speed: "Mach 0.85 (903 km/h)",
    comfort: "★★★★★",
    shield: "Ultra-Quiet Focus Shield (+50%)",
    capacity: "853 pax",
    wingspan: "79.75 m",
    highlight: "World's largest passenger aircraft",
  },
  {
    id: "b777",
    name: "Boeing 777-300ER Prestige",
    desc: "Long-haul legend. Robust, spacious, and extremely reliable.",
    engines: "2x General Electric GE90",
    speed: "Mach 0.84 (892 km/h)",
    comfort: "★★★★☆",
    shield: "Twin-Engine Stability (+40%)",
    capacity: "396 pax",
    wingspan: "64.8 m",
    highlight: "World's most powerful twin-engine",
  },
  {
    id: "a350",
    name: "Airbus A350-1000 XWB",
    desc: "Next-gen carbon composite body with ambient high-altitude cabin pressures.",
    engines: "2x Rolls-Royce Trent XWB",
    speed: "Mach 0.85 (903 km/h)",
    comfort: "★★★★★",
    shield: "Dynamic Pressure Optimization (+45%)",
    capacity: "369 pax",
    wingspan: "64.75 m",
    highlight: "Lower cabin altitude for wellbeing",
  },
  {
    id: "b787",
    name: "Boeing 787 Dreamliner",
    desc: "Holographic auto-dimming windows, advanced air quality systems.",
    engines: "2x General Electric GEnx",
    speed: "Mach 0.85 (903 km/h)",
    comfort: "★★★★☆",
    shield: "Moisture-Balanced Cabin (+35%)",
    capacity: "330 pax",
    wingspan: "60.1 m",
    highlight: "Electrochromic dimmable windows",
  },
];

export default function BoardingClient({ id }: { id: string }) {
  const router = useRouter();
  const sessionId = (id || "").replace(/[^a-zA-Z0-9\-]/g, "");

  const [session, setSession] = useState<FlightSession | null>(null);
  const [selectedAirline, setSelectedAirline] = useState(AIRLINES[0]);
  const [selectedClass, setSelectedClass] = useState(CABIN_CLASSES[1]);
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_MODELS[0]);
  const [seatNumber, setSeatNumber] = useState("4A");
  const [soundOn, setSoundOn] = useState(false);
  const [isTakingOff, setIsTakingOff] = useState(false);
  const [gateNumber, setGateNumber] = useState("B-12");
  const [flightNumber, setFlightNumber] = useState("EK 380");

  const [passengerName, setPassengerName] = useState("Pilot Cadet");
  const [studySubject, setStudySubject] = useState("");
  const [userCoins, setUserCoins] = useState<number>(0);

  // Current aircraft theme
  const aircraftTheme = AIRCRAFT_THEMES[selectedAircraft.id] || AIRCRAFT_THEMES.a380;

  useEffect(() => {
    const savedSound = localStorage.getItem("sound_effects_enabled");
    setSoundOn(savedSound === "true");

    const localData = localStorage.getItem(`flight_session_${sessionId}`);
    if (localData) {
      try { setSession(JSON.parse(localData)); } catch {}
    } else {
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => res.ok ? res.json() : Promise.reject())
        .then((data: { session: FlightSession }) => setSession(data.session))
        .catch(() => setSession({
          id: sessionId,
          origin: "Dubai Intl Airport",
          originCode: "DXB",
          destination: "Changi Airport",
          destinationCode: "SIN",
          transportMode: "FLIGHT",
          duration: 360,
          mode: "CHILL",
        }));
    }

    const localUser = localStorage.getItem("gofocusgen_onboarding");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed.name) setPassengerName(parsed.name);
        if (parsed.studyTime) setStudySubject(parsed.studyTime);
      } catch {}
    }

    fetch("/api/user/onboard")
      .then((res) => res.json())
      .then((data: any) => {
        if (data.user) {
          if (data.user.name) setPassengerName(data.user.name);
          if (data.user.studyTime) setStudySubject(data.user.studyTime);
          if (typeof data.user.coins === "number") setUserCoins(data.user.coins);
        }
      })
      .catch(() => {});

    const gates = ["A-04", "B-12", "C-08", "D-15", "E-20"];
    setGateNumber(gates[Math.floor(Math.random() * gates.length)]);
  }, [sessionId]);

  useEffect(() => {
    const code = selectedAirline.code;
    const num = selectedAircraft.id === "a380" ? "380" : selectedAircraft.id === "b777" ? "777" : selectedAircraft.id === "a350" ? "350" : "787";
    setFlightNumber(`${code} ${num}`);

    let row = 4; let suffix = "A";
    if (selectedClass.id === "first") {
      row = [1, 2][Math.floor(Math.random() * 2)];
      suffix = ["A", "D"][Math.floor(Math.random() * 2)];
    } else if (selectedClass.id === "business") {
      row = [4, 8][Math.floor(Math.random() * 2)];
      suffix = ["A", "C", "F"][Math.floor(Math.random() * 3)];
    } else if (selectedClass.id === "premium") {
      row = 14;
      suffix = ["A", "B", "D", "J"][Math.floor(Math.random() * 4)];
    } else {
      row = [26, 32][Math.floor(Math.random() * 2)];
      suffix = ["A", "B", "D", "J"][Math.floor(Math.random() * 4)];
    }
    setSeatNumber(`${row}${suffix}`);
  }, [selectedAirline, selectedClass, selectedAircraft]);

  const handleTakeOff = async () => {
    if (!studySubject.trim()) {
      alert("⚠️ Declaring your focus subject is mandatory before boarding the flight.");
      return;
    }
    setIsTakingOff(true);

    if (soundOn) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    }

    const totalCost = selectedAirline.cost + selectedClass.cost;
    if (totalCost > 0) {
      try {
        const res = await fetch("/api/user/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coinsEarned: -totalCost, sessionId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.coins === "number") setUserCoins(data.coins);
        }
      } catch {}
    }

    const flightConfig = {
      sessionId,
      airline: selectedAirline,
      cabinClass: selectedClass,
      aircraft: selectedAircraft,
      seatNumber,
      flightNumber,
      gateNumber,
      studySubject: studySubject.trim() || "Focus Study",
      mode: session?.mode || "CHILL",
    };
    localStorage.setItem(`flight_config_${sessionId}`, JSON.stringify(flightConfig));
    if (session) localStorage.setItem(`flight_session_${sessionId}`, JSON.stringify(session));

    try {
      await fetch(`/api/sessions/${sessionId}/seat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatNumber, studySubject: studySubject.trim() }),
      });
    } catch {}

    setTimeout(() => router.push(`/session/${sessionId}`), 3500);
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050a17] text-white">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-[#0ea5e9] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-['Space_Grotesk',system-ui] text-lg tracking-wider text-white/60">Configuring Flight Manifest...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050a17] text-white selection:bg-[#0ea5e9] selection:text-white pb-16">
      {/* Dynamic background based on selected aircraft */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top, ${aircraftTheme.accentColor}08 0%, transparent 60%), #050a17`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-30" />

      {/* Aircraft-specific ambient pulse ring */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-b-full opacity-[0.04] transition-all duration-700 blur-3xl z-0"
        style={{ backgroundColor: aircraftTheme.accentColor }}
      />

      {/* ─── TAKEOFF ANIMATION ─── */}
      <AnimatePresence>
        {isTakingOff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: "-100%", x: `${Math.random() * 100}%` }}
                  animate={{ y: "150%" }}
                  transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "linear", delay: Math.random() * 0.5 }}
                  className="absolute w-[1px] h-[15vh] bg-gradient-to-b from-transparent via-white/40 to-transparent"
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ scale: [1, 1.2, 5], y: [0, -50, -600], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, ease: "easeInOut" }}
            >
              <Plane
                className="size-24 rotate-[315deg] drop-shadow-[0_0_35px_rgba(56,189,248,0.6)]"
                style={{ color: aircraftTheme.accentColor }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, times: [0, 0.3, 0.9] }}
              className="text-center mt-12"
            >
              <h2 className="font-['Space_Grotesk',system-ui] text-3xl font-extrabold tracking-widest text-white uppercase">
                Engaging Engines
              </h2>
              <p className="mt-2 font-mono tracking-widest animate-pulse" style={{ color: aircraftTheme.accentColor }}>
                CLIMBING TO FLIGHT LEVEL 380...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-10">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span
              className="rounded-full px-3.5 py-1 text-xs font-semibold border"
              style={{
                backgroundColor: `${aircraftTheme.accentColor}15`,
                borderColor: `${aircraftTheme.accentColor}40`,
                color: aircraftTheme.accentColor,
              }}
            >
              ✈️ PRE-FLIGHT CHECKLIST
            </span>
            <h1 className="mt-2 font-['Space_Grotesk',system-ui] text-4xl font-black tracking-tight text-white md:text-5xl">
              Configure Your Flight
            </h1>
            <p className="mt-1.5 text-sm text-white/55">
              Select your Airline, Cabin, and Aircraft to personalize your study cabin.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-center">
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-xs font-semibold text-yellow-400 backdrop-blur-md">
              🪙 {userCoins.toLocaleString()} Coins
            </div>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
            >
              {soundOn ? (
                <><Volume2 className="size-4" style={{ color: aircraftTheme.accentColor }} /> Sound: On</>
              ) : (
                <><VolumeX className="size-4 text-white/40" /> Sound: Off</>
              )}
            </button>
          </div>
        </div>

        {/* ─── AIRCRAFT MODEL SELECTOR (TOPMOST — drives the entire page theme) ─── */}
        <div className="rounded-3xl border border-white/10 bg-navy-900/40 p-6 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="flex size-7 items-center justify-center rounded-lg text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>
              🛩
            </span>
            <h3 className="font-['Space_Grotesk',system-ui] text-lg font-bold text-white tracking-wide">
              Select Aircraft Fleet Model
            </h3>
            <span className="ml-auto text-[10px] font-mono text-white/30 uppercase tracking-widest">
              DRIVES CABIN EXPERIENCE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {AIRCRAFT_MODELS.map((aircraft) => {
              const isSelected = selectedAircraft.id === aircraft.id;
              const theme = AIRCRAFT_THEMES[aircraft.id];
              return (
                <motion.button
                  key={aircraft.id}
                  onClick={() => setSelectedAircraft(aircraft)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? `${theme.selectedStyle} shadow-lg`
                      : "bg-white/4 border-white/5 hover:bg-white/8 hover:border-white/10"
                  }`}
                >
                  {/* Glow highlight when selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
                      style={{ background: `radial-gradient(circle at top left, ${theme.accentColor}, transparent 70%)` }}
                    />
                  )}

                  {/* Tech label badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[9px] font-mono font-extrabold tracking-[0.2em] uppercase px-2 py-0.5 rounded-md border"
                      style={isSelected ? {
                        backgroundColor: `${theme.accentColor}15`,
                        borderColor: `${theme.accentColor}40`,
                        color: theme.accentColor,
                      } : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                    >
                      {theme.techLabel}
                    </span>
                    {isSelected && (
                      <Zap className="size-3.5" style={{ color: theme.accentColor }} />
                    )}
                  </div>

                  <p
                    className="font-['Space_Grotesk',system-ui] font-extrabold text-sm mb-1 transition-colors"
                    style={isSelected ? { color: theme.accentColor } : { color: "rgba(255,255,255,0.9)" }}
                  >
                    {aircraft.name}
                  </p>
                  <p className="text-[10px] text-white/45 line-clamp-2 mb-3 h-8">{aircraft.desc}</p>

                  {/* Aircraft stats */}
                  <div className="space-y-1.5 border-t border-white/8 pt-3 text-[9px]">
                    <div className="flex justify-between text-white/40">
                      <span>Shield</span>
                      <span className="font-mono" style={isSelected ? { color: theme.accentColor } : { color: "rgba(255,255,255,0.5)" }}>
                        {aircraft.shield.includes("(") ? aircraft.shield.split("(")[1].replace(")", "") : "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>Capacity</span>
                      <span className="font-mono text-white/50">{aircraft.capacity}</span>
                    </div>
                    <div className="flex justify-between text-white/40">
                      <span>Special</span>
                      <span className="font-mono text-[8px] text-right" style={isSelected ? { color: theme.accentColor } : { color: "rgba(255,255,255,0.4)" }}>
                        {aircraft.highlight.split(" ").slice(0, 3).join(" ")}
                      </span>
                    </div>
                  </div>

                  {/* Aircraft tagline */}
                  <div
                    className="mt-3 text-[8px] font-semibold tracking-wider uppercase text-center rounded-lg py-1 border"
                    style={isSelected ? {
                      backgroundColor: `${theme.accentColor}10`,
                      borderColor: `${theme.accentColor}30`,
                      color: theme.accentColor,
                    } : { backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                  >
                    {theme.tagline}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">

            {/* Step 1: Airline */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex size-7 items-center justify-center rounded-lg text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>01</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-lg font-bold text-white tracking-wide">Select Your Airline Carrier</h3>
              </div>
              <div className="space-y-2.5">
                {AIRLINES.map((airline) => {
                  const isSelected = selectedAirline.id === airline.id;
                  return (
                    <motion.button
                      key={airline.id}
                      onClick={() => setSelectedAirline(airline)}
                      whileHover={{ x: 2 }}
                      className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isSelected
                          ? `bg-gradient-to-r ${airline.color} border-white/20 shadow-lg ${airline.glow}`
                          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div
                          className="flex size-12 items-center justify-center rounded-xl border font-['Space_Grotesk',system-ui] font-extrabold text-sm tracking-widest transition-all duration-300"
                          style={{
                            color: airline.hslColor,
                            borderColor: isSelected ? airline.hslColor : `${airline.hslColor}30`,
                            backgroundColor: `${airline.hslColor}10`,
                            boxShadow: isSelected ? `0 0 15px ${airline.hslColor}40` : `0 0 4px ${airline.hslColor}20`,
                          }}
                        >
                          {airline.abbrev}
                        </div>
                        <div>
                          <p className={`font-['Space_Grotesk',system-ui] font-bold text-sm ${isSelected ? airline.textGlow : "text-white/90"}`}>
                            {airline.name}
                          </p>
                          <p className="text-xs text-white/45">{airline.badge} · {airline.code} flight</p>
                        </div>
                      </div>
                      <div className="text-right relative z-10 flex flex-col items-end gap-1.5">
                        {airline.cost > 0 ? (
                          <span className="text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 rounded-md px-2 py-0.5 text-yellow-400 font-bold">
                            🪙 {airline.cost}
                          </span>
                        ) : (
                          <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5 text-emerald-400 font-bold">
                            Free
                          </span>
                        )}
                        <span className="text-[9px] font-semibold text-emerald-400 tracking-wider uppercase">{airline.perk}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Cabin Class */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex size-7 items-center justify-center rounded-lg text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>02</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-lg font-bold text-white tracking-wide">Select Cabin Seating Class</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CABIN_CLASSES.map((cabin) => {
                  const isSelected = selectedClass.id === cabin.id;
                  return (
                    <motion.button
                      key={cabin.id}
                      onClick={() => setSelectedClass(cabin)}
                      whileHover={{ scale: 1.01 }}
                      className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                        isSelected
                          ? "border-white/20 shadow-lg"
                          : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                      style={isSelected ? {
                        backgroundColor: `${aircraftTheme.accentColor}08`,
                        borderColor: `${aircraftTheme.accentColor}40`,
                        boxShadow: `0 4px 20px ${aircraftTheme.accentColor}10`,
                      } : {}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-['Space_Grotesk',system-ui] font-extrabold text-sm" style={isSelected ? { color: aircraftTheme.accentColor } : { color: "white" }}>
                          {cabin.name}
                        </p>
                        {cabin.cost > 0 ? (
                          <span className="text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 rounded-md px-1.5 py-0.5 text-yellow-400 font-bold">🪙 {cabin.cost}</span>
                        ) : (
                          <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 rounded-md px-1.5 py-0.5 text-emerald-400 font-bold">Free</span>
                        )}
                      </div>
                      <p className="text-xs text-white/45 mb-4 h-5">{cabin.desc}</p>
                      <div className="space-y-1.5 border-t border-white/8 pt-3">
                        {cabin.perks.map((perk, i) => {
                          let Icon = Sparkles;
                          if (perk.toLowerCase().includes("shield")) Icon = Shield;
                          else if (perk.toLowerCase().includes("coin")) Icon = Award;
                          else if (perk.toLowerCase().includes("row") || perk.toLowerCase().includes("seat")) Icon = Star;
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                              <Icon className="size-3.5 flex-shrink-0" style={isSelected ? { color: aircraftTheme.accentColor } : { color: "rgba(255,255,255,0.3)" }} />
                              <span className="truncate">{perk}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Focus Subject */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-5">
                <span className="flex size-7 items-center justify-center rounded-lg text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>03</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-lg font-bold text-white tracking-wide">
                  Declare Focus Subject <span className="text-red-400 text-sm font-normal">(Mandatory)</span>
                </h3>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. Advanced Next.js, Organic Chemistry, UI Design..."
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full bg-white/[0.04] border rounded-2xl px-5 py-4 text-sm text-white placeholder-white/25 focus:outline-none transition duration-300"
                  style={{
                    borderColor: studySubject ? `${aircraftTheme.accentColor}50` : "rgba(255,255,255,0.08)",
                    boxShadow: studySubject ? `0 0 0 1px ${aircraftTheme.accentColor}30` : "none",
                  }}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Next.js", "Physics", "Chemistry", "Anatomy", "Japanese", "Calculus", "UI Design"].map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setStudySubject(subject)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200"
                      style={studySubject === subject ? {
                        backgroundColor: `${aircraftTheme.accentColor}20`,
                        borderColor: aircraftTheme.accentColor,
                        color: aircraftTheme.accentColor,
                      } : {
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      📚 {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Boarding Pass ─── */}
          <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-5">

            <div className="text-center lg:text-left">
              <h3
                className="font-['Space_Grotesk',system-ui] text-xs font-black tracking-widest uppercase"
                style={{ color: aircraftTheme.accentColor }}
              >
                Digital Boarding Pass Preview
              </h3>
              <p className="text-xs text-white/35 mt-1">
                {selectedAircraft.name} · {aircraftTheme.tagline}
              </p>
            </div>

            {/* BOARDING PASS */}
            <motion.div
              key={selectedAircraft.id}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl border"
              style={{
                borderColor: `${aircraftTheme.accentColor}30`,
                background: `linear-gradient(135deg, ${aircraftTheme.accentColor}08, rgba(5,10,23,0.95))`,
                boxShadow: `0 20px 60px ${aircraftTheme.accentColor}10`,
              }}
            >
              {/* Aircraft accent stripe */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${aircraftTheme.accentColor}, transparent)` }}
              />

              {/* Top banner */}
              <div
                className={`p-4 bg-gradient-to-r ${selectedAirline.color} border-b border-white/8 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-7 items-center justify-center rounded-lg border font-['Space_Grotesk',system-ui] font-extrabold text-[10px] tracking-wider"
                    style={{
                      color: selectedAirline.hslColor,
                      borderColor: `${selectedAirline.hslColor}40`,
                      backgroundColor: `${selectedAirline.hslColor}10`,
                    }}
                  >
                    {selectedAirline.abbrev}
                  </div>
                  <span className="font-['Space_Grotesk',system-ui] font-bold text-xs uppercase tracking-widest text-white/80">{selectedAirline.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: aircraftTheme.accentColor, borderColor: `${aircraftTheme.accentColor}30`, backgroundColor: `${aircraftTheme.accentColor}10` }}
                  >
                    {selectedAircraft.id.toUpperCase()}
                  </span>
                  <div className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase">{flightNumber}</div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Flight route */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">{session.originCode}</h2>
                    <p className="text-xs text-white/40 truncate mt-1">{(session.origin || "").split(" Airport")[0]}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1.5">{session.duration} min</span>
                    <div className="relative w-full flex items-center">
                      <div className="absolute inset-x-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${aircraftTheme.accentColor}40, transparent)` }} />
                      <div className="w-full flex justify-center relative">
                        <motion.div
                          animate={{ x: [-8, 8, -8] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-[#050a17] px-2"
                        >
                          <Plane className="size-4 rotate-[90deg]" style={{ color: aircraftTheme.accentColor, filter: `drop-shadow(0 0 6px ${aircraftTheme.accentColor}80)` }} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 text-right">
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">{session.destinationCode}</h2>
                    <p className="text-xs text-white/40 truncate mt-1">{(session.destination || "").split(" Airport")[0]}</p>
                  </div>
                </div>

                {/* Perforated divider */}
                <div className="relative h-4 flex items-center justify-between">
                  <div className="absolute left-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-l-transparent z-10" />
                  <div className="w-full border-t border-dashed border-white/10" />
                  <div className="absolute right-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-r-transparent z-10" />
                </div>

                {/* Ticket data */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Passenger</p>
                    <p className="font-bold text-white mt-0.5 truncate">{passengerName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Cabin Class</p>
                    <p className="font-bold mt-0.5" style={{ color: aircraftTheme.accentColor }}>{selectedClass.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Gate</p>
                    <p className="font-bold text-white mt-0.5">{gateNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Seat</p>
                    <p className="font-mono font-extrabold mt-0.5 tracking-wider inline-block border rounded-md px-2 py-0.5"
                      style={{ color: aircraftTheme.accentColor, borderColor: `${aircraftTheme.accentColor}30`, backgroundColor: `${aircraftTheme.accentColor}08` }}
                    >{seatNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Aircraft</p>
                    <p className="font-bold text-white/75 mt-0.5 truncate text-[11px]">{selectedAircraft.name.split(" ").slice(0, 2).join(" ")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Mode</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{session.mode}</p>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-3">
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Study Focus</p>
                    <p className="font-bold text-yellow-400 mt-0.5 truncate">📚 {studySubject || "Not declared yet"}</p>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-3 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Ticket Total</p>
                      <p className="text-white/50 text-[10px] mt-0.5">{selectedAirline.name} + {selectedClass.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Billing</p>
                      <p className="font-bold text-yellow-400 mt-0.5 text-sm">🪙 {selectedAirline.cost + selectedClass.cost}</p>
                    </div>
                  </div>
                </div>

                {/* Focus Shield Badge */}
                <div
                  className="rounded-2xl p-3 flex items-center justify-between gap-3 border"
                  style={{ backgroundColor: `${aircraftTheme.accentColor}08`, borderColor: `${aircraftTheme.accentColor}25` }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 flex-shrink-0" style={{ color: aircraftTheme.accentColor }} />
                    <div>
                      <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: aircraftTheme.accentColor }}>Focus Shield Active</p>
                      <p className="text-[9px] text-white/45">🛡️ {selectedAircraft.shield}</p>
                    </div>
                  </div>
                  <Award className="size-5 flex-shrink-0" style={{ color: aircraftTheme.accentColor }} />
                </div>

                {/* Simulated Barcode */}
                <div className="border-t border-white/5 pt-4 flex flex-col items-center">
                  <div className="w-full h-10 bg-white/4 rounded-md flex items-center justify-center p-1.5 relative overflow-hidden border border-white/5 opacity-70">
                    <div className="flex justify-between w-full h-full opacity-50">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div key={i} className="bg-white" style={{ width: `${[1, 2, 3, 1, 4, 1, 2][i % 7]}px`, opacity: i % 4 === 0 ? 0.3 : 1 }} />
                      ))}
                    </div>
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-[2px] opacity-70"
                      style={{ backgroundColor: aircraftTheme.accentColor, boxShadow: `0 0 8px ${aircraftTheme.accentColor}` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-white/25 tracking-[0.4em] uppercase mt-2">
                    GoFocusGen-{sessionId.substring(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* BOARD BUTTON */}
            <motion.button
              onClick={handleTakeOff}
              disabled={isTakingOff}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full relative group rounded-3xl py-5 font-['Space_Grotesk',system-ui] text-md font-extrabold tracking-widest text-white flex items-center justify-center gap-3 transition-all disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, ${aircraftTheme.accentColor}, ${aircraftTheme.accentColor}cc)`,
                boxShadow: `0 8px 32px ${aircraftTheme.accentColor}30`,
              }}
            >
              <Plane className="size-5 rotate-[45deg] transition group-hover:translate-x-1" />
              <span>ENGAGE ENGINES / BOARD</span>
              <ArrowRight className="size-5 flex-shrink-0" />
            </motion.button>

            <div className="text-center p-2">
              <span className="text-[10px] text-white/30 italic font-mono block">
                "Clear skies ahead, Pilot Cadet. Declare your focus and engage takeoff."
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
