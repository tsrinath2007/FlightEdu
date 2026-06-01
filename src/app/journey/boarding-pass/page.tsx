"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Zap, 
  Share2, 
  Download, 
  Check, 
  Copy,
  ChevronLeft,
  BookOpen
} from "lucide-react";
import Link from "next/link";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
    comfort: "★★★★★",
    shield: "Ultra-Quiet Focus Shield (+50%)",
    capacity: "853 pax",
    highlight: "World's largest passenger aircraft",
  },
  {
    id: "b777",
    name: "Boeing 777-300ER Prestige",
    desc: "Long-haul legend. Robust, spacious, and extremely reliable.",
    engines: "2x General Electric GE90",
    comfort: "★★★★☆",
    shield: "Twin-Engine Stability (+40%)",
    capacity: "396 pax",
    highlight: "World's most powerful twin-engine",
  },
  {
    id: "a350",
    name: "Airbus A350-1000 XWB",
    desc: "Next-gen carbon composite body with ambient high-altitude cabin pressures.",
    engines: "2x Rolls-Royce Trent XWB",
    comfort: "★★★★★",
    shield: "Dynamic Pressure Optimization (+45%)",
    capacity: "369 pax",
    highlight: "Lower cabin altitude for wellbeing",
  },
  {
    id: "b787",
    name: "Boeing 787 Dreamliner",
    desc: "Holographic auto-dimming windows, advanced air quality systems.",
    engines: "2x General Electric GEnx",
    comfort: "★★★★☆",
    shield: "Moisture-Balanced Cabin (+35%)",
    capacity: "330 pax",
    highlight: "Electrochromic dimmable windows",
  },
];

