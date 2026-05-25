"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Star, Shield, ArrowRight, Volume2, VolumeX, Sparkles, Award } from "lucide-react";

interface BoardingPageProps {
  params: Promise<{ id: string }>;
}

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

const AIRLINES = [
  {
    id: "emirates",
    name: "Emirates",
    logo: "🇦🇪",
    code: "EK",
    color: "from-red-600/30 to-red-950/20",
    glow: "shadow-red-500/20 border-red-500/30",
    textGlow: "text-red-400",
    badge: "First Class Luxury",
    perk: "+2.5x Coins & Fine Dining",
    baseMultiplier: 2.5,
  },
  {
    id: "singapore",
    name: "Singapore Airlines",
    logo: "🇸🇬",
    code: "SQ",
    color: "from-amber-500/30 to-amber-950/20",
    glow: "shadow-amber-500/20 border-amber-500/30",
    textGlow: "text-amber-400",
    badge: "5-Star Premium Service",
    perk: "+2.2x Coins & Comfort Cabins",
    baseMultiplier: 2.2,
  },
  {
    id: "qatar",
    name: "Qatar Airways",
    logo: "🇶🇦",
    code: "QR",
    color: "from-rose-800/30 to-rose-950/20",
    glow: "shadow-rose-500/20 border-rose-500/30",
    textGlow: "text-rose-400",
    badge: "World's Best Business Class",
    perk: "+2.0x Coins & Elite Lounges",
    baseMultiplier: 2.0,
  },
  {
    id: "airindia",
    name: "Air India",
    logo: "🇮🇳",
    code: "AI",
    color: "from-saffron-500/30 to-orange-950/20",
    glow: "shadow-orange-500/20 border-orange-500/30",
    textGlow: "text-orange-400",
    badge: "Global Indian Spirit",
    perk: "+1.8x Coins & Indian Delicacies",
    baseMultiplier: 1.8,
  },
  {
    id: "indigo",
    name: "IndiGo",
    logo: "🇮🇳",
    code: "6E",
    color: "from-blue-600/30 to-blue-950/20",
    glow: "shadow-blue-500/20 border-blue-500/30",
    textGlow: "text-blue-400",
    badge: "On-Time & Affordable",
    perk: "+1.5x Coins & Super Fast Entry",
    baseMultiplier: 1.5,
  },
];

const CABIN_CLASSES = [
  {
    id: "first",
    name: "First Class Suite",
    desc: "Your private sanctuary in the clouds. Ultimate luxury.",
    priceMultiplier: 2.5,
    perks: ["Private Suite Door", "Holographic Focus Shield (100%)", "Double Coins", "Row 1 Assigned"],
    seatSuffix: "A",
  },
  {
    id: "business",
    name: "Business Class",
    desc: "Lie-flat seating, gourmet ambient menu & workspace.",
    priceMultiplier: 1.8,
    perks: ["Workspace Console", "Enhanced Focus Shield (70%)", "+80% Coins", "Row 4-8 Assigned"],
    seatSuffix: "F",
  },
  {
    id: "premium",
    name: "Premium Economy",
    desc: "Extra legroom, noise-canceling setup & priority lane.",
    priceMultiplier: 1.3,
    perks: ["Extra Wide Seat", "Standard Focus Shield (40%)", "+30% Coins", "Row 12-16 Assigned"],
    seatSuffix: "D",
  },
  {
    id: "economy",
    name: "Economy Class",
    desc: "Comfortable ergonomic seat with full study cockpit utilities.",
    priceMultiplier: 1.0,
    perks: ["Standard Cockpit Utilities", "Eco-Takeoff Mode", "Base Coins Reward", "Row 24-38 Assigned"],
    seatSuffix: "J",
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
  },
  {
    id: "b777",
    name: "Boeing 777-300ER Prestige",
    desc: "Long-haul legend. Robust, spacious, and extremely reliable.",
    engines: "2x General Electric GE90",
    speed: "Mach 0.84 (892 km/h)",
    comfort: "★★★★☆",
    shield: "Twin-Engine Stability (+40%)",
  },
  {
    id: "a350",
    name: "Airbus A350-1000 XWB",
    desc: "Next-gen carbon composite body with ambient high-altitude cabin pressures.",
    engines: "2x Rolls-Royce Trent XWB",
    speed: "Mach 0.85 (903 km/h)",
    comfort: "★★★★★",
    shield: "Dynamic Pressure Optimization (+45%)",
  },
  {
    id: "b787",
    name: "Boeing 787 Dreamliner",
    desc: "Holographic auto-dimming windows, advanced air quality systems.",
    engines: "2x General Electric GEnx",
    speed: "Mach 0.85 (903 km/h)",
    comfort: "★★★★☆",
    shield: "Moisture-Balanced Cabin (+35%)",
  },
];

