"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Compass, History, Globe, Sparkles, Navigation, Shield, Play, 
  MapPin, Clock, Award, Landmark, User, Heart, ChevronRight, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CityHub {
  id: string;
  name: string;
  code: string;
  x: number; // SVG coordinate percent
  y: number; // SVG coordinate percent
  country: string;
  timezone: string;
  description: string;
  preferredDestinations: string[]; // List of other city IDs
}

const GLOBAL_HUBS: CityHub[] = [
  { 
    id: "dxb", 
    name: "Dubai", 
    code: "DXB", 
    x: 52, 
    y: 43, 
    country: "UAE", 
    timezone: "GMT+4", 
    description: "Ultra-modern desert metropolis, gateway between East and West.",
    preferredDestinations: ["blr", "hyd", "lhr", "sin"] 
  },
  { 
    id: "blr", 
    name: "Bengaluru", 
    code: "BLR", 
    x: 65, 
    y: 52, 
    country: "India", 
    timezone: "GMT+5:30", 
    description: "The Silicon Valley of India, beautiful gardens and tech hubs.",
    preferredDestinations: ["dxb", "hyd", "sin", "hnd"] 
  },
  { 
    id: "hyd", 
    name: "Hyderabad", 
    code: "HYD", 
    x: 64, 
    y: 49, 
    country: "India", 
    timezone: "GMT+5:30", 
    description: "Historic City of Pearls, famous for biryani and high-tech parks.",
    preferredDestinations: ["dxb", "blr", "sin", "lhr"] 
  },
  { 
    id: "sin", 
    name: "Singapore", 
    code: "SIN", 
    x: 74, 
    y: 60, 
    country: "Singapore", 
    timezone: "GMT+8", 
    description: "Futuristic garden city state, financial capital of Southeast Asia.",
    preferredDestinations: ["dxb", "blr", "hyd", "syd", "hnd"] 
  },
  { 
    id: "lhr", 
    name: "London", 
    code: "LHR", 
    x: 38, 
    y: 28, 
    country: "United Kingdom", 
    timezone: "GMT+1", 
    description: "Vibrant global cultural center, historic architecture and financial hub.",
    preferredDestinations: ["dxb", "jfk", "hyd"] 
  },
  { 
    id: "jfk", 
    name: "New York", 
    code: "JFK", 
    x: 20, 
    y: 33, 
    country: "United States", 
    timezone: "GMT-4", 
    description: "The Big Apple, spectacular skyscrapers, global media and finance capital.",
    preferredDestinations: ["lhr", "syd"] 
  },
  { 
    id: "hnd", 
    name: "Tokyo", 
    code: "HND", 
    x: 86, 
    y: 38, 
    country: "Japan", 
    timezone: "GMT+9", 
    description: "High-tech metropolis blending neon skyscrapers and ancient temples.",
    preferredDestinations: ["sin", "blr", "syd"] 
  },
  { 
    id: "syd", 
    name: "Sydney", 
    code: "SYD", 
    x: 88, 
    y: 78, 
    country: "Australia", 
    timezone: "GMT+10", 
    description: "Stunning harbor city, famous opera house and sun-drenched beaches.",
    preferredDestinations: ["sin", "jfk", "hnd"] 
  },
];

interface TravelHistoryItem {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  transportMode: string;
  duration: number;
  mode: string;
  completedAt: string;
}

