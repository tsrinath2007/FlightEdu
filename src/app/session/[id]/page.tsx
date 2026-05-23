"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Shield, Compass, Navigation, Award, Volume2, VolumeX, AlertTriangle, 
  Play, Pause, LogOut, CheckCircle2, ChevronRight, Compass as AltimeterIcon
} from "lucide-react";

interface CockpitPageProps {
  params: Promise<{ id: string }>;
}

interface FlightConfig {
  sessionId: string;
  airline: {
    id: string;
    name: string;
    logo: string;
    code: string;
    color: string;
    textGlow: string;
    perk: string;
    baseMultiplier: number;
  };
  cabinClass: {
    id: string;
    name: string;
    desc: string;
    priceMultiplier: number;
    seatSuffix: string;
  };
  aircraft: {
    id: string;
    name: string;
    desc: string;
    engines: string;
    speed: string;
    comfort: string;
    shield: string;
  };
  seatNumber: string;
  flightNumber: string;
  gateNumber: string;
}

interface FlightSession {
  id: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  transportMode: string;
  duration: number; // in minutes
  mode: "CHILL" | "HARDCORE";
}

export default function CockpitPage({ params: paramsPromise }: CockpitPageProps) {
  const router = useRouter();
  const params = React.use(paramsPromise);
  const sessionId = params.id;

  // Flight configurations
  const [session, setSession] = useState<FlightSession | null>(null);
  const [config, setConfig] = useState<FlightConfig | null>(null);

  // Focus Timer States
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false); // Autopilot State
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [flightPhase, setFlightPhase] = useState("Pre-flight Preparations");
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Fasten Seatbelt sign enabled", completed: true },
    { id: 2, text: "Autopilot Guidance parameters locked", completed: false },
    { id: 3, text: "Focus cabin environment pressurized", completed: false },
    { id: 4, text: "Holographic study modules initialized", completed: false },
  ]);

  // Audio Ambience
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load session & config
  useEffect(() => {
    // 1. Load active flight configuration
    const localConfig = localStorage.getItem(`flight_config_${sessionId}`);
    if (localConfig) {
      try {
        setConfig(JSON.parse(localConfig));
      } catch (e) {
        console.error("Config parse fail:", e);
      }
    } else {
      // Default fallback config if boarding checklist was bypassed
      setConfig({
        sessionId,
        airline: {
          id: "airindia",
          name: "Air India",
          logo: "🇮🇳",
          code: "AI",
          color: "from-saffron-500/30 to-orange-950/20",
          textGlow: "text-orange-400",
          perk: "+1.8x Coins & Indian Delicacies",
          baseMultiplier: 1.8,
        },
        cabinClass: {
          id: "economy",
          name: "Economy Class",
          desc: "Comfortable ergonomic seat with full study cockpit utilities.",
          priceMultiplier: 1.0,
          seatSuffix: "J",
        },
        aircraft: {
          id: "a350",
          name: "Airbus A350-1000 XWB",
          desc: "Next-gen carbon composite body.",
          engines: "2x Rolls-Royce Trent XWB",
          speed: "Mach 0.85 (903 km/h)",
          comfort: "★★★★★",
          shield: "Dynamic Pressure Optimization (+45%)",
        },
        seatNumber: "12D",
        flightNumber: "AI 350",
        gateNumber: "T-03",
      });
    }

    // 2. Load Flight Session
    const localSession = localStorage.getItem(`flight_session_${sessionId}`);
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession) as FlightSession;
        setSession(parsed);
        setSecondsRemaining(parsed.duration * 60);
        setTotalDurationSeconds(parsed.duration * 60);
      } catch (e) {
        console.error("Session parse fail:", e);
      }
    } else {
      // Direct API fetch
      fetch(`/api/sessions/${sessionId}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data: { session: FlightSession }) => {
          setSession(data.session);
          setSecondsRemaining(data.session.duration * 60);
          setTotalDurationSeconds(data.session.duration * 60);
        })
        .catch(() => {
          // Absolute offline/guest backup
          const defaultSession: FlightSession = {
            id: sessionId,
            origin: "Dubai International",
            originCode: "DXB",
            destination: "Bengaluru Kempegowda",
            destinationCode: "BLR",
            transportMode: "FLIGHT",
            duration: 306,
            mode: "CHILL",
          };
          setSession(defaultSession);
          setSecondsRemaining(defaultSession.duration * 60);
          setTotalDurationSeconds(defaultSession.duration * 60);
        });
    }
  }, [sessionId]);

  // Autopilot Focus Timer engine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
        
        // Calculate coin accumulation
        // Coins = time-focused * airline base multiplier * class multiplier
        const baseMul = config?.airline.baseMultiplier ?? 1.0;
        const classMul = config?.cabinClass.priceMultiplier ?? 1.0;
        setCoinsEarned((prev) => prev + Number((0.05 * baseMul * classMul).toFixed(2)));

        // Update checklist items dynamically as they focus
        const elapsed = totalDurationSeconds - (secondsRemaining - 1);
        if (elapsed > 5) {
          setChecklist((prev) => prev.map((item) => item.id === 2 ? { ...item, completed: true } : item));
        }
        if (elapsed > 15) {
          setChecklist((prev) => prev.map((item) => item.id === 3 ? { ...item, completed: true } : item));
        }
        if (elapsed > 30) {
          setChecklist((prev) => prev.map((item) => item.id === 4 ? { ...item, completed: true } : item));
        }
      }, 1000);
    } else if (secondsRemaining === 0 && totalDurationSeconds > 0) {
      // Focus Completed! Flight Landed!
      setFlightPhase("Flight Landed Safely! Welcome!");
      setAltitude(0);
      setSpeed(0);
      setIsActive(false);
    }

    return () => clearInterval(timer);
  }, [isActive, secondsRemaining, totalDurationSeconds, config]);

  // Flight Instruments Engine (Altitude and Speed simulation based on focus session status)
  useEffect(() => {
    if (!isActive) {
      // Autopilot disabled: idle
      if (secondsRemaining > 0 && secondsRemaining < totalDurationSeconds) {
        setFlightPhase("Autopilot Paused - Holding Pattern");
        // Slowly glide down to holding altitude
        if (altitude > 10000) setAltitude((prev) => Math.max(10000, prev - 150));
        if (speed > 250) setSpeed((prev) => Math.max(250, prev - 5));
      }
      return;
    }

    const elapsedPercent = (totalDurationSeconds - secondsRemaining) / totalDurationSeconds;

    if (elapsedPercent < 0.05) {
      setFlightPhase("Takeoff & Initial Climb");
      setAltitude((prev) => Math.min(12000, prev + 180));
      setSpeed((prev) => Math.min(480, prev + 8));
    } else if (elapsedPercent < 0.15) {
      setFlightPhase("Climbing to Cruising Altitude");
      setAltitude((prev) => Math.min(38000, prev + 220));
      setSpeed((prev) => Math.min(840, prev + 6));
    } else if (elapsedPercent < 0.85) {
      setFlightPhase("Established at High Altitude Cruise");
      setAltitude((prev) => {
        // Micro oscillation for realistic altimeter drift
        const drift = Math.sin(Date.now() / 10000) * 15;
        return Math.round(38000 + drift);
      });
      setSpeed((prev) => {
        const drift = Math.cos(Date.now() / 10000) * 2;
        return Math.round(895 + drift);
      });
    } else if (elapsedPercent < 0.98) {
      setFlightPhase("Initial Descent Procedure");
      setAltitude((prev) => Math.max(3000, prev - 250));
      setSpeed((prev) => Math.max(280, prev - 6));
    } else {
      setFlightPhase("Final Approach");
      setAltitude((prev) => Math.max(200, prev - 120));
      setSpeed((prev) => Math.max(140, prev - 8));
    }
  }, [isActive, secondsRemaining, totalDurationSeconds, altitude, speed]);

  // Autopilot switch trigger
  const toggleAutopilot = () => {
    setIsActive(!isActive);

    // Audio chime on Autopilot click
    try {
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
      chime.volume = 0.25;
      chime.play().catch(() => {});
    } catch (e) {}
  };

  // Toggle ambient white noise cabin sound
  const toggleAmbience = () => {
    if (!audioRef.current) {
      // Loopable ambient aircraft cabin white noise
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"); // Backup stream or synthetic white noise
      audio.loop = true;
      audio.volume = 0.15;
      audioRef.current = audio;
    }

    if (ambiencePlaying) {
      audioRef.current.pause();
      setAmbiencePlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setAmbiencePlaying(true);
    }
  };

  // Cleanup audio on exit
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Format focus time
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleEject = () => {
    if (session?.mode === "HARDCORE") {
      const confirmEject = confirm("⚠️ WARNING: Hardcore Flight Mode engaged. Ejecting early will cost -500 focus coins! Do you still want to eject?");
      if (!confirmEject) return;
    }

    if (audioRef.current) audioRef.current.pause();
    router.push("/dashboard");
  };

  if (!session || !config) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy-950 text-white">
        <div className="text-center">
          <div className="size-12 rounded-full border-2 border-electric-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-display text-lg tracking-wider text-white/60">Pressurizing Pilot Cockpit...</p>
        </div>
      </main>
    );
  }

  const progressPercent = ((totalDurationSeconds - secondsRemaining) / totalDurationSeconds) * 100;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 text-white pb-16">
      {/* Background Starfield and grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900/40 via-navy-950 to-black z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-40 z-0" />

      {/* Futuristic flight status bar */}
      <div className={`relative z-10 w-full bg-gradient-to-r ${config.airline.color} border-b border-white/10 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-md">{config.airline.logo}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                {config.airline.name} {config.flightNumber}
              </h2>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-electric-400">
                {config.cabinClass.name}
              </span>
            </div>
            <p className="text-[10px] text-white/50 font-mono tracking-wide mt-0.5">
              Seat {config.seatNumber} • Gate {config.gateNumber} • {config.aircraft.name}
            </p>
          </div>
        </div>

        {/* Live flight path status */}
        <div className="flex items-center gap-4 bg-black/30 border border-white/5 rounded-full px-5 py-2 font-mono text-xs">
          <span className="font-extrabold text-white/80">{session.originCode}</span>
          <div className="w-16 h-[2px] bg-white/10 relative flex items-center justify-center">
            <motion.div
              style={{ left: `${Math.min(100, progressPercent)}%` }}
              className="absolute size-3 rounded-full bg-electric-400 flex items-center justify-center -translate-x-1/2"
            >
              <Plane className="size-2 text-navy-950 rotate-[90deg]" />
            </motion.div>
          </div>
          <span className="font-extrabold text-white/80">{session.destinationCode}</span>
          <span className="text-[10px] text-white/40 border-l border-white/10 pl-3">
            {flightPhase}
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8">
        
        {/* Core Cockpit Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Instruments, Pilot Checklist, Sound Deck */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Holographic Instruments */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md">
              <h3 className="font-display text-xs font-black tracking-widest text-electric-400 uppercase mb-5">
                Flight Telemetry Instruments
              </h3>
              
              <div className="space-y-4 font-mono">
                {/* Altitude Dial */}
                <div className="bg-white/4 rounded-2xl border border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AltimeterIcon className="size-5 text-electric-400 animate-pulse" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Altimeter</p>
                      <p className="text-md font-bold text-white tracking-wider mt-0.5">
                        {altitude.toLocaleString()} FT
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/30">FL380 target</span>
                </div>

                {/* Speed Dial */}
                <div className="bg-white/4 rounded-2xl border border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="size-5 text-electric-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Speedometer</p>
                      <p className="text-md font-bold text-white tracking-wider mt-0.5">
                        {speed} KM/H
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{config.aircraft.speed.split(" ")[0]}</span>
                </div>

                {/* Comfort Level */}
                <div className="bg-white/4 rounded-2xl border border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="size-5 text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-white/40 uppercase">Focus Shield</p>
                      <p className="text-md font-bold text-emerald-400 tracking-wider mt-0.5">
                        {config.aircraft.shield.split("(")[1].replace(")", "")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400">{config.aircraft.comfort}</span>
                </div>
              </div>
            </div>

            {/* Focus checklist log */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md">
              <h3 className="font-display text-xs font-black tracking-widest text-electric-400 uppercase mb-4">
                Active Flight Logs
              </h3>

              <div className="space-y-3">
                {checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                      item.completed 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                        : "bg-white/4 border-white/5 text-white/50"
                    }`}
                  >
                    <CheckCircle2 className={`size-4 mt-0.5 flex-shrink-0 ${item.completed ? "text-emerald-400" : "text-white/20"}`} />
                    <span className="text-xs leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambient Sound Deck */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md">
              <h3 className="font-display text-xs font-black tracking-widest text-electric-400 uppercase mb-4">
                Cabin Sound Deck
              </h3>
              
              <button
                onClick={toggleAmbience}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition duration-300 ${
                  ambiencePlaying
                    ? "bg-electric-500/10 border-electric-400/40 text-electric-400"
                    : "bg-white/4 border-white/5 hover:bg-white/8 text-white/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="size-4 animate-bounce" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Lofi White Noise</p>
                    <p className="text-[10px] text-white/45">Gentle cabin rumble lofi beat</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                  {ambiencePlaying ? "Active" : "Mute"}
                </span>
              </button>
            </div>

          </div>

          {/* Right Column: Central Autopilot cockpit focus clock */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* The Main HUD Focus Display */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/20 p-8 backdrop-blur-md text-center space-y-8 relative overflow-hidden shadow-2xl">
              
              {/* Radar Grid Graphic background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.03)_0%,_transparent_60%)] pointer-events-none" />

              <div>
                <span className="rounded-full bg-electric-500/10 border border-electric-500/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-electric-400 uppercase">
                  {session.mode} Flight Mode
                </span>
                <p className="text-xs text-white/40 mt-2 font-mono">
                  {isActive ? "✦ AUTOPILOT ACTIVE (KEEP STUDYING)" : "✦ AUTOPILOT IDLE (ENGAGE GUIDANCE)"}
                </p>
              </div>

              {/* HUD Chronometer Focus Display */}
              <div className="relative py-6 flex items-center justify-center">
                
                {/* Dial glow */}
                <div className={`absolute size-64 rounded-full border transition duration-500 ${
                  isActive ? "border-electric-400/25 shadow-[0_0_50px_rgba(56,189,248,0.08)]" : "border-white/5"
                }`} />

                <div className="relative z-10">
                  <h1 className="font-mono text-6xl md:text-7xl font-extrabold tracking-widest text-white leading-none">
                    {formatTime(secondsRemaining)}
                  </h1>
                  <p className="mt-3 text-xs text-white/45 uppercase tracking-[0.2em] font-mono">
                    Time to Destination
                  </p>
                </div>
              </div>

              {/* Progress Slider track */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-gradient-to-r from-electric-500 to-blue-500" 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <span>Takeoff</span>
                  <span>{progressPercent.toFixed(1)}% Completed</span>
                  <span>Arrival</span>
                </div>
              </div>

              {/* Control Deck */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-white/5 pt-6">
                <button
                  onClick={toggleAutopilot}
                  className={`w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-display font-black tracking-widest transition duration-300 shadow-lg ${
                    isActive
                      ? "bg-amber-500 hover:bg-amber-400 text-navy-950 shadow-amber-500/10"
                      : "bg-electric-500 hover:bg-electric-400 text-white shadow-electric-500/10"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="size-5 fill-current" />
                      <span>PAUSE AUTOPILOT</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-5 fill-current" />
                      <span>ENGAGE AUTOPILOT</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleEject}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition"
                >
                  <LogOut className="size-4" />
                  <span className="font-semibold text-xs tracking-wider uppercase">Emergency Eject</span>
                </button>
              </div>

            </div>

            {/* Flight Rewards Manifest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Flight coins miner */}
              <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Coins Earned This Flight</p>
                  <h3 className="font-mono text-3xl font-black text-white mt-1">
                    🪙 {coinsEarned.toFixed(2)}
                  </h3>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 block">
                    ⚡ {config.airline.perk}
                  </span>
                </div>
                <Award className="size-10 text-electric-400 flex-shrink-0 animate-bounce" />
              </div>

              {/* Flight route logs */}
              <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Flight Manifest Route</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-white mt-1.5">
                    <span>{session.origin}</span>
                    <ChevronRight className="size-3 text-white/30" />
                    <span>{session.destination}</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 italic font-mono mt-3">
                  “Guidance system operating efficiently. Autopilot coordinates locked in.”
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