export default function BoardingPassGeneratorPage() {
  const router = useRouter();

  // Generator Config State
  const [studySubject, setStudySubject] = useState("Next.js App Router");
  const [studyDuration, setStudyDuration] = useState(90); // default 90 mins
  const [selectedAirline, setSelectedAirline] = useState(AIRLINES[0]);
  const [selectedClass, setSelectedClass] = useState(CABIN_CLASSES[1]); // Business
  const [selectedAircraft, setSelectedAircraft] = useState(AIRCRAFT_MODELS[0]); // A380
  const [sessionMode, setSessionMode] = useState<"CHILL" | "HARDCORE">("CHILL");
  const [storeInCloset, setStoreInCloset] = useState(true);

  // Client-only generated values to prevent hydration errors
  const [passengerName, setPassengerName] = useState("Pilot Cadet");
  const [gateNumber, setGateNumber] = useState("B-12");
  const [seatNumber, setSeatNumber] = useState("4A");
  const [flightNumber, setFlightNumber] = useState("EK 380");
  const [copied, setCopied] = useState(false);
  const [isTakingOff, setIsTakingOff] = useState(false);
  const [mounted, setMounted] = useState(false);

  const aircraftTheme = AIRCRAFT_THEMES[selectedAircraft.id] || AIRCRAFT_THEMES.a380;

  // Resolve Route airport details dynamically based on study time
  const getRouteDetails = (duration: number) => {
    if (duration < 60) {
      return { origin: "London Heathrow Airport", originCode: "LHR", destination: "Paris Charles de Gaulle", destinationCode: "CDG" };
    } else if (duration < 180) {
      return { origin: "Dubai International Airport", originCode: "DXB", destination: "Chhatrapati Shivaji", destinationCode: "BOM" };
    } else if (duration < 360) {
      return { origin: "Dubai International Airport", originCode: "DXB", destination: "Singapore Changi Airport", destinationCode: "SIN" };
    } else {
      return { origin: "John F. Kennedy Airport", originCode: "JFK", destination: "London Heathrow Airport", destinationCode: "LHR" };
    }
  };

  const route = getRouteDetails(studyDuration);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    const localUser = localStorage.getItem("gofocusgen_onboarding");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        if (parsed.name) setPassengerName(parsed.name);
      } catch {}
    }

    const gates = ["A-04", "B-12", "C-08", "D-15", "E-20"];
    setGateNumber(gates[Math.floor(Math.random() * gates.length)]);
  }, []);

  // Update Flight seat and codes based on selectors
  useEffect(() => {
    const code = selectedAirline.code;
    const num = selectedAircraft.id === "a380" ? "380" : selectedAircraft.id === "b777" ? "777" : selectedAircraft.id === "a350" ? "350" : "787";
    setFlightNumber(`${code} ${num}`);

    let row = 4;
    let suffix = "A";
    if (selectedClass.id === "first") {
      row = Math.floor(Math.random() * 2) + 1;
      suffix = ["A", "D"][Math.floor(Math.random() * 2)];
    } else if (selectedClass.id === "business") {
      row = Math.floor(Math.random() * 5) + 4;
      suffix = ["A", "C", "F"][Math.floor(Math.random() * 3)];
    } else if (selectedClass.id === "premium") {
      row = Math.floor(Math.random() * 5) + 12;
      suffix = ["A", "B", "D", "J"][Math.floor(Math.random() * 4)];
    } else {
      row = Math.floor(Math.random() * 15) + 24;
      suffix = ["A", "B", "D", "J"][Math.floor(Math.random() * 4)];
    }
    setSeatNumber(`${row}${suffix}`);
  }, [selectedAirline, selectedClass, selectedAircraft]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/journey/boarding-pass?subject=${encodeURIComponent(studySubject)}&duration=${studyDuration}&airline=${selectedAirline.id}&aircraft=${selectedAircraft.id}&class=${selectedClass.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = `✈️ Boarding my study voyage on GoFocusGen! \n\n📚 Focus: ${studySubject}\n⏱️ Duration: ${studyDuration} mins\n✈️ Fleet: ${selectedAircraft.name} (${selectedClass.name})\n\nGenerate your beautiful study boarding pass here:`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleStartSession = async () => {
    if (!studySubject.trim()) {
      alert("⚠️ Please enter a focus subject before boarding.");
      return;
    }
    setIsTakingOff(true);

    try {
      // Direct session booking!
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: route.origin,
          originCode: route.originCode,
          destination: route.destination,
          destinationCode: route.destinationCode,
          transportMode: "FLIGHT",
          duration: studyDuration,
          mode: sessionMode,
          isPrivate: false,
        }),
      });

      if (!res.ok) throw new Error("API call failed");
      const data = await res.json() as { session: { id: string } };
      
      // Save configuration settings
      const flightConfig = {
        sessionId: data.session.id,
        airline: selectedAirline,
        cabinClass: selectedClass,
        aircraft: selectedAircraft,
        seatNumber,
        flightNumber,
        gateNumber,
        studySubject: studySubject.trim(),
        mode: sessionMode,
        storeInCloset: storeInCloset,
      };
      localStorage.setItem(`flight_config_${data.session.id}`, JSON.stringify(flightConfig));

      setTimeout(() => router.push(`/session/${data.session.id}/boarding`), 2500);
    } catch (err) {
      console.warn("API fallback to offline mock launch:", err);
      const mockSessionId = `mock-${Math.random().toString(36).substring(2, 11)}`;
      const mockSession = {
        id: mockSessionId,
        origin: route.origin,
        originCode: route.originCode,
        destination: route.destination,
        destinationCode: route.destinationCode,
        transportMode: "FLIGHT",
        duration: studyDuration,
        mode: sessionMode,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`flight_session_${mockSessionId}`, JSON.stringify(mockSession));
      
      const flightConfig = {
        sessionId: mockSessionId,
        airline: selectedAirline,
        cabinClass: selectedClass,
        aircraft: selectedAircraft,
        seatNumber,
        flightNumber,
        gateNumber,
        studySubject: studySubject.trim(),
        mode: sessionMode,
        storeInCloset: storeInCloset,
      };
      localStorage.setItem(`flight_config_${mockSessionId}`, JSON.stringify(flightConfig));

      setTimeout(() => router.push(`/session/${mockSessionId}/boarding`), 2500);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050a17] text-white selection:bg-[#0ea5e9] selection:text-white pb-20">
      {/* Background visual engine */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top, ${aircraftTheme.accentColor}08 0%, transparent 60%), #050a17`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] z-0 opacity-30" />

      {/* Takeoff overlay */}
      <AnimatePresence>
        {isTakingOff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: "-100%", x: `${Math.random() * 100}%` }}
                  animate={{ y: "150%" }}
                  transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, ease: "linear", delay: Math.random() * 0.4 }}
                  className="absolute w-[1px] h-[12vh] bg-gradient-to-b from-transparent via-white/30 to-transparent"
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ scale: [1, 1.2, 4], y: [0, -40, -500], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            >
              <Plane className="size-20 rotate-[315deg]" style={{ color: aircraftTheme.accentColor, filter: `drop-shadow(0 0 25px ${aircraftTheme.accentColor})` }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.2, times: [0, 0.4, 0.9] }}
              className="text-center mt-10"
            >
              <h2 className="font-['Space_Grotesk',system-ui] text-2xl font-extrabold tracking-widest text-white uppercase">
                Locking Manifest
              </h2>
              <p className="mt-1 text-xs font-mono tracking-widest animate-pulse" style={{ color: aircraftTheme.accentColor }}>
                CHARTERING VOYAGE CODES...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/journey" className="flex items-center gap-2 text-white/50 hover:text-white transition text-xs font-semibold bg-white/5 px-3.5 py-2 rounded-xl border border-white/5">
            <ChevronLeft className="size-4" /> Journey Planner
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-xs font-mono tracking-widest text-white/40 uppercase">Aesthetic Socials Generator</span>
        </div>

        <div className="mb-10">
          <span className="rounded-full px-3 py-1 text-[10px] font-extrabold border bg-amber-500/10 border-amber-500/20 text-amber-400 uppercase tracking-widest">
            🎫 Boarding Pass Generator
          </span>
          <h1 className="mt-3 font-['Space_Grotesk',system-ui] text-3xl font-black tracking-tight text-white sm:text-5xl">
            Design Your Study ticket
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            Create an ultra-premium, customized aviation boarding pass showing your study goals. Share it with your friends, post it on social media, or instantly board the flight!
          </p>
        </div>

        {/* Dynamic selector workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel options form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Subject & Time */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-5">
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-lg flex items-center justify-center text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>✍️</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-base font-bold">Focus Subject & Duration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1.5">What are you studying?</label>
                  <input
                    type="text"
                    value={studySubject}
                    onChange={(e) => setStudySubject(e.target.value.substring(0, 30))}
                    placeholder="e.g. Next.js App Router, Organic Chemistry..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Study Flight Duration</label>
                    <span className="text-xs font-mono font-bold text-amber-400">{studyDuration} minutes ({Math.round(studyDuration/60 * 10)/10} hrs)</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="480"
                    step="5"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 font-mono mt-1">
                    <span>25m (Short)</span>
                    <span>120m (Cruise)</span>
                    <span>240m (Long-Haul)</span>
                    <span>480m (Ultra Cruise)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selector: Carrier */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-lg flex items-center justify-center text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>01</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-base font-bold">Select Airline Carrier</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AIRLINES.map((airline) => {
                  const isSelected = selectedAirline.id === airline.id;
                  return (
                    <button
                      key={airline.id}
                      onClick={() => setSelectedAirline(airline)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        isSelected 
                          ? `bg-gradient-to-r ${airline.color} border-white/25 shadow-lg ${airline.glow}`
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-lg border font-['Space_Grotesk',system-ui] font-extrabold text-[10px] flex items-center justify-center"
                          style={{
                            color: airline.hslColor,
                            borderColor: isSelected ? airline.hslColor : `${airline.hslColor}30`,
                            backgroundColor: `${airline.hslColor}10`,
                          }}
                        >
                          {airline.abbrev}
                        </div>
                        <div>
                          <p className={`font-bold text-xs ${isSelected ? airline.textGlow : "text-white/80"}`}>{airline.name}</p>
                          <p className="text-[9px] text-white/40">{airline.badge}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-yellow-500 font-bold">+{airline.baseMultiplier}x</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector: Aircraft model */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-lg flex items-center justify-center text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>02</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-base font-bold">Select Aircraft Model</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AIRCRAFT_MODELS.map((aircraft) => {
                  const isSelected = selectedAircraft.id === aircraft.id;
                  const theme = AIRCRAFT_THEMES[aircraft.id];
                  return (
                    <button
                      key={aircraft.id}
                      onClick={() => setSelectedAircraft(aircraft)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? `${theme.selectedStyle} border-white/20 shadow-md`
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/60">
                          {theme.techLabel}
                        </span>
                        {isSelected && <Zap className="size-3" style={{ color: theme.accentColor }} />}
                      </div>
                      <p className="font-bold text-xs" style={isSelected ? { color: theme.accentColor } : {}}>{aircraft.name}</p>
                      <p className="text-[9px] text-white/40 mt-1 line-clamp-1">{aircraft.shield}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector: Cabin seating class */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-lg flex items-center justify-center text-xs font-bold font-mono" style={{ backgroundColor: `${aircraftTheme.accentColor}20`, color: aircraftTheme.accentColor }}>03</span>
                <h3 className="font-['Space_Grotesk',system-ui] text-base font-bold">Select Cabin Seating Class</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CABIN_CLASSES.map((cabin) => {
                  const isSelected = selectedClass.id === cabin.id;
                  return (
                    <button
                      key={cabin.id}
                      onClick={() => setSelectedClass(cabin)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "border-white/20"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                      }`}
                      style={isSelected ? {
                        backgroundColor: `${aircraftTheme.accentColor}10`,
                        borderColor: `${aircraftTheme.accentColor}40`,
                      } : {}}
                    >
                      <p className="font-bold text-xs" style={isSelected ? { color: aircraftTheme.accentColor } : {}}>{cabin.name.split(" ")[0]}</p>
                      <p className="text-[9px] text-white/40 mt-0.5">{cabin.desc.split(" · ")[0]}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode selection toggle */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold">Cockpit Focus Severity</h4>
                <p className="text-xs text-white/40 mt-0.5">Hardcore blocks navigation to other websites during session</p>
              </div>
              <div className="flex bg-navy-950 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setSessionMode("CHILL")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    sessionMode === "CHILL" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  Chill 🌾
                </button>
                <button
                  onClick={() => setSessionMode("HARDCORE")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    sessionMode === "HARDCORE" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-white/40 hover:text-white"
                  }`}
                >
                  Hardcore 🔥
                </button>
              </div>
            </div>

            {/* Store in Closet switch */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold flex items-center gap-1.5">🗄️ Store in Closet</h4>
                <p className="text-xs text-white/40 mt-0.5">Collect this boarding ticket in your profile past stamp log closet</p>
              </div>
              <button
                type="button"
                onClick={() => setStoreInCloset(!storeInCloset)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  storeInCloset ? 'bg-amber-500' : 'bg-white/10'
                }`}
              >
                <span className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  storeInCloset ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          {/* Right Panel Boarding Pass card preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-6">
            
            <div className="text-center lg:text-left">
              <h3 className="font-['Space_Grotesk',system-ui] text-xs font-black tracking-widest uppercase" style={{ color: aircraftTheme.accentColor }}>
                Digital Boarding Pass Preview
              </h3>
              <p className="text-xs text-white/35 mt-1">
                {selectedAircraft.name} · Live styling preview
              </p>
            </div>

            {/* PREMIUM BOARDING PASS CARD */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl border"
              style={{
                borderColor: `${aircraftTheme.accentColor}30`,
                background: `linear-gradient(135deg, ${aircraftTheme.accentColor}08, rgba(5,10,23,0.96))`,
                boxShadow: `0 20px 60px ${aircraftTheme.accentColor}10`,
              }}
            >
              {/* Aircraft accent stripe */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${aircraftTheme.accentColor}, transparent)` }} />

              {/* Airline header banner */}
              <div className={`p-4 bg-gradient-to-r ${selectedAirline.color} border-b border-white/8 flex items-center justify-between`}>
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
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border" style={{ color: aircraftTheme.accentColor, borderColor: `${aircraftTheme.accentColor}30`, backgroundColor: `${aircraftTheme.accentColor}10` }}>
                    {selectedAircraft.id.toUpperCase()}
                  </span>
                  <div className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase">{flightNumber}</div>
                </div>
              </div>

              {/* Passenger ticket interior details */}
              <div className="p-6 space-y-5">
                
                {/* Flight Route Codes */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">{route.originCode}</h2>
                    <p className="text-xs text-white/40 truncate mt-1">{route.origin.split(" Airport")[0]}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1.5">{studyDuration} min</span>
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
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">{route.destinationCode}</h2>
                    <p className="text-xs text-white/40 truncate mt-1">{route.destination.split(" Airport")[0]}</p>
                  </div>
                </div>

                {/* Simulated ticket perforation */}
                <div className="relative h-4 flex items-center justify-between">
                  <div className="absolute left-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-l-transparent z-10" />
                  <div className="w-full border-t border-dashed border-white/10" />
                  <div className="absolute right-[-28px] size-6 rounded-full bg-[#050a17] border border-white/12 border-r-transparent z-10" />
                </div>

                {/* Ticket Details Grid */}
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
                    <p className="font-bold text-emerald-400 mt-0.5">{sessionMode}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Closet Status</p>
                    <p className={`font-bold mt-0.5 ${storeInCloset ? 'text-amber-400 font-semibold' : 'text-white/40'}`}>{storeInCloset ? '🗄️ Stored' : '❌ Private'}</p>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-3">
                    <p className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Study Focus</p>
                    <p className="font-bold text-yellow-400 mt-0.5 truncate">📚 {studySubject || "Focus Voyage Study"}</p>
                  </div>
                </div>

                {/* Focus Shield info badge */}
                <div
                  className="rounded-2xl p-3 flex items-center justify-between gap-3 border"
                  style={{ backgroundColor: `${aircraftTheme.accentColor}08`, borderColor: `${aircraftTheme.accentColor}25` }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 shrink-0" style={{ color: aircraftTheme.accentColor }} />
                    <div>
                      <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: aircraftTheme.accentColor }}>Focus Shield Active</p>
                      <p className="text-[9px] text-white/45">🛡️ {selectedAircraft.shield}</p>
                    </div>
                  </div>
                  <Award className="size-5 shrink-0" style={{ color: aircraftTheme.accentColor }} />
                </div>

                {/* Barcode scanner laser box */}
                <div className="border-t border-white/5 pt-4 flex flex-col items-center">
                  <div className="w-full h-10 bg-white/4 rounded-md flex items-center justify-center p-1.5 relative overflow-hidden border border-white/5 opacity-70">
                    <div className="flex justify-between w-full h-full opacity-50">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div key={i} className="bg-white" style={{ width: `${[1, 2, 3, 1, 4, 1, 2][i % 7]}px`, opacity: i % 4 === 0 ? 0.3 : 1 }} />
                      ))}
                    </div>
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-[2px] opacity-70"
                      style={{ backgroundColor: aircraftTheme.accentColor, boxShadow: `0 0 8px ${aircraftTheme.accentColor}` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-white/20 tracking-[0.35em] uppercase mt-2">
                    GoFocusGen-{studySubject.substring(0, 3).toUpperCase() || "VOY"}
                  </span>
                </div>

              </div>
            </div>

            {/* ACTION TRIGGERS & SHARING */}
            <div className="space-y-3">
              <button
                onClick={handleStartSession}
                className="w-full relative group rounded-3xl py-4.5 font-['Space_Grotesk',system-ui] text-sm font-extrabold tracking-widest text-white flex items-center justify-center gap-3 transition-all hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${aircraftTheme.accentColor}, ${aircraftTheme.accentColor}cc)`,
                  boxShadow: `0 8px 24px ${aircraftTheme.accentColor}25`,
                }}
              >
                <Plane className="size-4 rotate-[45deg] transition group-hover:translate-x-1" />
                <span>BOARD FLIGHT / START</span>
                <ArrowRight className="size-4 shrink-0" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition"
                >
                  {copied ? (
                    <><Check className="size-4 text-emerald-400" /> Link Copied!</>
                  ) : (
                    <><Copy className="size-4" /> Copy Share Link</>
                  )}
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition"
                >
                  <TwitterIcon className="size-4 text-[#1da1f2] fill-current" /> Share to X
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