export default function InteractiveMapPage() {
  const router = useRouter();
  
  // Selection states
  const [selectedCity, setSelectedCity] = useState<CityHub | null>(GLOBAL_HUBS[1]); // Default to Bengaluru
  const [origin, setOrigin] = useState<CityHub | null>(null);
  const [destination, setDestination] = useState<CityHub | null>(null);
  
  // Customizer & user details
  const [userCoins, setUserCoins] = useState<number>(0);
  const [travelHistory, setTravelHistory] = useState<TravelHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "routes" | "history">("details");
  
  // Session creation details
  const [sessionMode, setSessionMode] = useState<"CHILL" | "HARDCORE">("CHILL");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Load user profile & travel history on mount
  useEffect(() => {
    // 1. Fetch user coins from local manifest or DB
    const cached = localStorage.getItem("flightedu_onboarding");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.coins !== undefined) setUserCoins(parsed.coins);
      } catch {}
    }

    fetch("/api/user/onboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.coins !== undefined) {
          setUserCoins(data.user.coins);
        }
      })
      .catch(() => {});

    // 2. Fetch travel history
    setHistoryLoading(true);
    fetch("/api/sessions/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) {
          const mapped = data.history.map((h: any) => ({
            id: h.id,
            origin: h.session.origin,
            originCode: h.session.originCode,
            destination: h.session.destination,
            destinationCode: h.session.destinationCode,
            transportMode: h.session.transportMode,
            duration: h.session.duration,
            mode: h.session.mode,
            completedAt: h.joinedAt ? new Date(h.joinedAt).toLocaleDateString() : "Recently",
          }));
          setTravelHistory(mapped);
        }
      })
      .catch(() => {
        // Fallback mock history if offline
        setTravelHistory([
          { id: "h1", origin: "Dubai", originCode: "DXB", destination: "Bengaluru", destinationCode: "BLR", transportMode: "FLIGHT", duration: 180, mode: "CHILL", completedAt: "2026-05-20" },
          { id: "h2", origin: "Bengaluru", originCode: "BLR", destination: "Hyderabad", destinationCode: "HYD", transportMode: "FLIGHT", duration: 60, mode: "CHILL", completedAt: "2026-05-22" },
        ]);
      })
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSelectCity = (city: CityHub) => {
    setSelectedCity(city);
    // If setting route
    if (origin && !destination && origin.id !== city.id) {
      setDestination(city);
    }
  };

  const handleSetOrigin = (city: CityHub) => {
    setOrigin(city);
    if (destination?.id === city.id) {
      setDestination(null);
    }
  };

  const handleSetDestination = (city: CityHub) => {
    setDestination(city);
    if (origin?.id === city.id) {
      setOrigin(null);
    }
  };

  const handleResetRoute = () => {
    setOrigin(null);
    setDestination(null);
    setErrorText(null);
  };

  const handleBoardFlight = async () => {
    if (!origin || !destination) return;

    if (isPrivate && userCoins < 300) {
      setErrorText("Insufficient coins: You need at least 300 focus coins to charter a private flight.");
      return;
    }

    setCreatingSession(true);
    setErrorText(null);

    // Calculate mock flight parameters
    const dx = Math.abs(origin.x - destination.x);
    const dy = Math.abs(origin.y - destination.y);
    const distanceVal = Math.sqrt(dx * dx + dy * dy);
    // 1 percent coordinate diff = approx 120km, flight duration = approx 10 minutes per 1000km
    const durationMinutes = Math.max(30, Math.round(distanceVal * 6));

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.name,
          originCode: origin.code,
          destination: destination.name,
          destinationCode: destination.code,
          transportMode: "FLIGHT",
          duration: durationMinutes,
          mode: sessionMode,
          isPrivate: isPrivate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Server error");
      }

      const data = await res.json() as { session: { id: string } };

      // Deduct coins locally in cache for instant updates
      if (isPrivate) {
        const cached = localStorage.getItem("flightedu_onboarding");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.coins = Math.max(0, userCoins - 300);
            localStorage.setItem("flightedu_onboarding", JSON.stringify(parsed));
          } catch {}
        }
      }

      router.push(`/session/${data.session.id}/boarding`);
    } catch (err: any) {
      console.warn("DB offline takeover engaging:", err);
      // Fallback offline session manifest
      const mockSessionId = `mock-${Math.random().toString(36).substring(2, 11)}`;
      const mockSession = {
        id: mockSessionId,
        origin: origin.name,
        originCode: origin.code,
        destination: destination.name,
        destinationCode: destination.code,
        transportMode: "FLIGHT",
        duration: durationMinutes,
        mode: sessionMode,
        isPrivate: isPrivate,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`flight_session_${mockSessionId}`, JSON.stringify(mockSession));
      router.push(`/session/${mockSessionId}/boarding`);
    } finally {
      setCreatingSession(false);
    }
  };

  // Helper to draw a smooth SVG arc curve between two percentages
  const getSvgArcPath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Displace center control point of quadratic bezier curve upwards to make a nice flight arc
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Displace perpendicular to direction
    const offset = Math.min(60, distance * 0.4);
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    
    const cx = mx + Math.cos(angle) * offset;
    const cy = my + Math.sin(angle) * offset;
    
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#070b19] text-white">
      {/* Dynamic Starfield & Nebula Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-950/40 via-navy-950 to-black z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:28px_28px] opacity-40 z-0" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 bg-gradient-to-b from-[#070b19] to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <div>
            <span className="font-display text-sm font-black text-white tracking-widest uppercase block">Radar Navigation Map</span>
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">VoyageIQ Global Flight Grid</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-400 font-bold text-xs tracking-wide shadow-[0_0_8px_rgba(245,158,11,0.15)] select-none">
            <span>🪙</span>
            <span>{userCoins}</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            ←
          </button>
        </div>
      </header>

      {/* Main Grid: Left Map, Right Panel */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6 overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: Map Viewport (svg flight board) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#0a0f26]/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="rounded-full bg-electric-500/15 border border-electric-500/30 px-3 py-1 text-[8.5px] font-bold text-electric-400 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <span className="size-1.5 rounded-full bg-electric-400 animate-ping" />
              Live Transponder Active
            </span>
            {origin && (
              <button
                onClick={handleResetRoute}
                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[8.5px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1"
              >
                Clear Route
              </button>
            )}
          </div>

          <div className="absolute top-4 right-4 z-20 text-right font-mono text-[8px] text-white/30 hidden sm:block leading-tight">
            <span>RADAR UNIT #28A</span><br />
            <span>GRID SYSTEM ACTIVE</span>
          </div>

          {/* THE SVG WORLD MAP FLIGHT TELEMETRY GRID */}
          <div className="flex-1 min-h-[300px] lg:min-h-[450px] relative flex items-center justify-center p-2">
            
            {/* SVG Flight Deck Board */}
            <svg 
              className="absolute inset-0 w-full h-full select-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Neon route gradients */}
                <linearGradient id="neon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="neon-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="neon-green" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
                </linearGradient>

                {/* Grid line pattern */}
                <pattern id="grid-dots" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="rgba(255,255,255,0.04)" />
                </pattern>
              </defs>

              {/* Background pattern */}
              <rect width="100%" height="100%" fill="url(#grid-dots)" />

              {/* Draw latitude/longitude flight deck lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="40" y1="0" x2="40" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="60" y1="0" x2="60" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />
              <line x1="80" y1="0" x2="80" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.15" />

              {/* Draw abstract continent paths for aesthetic styling (cyber grid style) */}
              {/* North America */}
              <path d="M 5 20 Q 15 22 25 35 T 28 50 T 20 52 Z" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />
              {/* South America */}
              <path d="M 22 55 Q 26 65 28 85 T 32 95 Z" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />
              {/* Eurasia / Africa */}
              <path d="M 35 15 Q 50 18 68 25 T 88 35 T 92 50 T 78 68 Z" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />
              {/* Australia */}
              <path d="M 80 72 Q 88 74 92 82 T 84 90 Z" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.02)" strokeWidth="0.1" />

              {/* DRAW PREFERRED ROUTES OF SELECTED CITY (glowing cyan curves) */}
              {selectedCity && !origin && !destination && selectedCity.preferredDestinations.map((destId) => {
                const dest = GLOBAL_HUBS.find((h) => h.id === destId);
                if (!dest) return null;
                const pathStr = getSvgArcPath(selectedCity.x, selectedCity.y, dest.x, dest.y);
                return (
                  <g key={dest.id}>
                    {/* Outer glowing path */}
                    <motion.path 
                      d={pathStr}
                      fill="transparent"
                      stroke="#38bdf8"
                      strokeWidth="0.6"
                      opacity="0.25"
                    />
                    {/* Animated dash line */}
                    <motion.path 
                      d={pathStr}
                      fill="transparent"
                      stroke="url(#neon-cyan)"
                      strokeWidth="0.4"
                      strokeDasharray="4 2"
                      animate={{ strokeDashoffset: [-12, 0] }}
                      transition={{ ease: "linear", duration: 1.5, repeat: Infinity }}
                    />
                  </g>
                );
              })}

              {/* DRAW CURRENT ACTIVE PLANNED FLIGHT ROUTE (glowing amber animated path) */}
              {origin && destination && (() => {
                const pathStr = getSvgArcPath(origin.x, origin.y, destination.x, destination.y);
                return (
                  <g>
                    {/* Deep glow background line */}
                    <motion.path 
                      d={pathStr}
                      fill="transparent"
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                      opacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Solid line */}
                    <motion.path 
                      d={pathStr}
                      fill="transparent"
                      stroke="#fbbf24"
                      strokeWidth="0.6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    {/* Telemetry pulse point */}
                    <motion.path 
                      d={pathStr}
                      fill="transparent"
                      stroke="url(#neon-amber)"
                      strokeWidth="0.5"
                      strokeDasharray="5 3"
                      animate={{ strokeDashoffset: [-16, 0] }}
                      transition={{ ease: "linear", duration: 1.2, repeat: Infinity }}
                    />
                  </g>
                );
              })()}

              {/* DRAW COMPLETED HISTORY FLIGHTS (glowing green dashed curves) */}
              {travelHistory.map((item, idx) => {
                const oCity = GLOBAL_HUBS.find((h) => h.code === item.originCode);
                const dCity = GLOBAL_HUBS.find((h) => h.code === item.destinationCode);
                if (!oCity || !dCity) return null;
                const pathStr = getSvgArcPath(oCity.x, oCity.y, dCity.x, dCity.y);
                return (
                  <g key={`${item.id}-${idx}`}>
                    <path 
                      d={pathStr}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="0.3"
                      strokeDasharray="2 3"
                      opacity="0.3"
                    />
                  </g>
                );
              })}

            </svg>

            {/* DRAW CITY INTERACTIVE PINS */}
            {GLOBAL_HUBS.map((city) => {
              const isSelected = selectedCity?.id === city.id;
              const isOrigin = origin?.id === city.id;
              const isDest = destination?.id === city.id;
              
              return (
                <div
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                  style={{ top: `${city.y}%`, left: `${city.x}%` }}
                >
                  <div className="relative group flex flex-col items-center">
                    
                    {/* Ring highlight animation for states */}
                    <AnimatePresence>
                      {(isSelected || isOrigin || isDest) && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.2, repeat: Infinity }}
                          className={`absolute inset-[-10px] rounded-full border-2 ${
                            isOrigin 
                              ? "border-emerald-400" 
                              : isDest 
                              ? "border-amber-400" 
                              : "border-electric-400"
                          } pointer-events-none`}
                        />
                      )}
                    </AnimatePresence>

                    {/* Glowing Core Pin */}
                    <div 
                      className={`size-3 rounded-full border-2 shadow-lg transition duration-300 ${
                        isOrigin
                          ? "bg-emerald-400 border-white shadow-emerald-500/40"
                          : isDest
                          ? "bg-amber-400 border-white shadow-amber-500/40"
                          : isSelected
                          ? "bg-electric-400 border-white shadow-electric-500/40 scale-125"
                          : "bg-navy-950 border-white/40 hover:bg-white hover:scale-110"
                      }`}
                    />

                    {/* HUD Label display */}
                    <div className="mt-1 px-1.5 py-0.5 rounded-md bg-[#0a0f26]/80 border border-white/5 backdrop-blur-sm text-[7.5px] font-mono tracking-wider font-extrabold uppercase shadow-sm pointer-events-none">
                      <span className={
                        isOrigin
                          ? "text-emerald-400"
                          : isDest
                          ? "text-amber-400"
                          : isSelected
                          ? "text-electric-400"
                          : "text-white/60"
                      }>
                        {city.code}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

          {/* Map Footer overlay info */}
          <div className="p-4 border-t border-white/5 bg-navy-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/50 font-mono">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-electric-400" />
                <span>Selected Airport</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Origin Departure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Destination Arrival</span>
              </div>
              {travelHistory.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-[1px] border-t border-dashed border-[#10b981]" />
                  <span>Traveled Routes</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-white/30 font-mono">
              HUD SCALE 1.0 • VOYAGEIQ RADAR
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Holographic Control Panel / Boarding Hub */}
        <div className="lg:col-span-4 flex flex-col h-full bg-[#0a0f26]/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Tabs selector */}
          <div className="flex bg-navy-950 border-b border-white/5 p-1 shrink-0">
            {[
              { id: "details", label: "Hub manifest" },
              { id: "routes", label: "Preferred" },
              { id: "history", label: "Flight log" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-[8.5px] font-mono font-bold tracking-widest uppercase rounded-lg transition duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white/5 text-white border border-white/10"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[300px] lg:max-h-[380px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <AnimatePresence mode="wait">
              {activeTab === "details" && selectedCity && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4 text-xs"
                >
                  {(() => {
                    const isOrigin = origin?.id === selectedCity.id;
                    const isDest = destination?.id === selectedCity.id;
                    return (
                      <>
                  {/* City Hub Overview */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-electric-500/10 px-2 py-0.5 text-[9px] font-bold text-electric-400 border border-electric-500/20">
                        {selectedCity.country}
                      </span>
                      <h3 className="font-display text-lg font-bold text-white mt-1.5">
                        {selectedCity.name} Hub
                      </h3>
                      <p className="text-[10px] text-white/45 font-mono mt-0.5">TIMEZONE: {selectedCity.timezone}</p>
                    </div>
                    <span className="text-3xl font-mono font-black text-white/10">{selectedCity.code}</span>
                  </div>

                  <p className="text-white/60 leading-relaxed bg-white/4 border border-white/5 rounded-2xl p-4 italic">
                    “{selectedCity.description}”
                  </p>

                  {/* Set Route Pins */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleSetOrigin(selectedCity)}
                      className={`py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-wider transition ${
                        isOrigin
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-white/4 border-white/5 hover:border-white/12 text-white/70 hover:text-white"
                      }`}
                    >
                      🛫 SET DEPARTURE
                    </button>
                    <button
                      onClick={() => handleSetDestination(selectedCity)}
                      className={`py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-wider transition ${
                        isDest
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-white/4 border-white/5 hover:border-white/12 text-white/70 hover:text-white"
                      }`}
                    >
                      🛬 SET ARRIVAL
                    </button>
                  </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {activeTab === "routes" && selectedCity && (
                <motion.div
                  key="routes"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <h4 className="font-display text-[9px] font-bold tracking-widest text-white/40 uppercase mb-4">
                    Preferred Routes from {selectedCity.name}
                  </h4>

                  <div className="space-y-2">
                    {selectedCity.preferredDestinations.map((destId) => {
                      const dest = GLOBAL_HUBS.find((h) => h.id === destId);
                      if (!dest) return null;

                      // Calculate mock duration
                      const dx = Math.abs(selectedCity.x - dest.x);
                      const dy = Math.abs(selectedCity.y - dest.y);
                      const distanceVal = Math.sqrt(dx * dx + dy * dy);
                      const durationMinutes = Math.max(30, Math.round(distanceVal * 6));

                      return (
                        <button
                          key={dest.id}
                          onClick={() => {
                            setOrigin(selectedCity);
                            setDestination(dest);
                            setSelectedCity(dest);
                          }}
                          className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/4 hover:bg-white/8 hover:border-white/10 transition text-left text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">✈️</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{selectedCity.code}</span>
                                <ChevronRight className="size-3 text-white/30" />
                                <span className="font-bold text-white">{dest.code}</span>
                              </div>
                              <p className="text-[10px] text-white/45 truncate mt-0.5">{dest.name}, {dest.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-electric-400 font-mono">{durationMinutes} min</span>
                            <span className="text-[9px] text-white/30 block mt-0.5">Focus Mode</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <h4 className="font-display text-[9px] font-bold tracking-widest text-white/40 uppercase mb-4">
                    Your Travel History logs
                  </h4>

                  {historyLoading ? (
                    <div className="text-center py-8">
                      <div className="size-6 rounded-full border-2 border-electric-500 border-t-transparent animate-spin mx-auto mb-2" />
                      <p className="text-[10px] font-mono text-white/40">Loading Flight logs...</p>
                    </div>
                  ) : travelHistory.length === 0 ? (
                    <div className="text-center py-10 bg-white/4 border border-white/5 rounded-2xl">
                      <History className="size-6 text-white/20 mx-auto mb-2" />
                      <p className="text-[11px] font-bold text-white/60">No Flights Completed</p>
                      <p className="text-[9px] text-white/30 max-w-[150px] mx-auto mt-1 leading-relaxed">
                        Successfully complete study flight sessions to build your route history map!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {travelHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 text-left text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base text-emerald-400">✓</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{item.originCode}</span>
                                <ChevronRight className="size-3 text-white/30" />
                                <span className="font-bold text-white">{item.destinationCode}</span>
                              </div>
                              <p className="text-[10px] text-white/45 mt-0.5">Flight Completed: {item.completedAt}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">+{Math.round(item.duration * 0.05 * 10)} XP</span>
                            <span className="text-[8px] font-mono bg-white/5 rounded px-1 text-white/45 block mt-1 uppercase">{item.mode}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LOWER SECTION: Direct Boarding Manifest (opens when origin & destination chosen!) */}
          <div className="p-5 border-t border-white/5 bg-navy-950 shrink-0">
            <AnimatePresence mode="wait">
              {origin && destination ? (() => {
                // Calculate distance and duration
                const dx = Math.abs(origin.x - destination.x);
                const dy = Math.abs(origin.y - destination.y);
                const distanceVal = Math.sqrt(dx * dx + dy * dy);
                const durationMinutes = Math.max(30, Math.round(distanceVal * 6));

                return (
                  <motion.div
                    key="boarding-manifest"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="space-y-4 text-xs"
                  >
                    {/* Routing display */}
                    <div className="flex items-center justify-between bg-white/4 border border-white/5 p-3 rounded-2xl">
                      <div className="text-center">
                        <span className="font-mono text-base font-extrabold text-white">{origin.code}</span>
                        <p className="text-[9px] text-white/45 mt-0.5 truncate max-w-[60px]">{origin.name}</p>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center px-2">
                        <span className="text-[8px] font-mono text-electric-400 font-bold uppercase">{durationMinutes} min flight</span>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative mt-1">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-electric-400 flex items-center justify-center shadow-lg">
                            <span className="text-[8px]">✈️</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="font-mono text-base font-extrabold text-white">{destination.code}</span>
                        <p className="text-[9px] text-white/45 mt-0.5 truncate max-w-[60px]">{destination.name}</p>
                      </div>
                    </div>

                    {/* Flight mode settings */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSessionMode(sessionMode === "CHILL" ? "HARDCORE" : "CHILL")}
                        className={`p-2.5 rounded-xl border transition text-left flex flex-col ${
                          sessionMode === "HARDCORE"
                            ? "border-red-500/40 bg-red-500/5 text-red-400"
                            : "border-white/5 bg-white/4 text-white/70 hover:text-white"
                        }`}
                      >
                        <span className="text-[7.5px] font-mono font-bold uppercase text-white/45 mb-0.5">Flight Mode</span>
                        <span className="text-[10px] font-bold">{sessionMode === "CHILL" ? "😌 Chill Mode" : "😈 Hardcore"}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (userCoins >= 300) {
                            setIsPrivate(!isPrivate);
                          } else {
                            alert(`Insufficient coins: You need at least 300 focus coins to charter a private flight (Current Balance: 🪙 ${userCoins}).`);
                          }
                        }}
                        className={`p-2.5 rounded-xl border transition text-left flex flex-col ${
                          isPrivate
                            ? "border-yellow-500/40 bg-yellow-500/5 text-yellow-400"
                            : "border-white/5 bg-white/4 text-white/70 hover:text-white"
                        }`}
                      >
                        <span className="text-[7.5px] font-mono font-bold uppercase text-white/45 mb-0.5">Privacy settings</span>
                        <span className="text-[10px] font-bold">{isPrivate ? "🔒 Private Charter" : "🌍 Public Cabin"}</span>
                      </button>
                    </div>

                    {/* Error indicator */}
                    {errorText && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-[10px] text-red-400">
                        ⚠️ {errorText}
                      </div>
                    )}

                    {/* BOARD FLIGHT DIRECT ACTION BUTTON */}
                    <Button
                      size="lg"
                      className="w-full shadow-lg shadow-electric-500/20 uppercase tracking-widest font-extrabold text-[10px] py-4 bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500"
                      loading={creatingSession}
                      onClick={handleBoardFlight}
                    >
                      {isPrivate
                        ? `Engage Engines · 🪙 300`
                        : `${sessionMode === "CHILL" ? "😌" : "😈"} Board Cabin · ${durationMinutes}m flight`}
                    </Button>
                  </motion.div>
                );
              })() : (
                <div className="text-center py-6 text-white/40 leading-relaxed font-mono">
                  <Compass className="size-6 text-white/20 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-[10px] font-bold text-white/60 uppercase">Flight Router Ready</p>
                  <p className="text-[8px] text-white/30 max-w-[180px] mx-auto mt-1 leading-normal">
                    Select a city pin on the radar map to designate departure (🛫) and arrival (🛬) points to board direct!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Bottom Nav padding container */}
      <div className="h-28 shrink-0 relative z-20 flex justify-center items-center pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
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
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