export default function BoardingPage({ params: paramsPromise }: BoardingPageProps) {
  const router = useRouter();
  const params = React.use(paramsPromise);
  const sessionId = params.id;

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

  // Load session data and user profile
  useEffect(() => {
    // Load sound effects setting
    const savedSound = localStorage.getItem("sound_effects_enabled");
    if (savedSound !== null) {
      setSoundOn(savedSound === "true");
    } else {
      setSoundOn(false); // Default is false
    }

    // Attempt local storage first (highly reliable offline simulation!)
    const localData = localStorage.getItem(`flight_session_${sessionId}`);
    if (localData) {
      try {
        setSession(JSON.parse(localData));
      } catch (e) {
        console.error("Local data parse fail:", e);
      }
    } else {
      // Fetch from API
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data: { session: FlightSession }) => {
          setSession(data.session);
        })
        .catch(() => {
          // Absolute fallback if session fetch fails completely
          setSession({
            id: sessionId,
            origin: "Dubai Intl Airport",
            originCode: "DXB",
            destination: "Changi Airport",
            destinationCode: "SIN",
            transportMode: "FLIGHT",
            duration: 360,
            mode: "CHILL",
          });
        });
    }

    // Load active profile details
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
        }
      })
      .catch(() => {});

    // Generate random Gate & Flight Code
    const gates = ["A-04", "B-12", "C-08", "D-15", "E-20"];
    setGateNumber(gates[Math.floor(Math.random() * gates.length)]);
  }, [sessionId]);

  // Dynamically update seat and flight code based on selections
  useEffect(() => {
    // Generate flight number
    const code = selectedAirline.code;
    const num = selectedAircraft.id === "a380" ? "380" : selectedAircraft.id === "b777" ? "777" : "350";
    setFlightNumber(`${code} ${num}`);

    // Generate Seat Number aligning strictly with cockpit seating layout
    let row = 4;
    let suffix = "A";
    if (selectedClass.id === "first") {
      const firstRows = [1, 2];
      const firstSeats = ["A", "D"];
      row = firstRows[Math.floor(Math.random() * firstRows.length)];
      suffix = firstSeats[Math.floor(Math.random() * firstSeats.length)];
    } else if (selectedClass.id === "business") {
      const bizRows = [4, 8];
      const bizSeats = ["A", "C", "F"];
      row = bizRows[Math.floor(Math.random() * bizRows.length)];
      suffix = bizSeats[Math.floor(Math.random() * bizSeats.length)];
    } else if (selectedClass.id === "premium") {
      const premRows = [14];
      const premSeats = ["A", "B", "D", "J"];
      row = premRows[Math.floor(Math.random() * premRows.length)];
      suffix = premSeats[Math.floor(Math.random() * premSeats.length)];
    } else {
      const econRows = [26, 32];
      const econSeats = ["A", "B", "D", "J"];
      row = econRows[Math.floor(Math.random() * econRows.length)];
      suffix = econSeats[Math.floor(Math.random() * econSeats.length)];
    }
    setSeatNumber(`${row}${suffix}`);
  }, [selectedAirline, selectedClass, selectedAircraft]);

  const handleTakeOff = () => {
    if (!studySubject.trim()) {
      alert("⚠️ Declaring your focus subject is mandatory before boarding the flight.");
      return;
    }
    setIsTakingOff(true);
    
    // Play pre-flight audio indicator if turned on
    if (soundOn) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}
    }

    // Save final flight configuration to localStorage for client-side persistence
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
    if (session) {
      localStorage.setItem(`flight_session_${sessionId}`, JSON.stringify(session));
    }

    setTimeout(() => {
      // Redirect to full study cockpit route!
      router.push(`/session/${sessionId}`);
    }, 3500);
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy-950 text-white">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-electric-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-display text-lg tracking-wider text-white/60">Configuring Flight Manifest...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 text-white selection:bg-electric-500 selection:text-white pb-16">
      {/* Dynamic Starfield Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900/60 via-navy-950 to-black z-0" />

      {/* TAKE OFF ANIMATION SCREEN OVERLAY */}
      <AnimatePresence>
        {isTakingOff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            {/* Speed lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: "-100%", x: `${Math.random() * 100}%` }}
                  animate={{ y: "150%" }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 0.5,
                  }}
                  className="absolute w-[1px] h-[15vh] bg-gradient-to-b from-transparent via-white/40 to-transparent"
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, rotate: 0 }}
              animate={{ 
                scale: [1, 1.2, 5],
                y: [0, -50, -600],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="relative"
            >
              <Plane className="size-24 text-electric-400 rotate-[315deg] drop-shadow-[0_0_35px_rgba(56,189,248,0.6)]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, times: [0, 0.3, 0.9] }}
              className="text-center mt-12"
            >
              <h2 className="font-display text-3xl font-extrabold tracking-widest text-white uppercase">
                Engaging Engines
              </h2>
              <p className="mt-2 text-electric-400 font-mono tracking-widest animate-pulse">
                CLIMBING TO FLIGHT LEVEL 380...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="rounded-full bg-electric-500/10 px-3.5 py-1 text-xs font-semibold text-electric-400 border border-electric-500/20">
              ✈️ PRE-FLIGHT CHECKLIST
            </span>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-5xl">
              Configure Your Flight
            </h1>
            <p className="mt-1.5 text-sm text-white/55">
              Select your Airline, Cabin Comfort, and Aircraft model to personalize your study cabin interface.
            </p>
          </div>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
          >
            {soundOn ? (
              <>
                <Volume2 className="size-4 text-electric-400" /> Sound Effects: On
              </>
            ) : (
              <>
                <VolumeX className="size-4 text-white/40" /> Sound Effects: Off
              </>
            )}
          </button>
        </div>

        {/* Dynamic Dual Grid Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Selectors */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Airline */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/40 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex size-7 items-center justify-center rounded-lg bg-electric-500/20 text-electric-400 text-xs font-bold font-mono">
                  01
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-wide">
                  Select Your Airline Carrier
                </h3>
              </div>

              <div className="space-y-3">
                {AIRLINES.map((airline) => {
                  const isSelected = selectedAirline.id === airline.id;
                  return (
                    <button
                      key={airline.id}
                      onClick={() => setSelectedAirline(airline)}
                      className={`w-full text-left flex items-center justify-between p-4 rounded-2xl border transition duration-300 relative overflow-hidden ${
                        isSelected
                          ? `bg-gradient-to-r ${airline.color} border-white/20 shadow-lg ${airline.glow}`
                          : "bg-white/4 border-white/5 hover:bg-white/8 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <span className="text-3xl filter drop-shadow-md">{airline.logo}</span>
                        <div>
                          <p className={`font-display font-bold text-sm ${isSelected ? airline.textGlow : "text-white/90"}`}>
                            {airline.name}
                          </p>
                          <p className="text-xs text-white/50">{airline.badge}</p>
                        </div>
                      </div>
                      <div className="text-right relative z-10">
                        <span className="text-xs font-mono bg-white/5 rounded-md px-2 py-0.5 text-white/70 block mb-1">
                          {airline.code} Flight
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase block">
                          {airline.perk}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Cabin Class */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/40 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex size-7 items-center justify-center rounded-lg bg-electric-500/20 text-electric-400 text-xs font-bold font-mono">
                  02
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-wide">
                  Select Cabin Seating Class
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CABIN_CLASSES.map((cabin) => {
                  const isSelected = selectedClass.id === cabin.id;
                  return (
                    <button
                      key={cabin.id}
                      onClick={() => setSelectedClass(cabin)}
                      className={`text-left p-5 rounded-2xl border transition duration-300 relative ${
                        isSelected
                          ? "bg-electric-500/10 border-electric-400/40 shadow-lg shadow-electric-500/5"
                          : "bg-white/4 border-white/5 hover:bg-white/8 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-display font-extrabold text-sm ${isSelected ? "text-electric-400" : "text-white"}`}>
                          {cabin.name}
                        </p>
                        <span className="text-xs font-mono text-white/40">x{cabin.priceMultiplier.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-white/50 mb-4 line-clamp-2 h-8">{cabin.desc}</p>
                      
                      <div className="space-y-1 border-t border-white/5 pt-3">
                        {cabin.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/60">
                            <Sparkles className="size-2.5 text-electric-400 flex-shrink-0" />
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Aircraft Model */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/40 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex size-7 items-center justify-center rounded-lg bg-electric-500/20 text-electric-400 text-xs font-bold font-mono">
                  03
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-wide">
                  Select Aircraft Fleet Model
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AIRCRAFT_MODELS.map((aircraft) => {
                  const isSelected = selectedAircraft.id === aircraft.id;
                  return (
                    <button
                      key={aircraft.id}
                      onClick={() => setSelectedAircraft(aircraft)}
                      className={`text-left p-5 rounded-2xl border transition duration-300 ${
                        isSelected
                          ? "bg-electric-500/10 border-electric-400/40 shadow-lg shadow-electric-500/5"
                          : "bg-white/4 border-white/5 hover:bg-white/8 hover:border-white/10"
                      }`}
                    >
                      <p className={`font-display font-extrabold text-sm ${isSelected ? "text-electric-400" : "text-white"}`}>
                        {aircraft.name}
                      </p>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2 h-8 mb-4">{aircraft.desc}</p>
                      
                      <div className="space-y-1.5 border-t border-white/5 pt-3 text-[10px] text-white/60">
                        <div className="flex items-center justify-between">
                          <span>Engines:</span>
                          <span className="font-mono text-white/40">{aircraft.engines.split("x")[1]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Shield Rating:</span>
                          <span className="text-emerald-400 font-semibold">{aircraft.shield.split("(")[1].replace(")", "")}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Declare Focus Subject */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/40 p-6 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-6">
                <span className="flex size-7 items-center justify-center rounded-lg bg-electric-500/20 text-electric-400 text-xs font-bold font-mono">
                  04
                </span>
                <h3 className="font-display text-lg font-bold text-white tracking-wide">
                  Declare Your Focus Subject <span className="text-red-400 text-sm font-normal">(Mandatory)</span>
                </h3>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. Advanced Next.js, Organic Chemistry, UI Design..."
                  value={studySubject}
                  onChange={(e) => setStudySubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60 focus:ring-1 focus:ring-electric-400/30 transition duration-300"
                />
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Next.js", "Physics", "Chemistry", "Anatomy", "Japanese", "Calculus", "UI Design"].map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setStudySubject(subject)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition duration-300 ${
                        studySubject === subject
                          ? "bg-electric-500/20 border-electric-400 text-electric-300"
                          : "bg-white/4 border-white/5 text-white/60 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      📚 {subject}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Holographic Boarding Pass Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-6">
            
            {/* Holographic Header Ticket Info */}
            <div className="text-center lg:text-left">
              <h3 className="font-display text-xs font-black tracking-widest text-electric-400 uppercase">
                Digital Boarding Pass Preview
              </h3>
              <p className="text-xs text-white/40 mt-1">Real-time update from your pilot manifest.</p>
            </div>

            {/* BOARDING PASS WIDGET */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-gradient-to-b from-navy-900 to-navy-950 shadow-electric-500/5">
              
              {/* Top Banner */}
              <div className={`p-4 bg-gradient-to-r ${selectedAirline.color} border-b border-white/10 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedAirline.logo}</span>
                  <span className="font-display font-bold text-xs uppercase tracking-widest text-white/80">
                    {selectedAirline.name}
                  </span>
                </div>
                <div className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase">
                  {flightNumber}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Flight Route Nodes */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">
                      {session.originCode}
                    </h2>
                    <p className="text-xs text-white/45 truncate mt-1">{session.origin.split(" Airport")[0]}</p>
                  </div>
                  
                  {/* Plane Connector Vector */}
                  <div className="flex-1 flex flex-col items-center justify-center px-2">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
                      {session.duration} min flight
                    </span>
                    <div className="relative w-full flex items-center">
                      <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="w-full flex justify-center relative">
                        <motion.div
                          animate={{ x: [-10, 10, -10] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-navy-900 px-2"
                        >
                          <Plane className="size-4 text-electric-400 rotate-[90deg] filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 text-right">
                    <h2 className="font-mono text-4xl font-extrabold tracking-tighter text-white">
                      {session.destinationCode}
                    </h2>
                    <p className="text-xs text-white/45 truncate mt-1">{session.destination.split(" Airport")[0]}</p>
                  </div>
                </div>

                {/* Perforated Dot Line separator */}
                <div className="relative h-4 flex items-center justify-between">
                  <div className="absolute left-[-28px] size-6 rounded-full bg-navy-950 border border-white/15 border-l-transparent z-10" />
                  <div className="w-full border-t border-dashed border-white/10" />
                  <div className="absolute right-[-28px] size-6 rounded-full bg-navy-950 border border-white/15 border-r-transparent z-10" />
                </div>

                {/* Ticket Body details */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Passenger</p>
                    <p className="font-bold text-white mt-0.5 truncate">{passengerName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Cabin Class</p>
                    <p className="font-bold text-electric-400 mt-0.5">{selectedClass.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Gate</p>
                    <p className="font-bold text-white mt-0.5">{gateNumber}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Seat Number</p>
                    <p className="font-mono font-extrabold text-white mt-0.5 tracking-wider bg-white/5 rounded-md px-2 py-0.5 inline-block border border-white/5">
                      {seatNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Aircraft Fleet</p>
                    <p className="font-bold text-white/80 mt-0.5 truncate">{selectedAircraft.name.split(" ")[0]} {selectedAircraft.name.split(" ")[1]}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Takeoff Mode</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{session.mode}</p>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-3">
                    <p className="text-[9px] font-mono tracking-widest text-white/35 uppercase">Study Focus</p>
                    <p className="font-bold text-yellow-400 mt-0.5 truncate">📚 {studySubject || "Focus Study"}</p>
                  </div>
                </div>

                {/* Focus Shield Badge */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase">
                        Focus Shield Active
                      </p>
                      <p className="text-[9px] text-white/50">🛡️ {selectedAircraft.shield}</p>
                    </div>
                  </div>
                  <Award className="size-5 text-emerald-400 flex-shrink-0" />
                </div>

                {/* Simulated Barcode */}
                <div className="border-t border-white/5 pt-5 flex flex-col items-center">
                  <div className="w-full h-11 bg-white/5 rounded-md flex items-center justify-center p-1.5 relative overflow-hidden border border-white/5 opacity-80">
                    {/* Simulated Barcode Stripes */}
                    <div className="flex justify-between w-full h-full opacity-60">
                      {Array.from({ length: 42 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-white"
                          style={{
                            width: `${[1, 2, 3, 1, 4, 1, 2][i % 7]}px`,
                            opacity: i % 4 === 0 ? 0.3 : 1,
                          }}
                        />
                      ))}
                    </div>
                    {/* Glowing holographic scanner line */}
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-[2px] bg-electric-400 shadow-[0_0_8px_#38bdf8] opacity-80"
                    />
                  </div>
                  <span className="text-[8px] font-mono text-white/30 tracking-[0.4em] uppercase mt-2">
                    GoFocusGen-{sessionId.substring(0, 8).toUpperCase()}
                  </span>
                </div>

              </div>

            </div>

            {/* ENGAGE BUTTON */}
            <button
              onClick={handleTakeOff}
              disabled={isTakingOff}
              className="w-full relative group rounded-3xl bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 py-5 font-display text-md font-extrabold tracking-widest text-white shadow-xl shadow-electric-500/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-3"
            >
              <Plane className="size-5 rotate-[45deg] transition group-hover:translate-x-1" />
              <span>ENGAGE ENGINES / BOARD</span>
              <ArrowRight className="size-5 flex-shrink-0" />
            </button>

            {/* Pilot Tip */}
            <div className="text-center p-2">
              <span className="text-[10px] text-white/40 italic font-mono block">
                “Clear skies ahead, Pilot Cadet. Select your preferences and engage takeoff.”
              </span>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
