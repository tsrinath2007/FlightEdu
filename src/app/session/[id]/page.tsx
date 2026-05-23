"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Shield, Compass, Navigation, Award, Volume2, VolumeX, AlertTriangle, 
  Play, Pause, LogOut, CheckCircle2, ChevronRight, Compass as AltimeterIcon,
  Users, Info, Sparkles, User, RotateCcw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
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

interface MultiplayerPilot {
  seat: string;
  name: string;
  subject: string;
  focusTime: string;
  streak: number;
  coins: number;
  avatar: string;
  avatarColor: string;
}

const INITIAL_MULTIPLAYER_PILOTS: MultiplayerPilot[] = [
  { seat: "1A", name: "Captain Emily", subject: "Quantum Computing", focusTime: "1h 42m", streak: 12, coins: 2850, avatar: "👩‍🚀", avatarColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { seat: "2D", name: "Cadet Liam", subject: "Advanced Next.js", focusTime: "52m", streak: 5, coins: 820, avatar: "👨‍💻", avatarColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { seat: "4C", name: "Co-Pilot Sophia", subject: "Aerodynamics", focusTime: "2h 10m", streak: 21, coins: 4930, avatar: "👩‍✈️", avatarColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { seat: "8F", name: "Cadet Aarav", subject: "Organic Chemistry", focusTime: "15m", streak: 3, coins: 340, avatar: "👨‍🔬", avatarColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { seat: "14D", name: "Cadet Chloe", subject: "Macroeconomics", focusTime: "38m", streak: 7, coins: 1150, avatar: "👩‍🎨", avatarColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  { seat: "26B", name: "Cadet Hiroshi", subject: "Japanese Linguistics", focusTime: "1h 05m", streak: 15, coins: 2310, avatar: "👨‍🏫", avatarColor: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  { seat: "32J", name: "Cadet Elena", subject: "Creative Writing", focusTime: "2h 45m", streak: 18, coins: 3750, avatar: "👩‍💻", avatarColor: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
];

export default function CockpitPage({ params: paramsPromise }: CockpitPageProps) {
  const router = useRouter();
  const params = React.use(paramsPromise);
  const sessionId = params.id;

  // Configurations
  const [session, setSession] = useState<FlightSession | null>(null);
  const [config, setConfig] = useState<FlightConfig | null>(null);

  // Focus Timer States
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false); // Autopilot
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [flightPhase, setFlightPhase] = useState("Pre-flight Manifest");
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);

  // View state: 'timer' or 'cabin'
  const [activeTab, setActiveTab] = useState<"timer" | "cabin">("cabin");

  // Interactive 3D Camera Controls
  const [pitch, setPitch] = useState(40); // RotateX
  const [yaw, setYaw] = useState(-15);   // RotateZ
  const [zoom, setZoom] = useState(1);    // Scale

  // Multiplayer Seat States
  const [multiplayerPilots, setMultiplayerPilots] = useState<MultiplayerPilot[]>(INITIAL_MULTIPLAYER_PILOTS);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<MultiplayerPilot | null>(null);

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
    const localConfig = localStorage.getItem(`flight_config_${sessionId}`);
    if (localConfig) {
      try {
        setConfig(JSON.parse(localConfig));
      } catch (e) {
        console.error("Config parse fail:", e);
      }
    } else {
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
        
        const baseMul = config?.airline.baseMultiplier ?? 1.0;
        const classMul = config?.cabinClass.priceMultiplier ?? 1.0;
        setCoinsEarned((prev) => prev + Number((0.05 * baseMul * classMul).toFixed(2)));

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
      setFlightPhase("Flight Landed Safely! Welcome!");
      setAltitude(0);
      setSpeed(0);
      setIsActive(false);
    }

    return () => clearInterval(timer);
  }, [isActive, secondsRemaining, totalDurationSeconds, config]);

  // Flight Instruments Engine
  useEffect(() => {
    if (!isActive) {
      if (secondsRemaining > 0 && secondsRemaining < totalDurationSeconds) {
        setFlightPhase("Autopilot Paused - Holding Pattern");
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
      setFlightPhase("Established at Cruising Altitude");
      setAltitude((prev) => {
        const drift = Math.sin(Date.now() / 10000) * 15;
        return Math.round(38000 + drift);
      });
      setSpeed((prev) => {
        const drift = Math.cos(Date.now() / 10000) * 2;
        return Math.round(895 + drift);
      });
    } else if (elapsedPercent < 0.98) {
      setFlightPhase("Initial Descent");
      setAltitude((prev) => Math.max(3000, prev - 250));
      setSpeed((prev) => Math.max(280, prev - 6));
    } else {
      setFlightPhase("Final Approach");
      setAltitude((prev) => Math.max(200, prev - 120));
      setSpeed((prev) => Math.max(140, prev - 8));
    }
  }, [isActive, secondsRemaining, totalDurationSeconds, altitude, speed]);

  const toggleAutopilot = () => {
    setIsActive(!isActive);
    try {
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
      chime.volume = 0.25;
      chime.play().catch(() => {});
    } catch (e) {}
  };

  const toggleAmbience = () => {
    if (!audioRef.current) {
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
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

  const handleSeatClick = (seatId: string, isOccupied: boolean, pilot?: MultiplayerPilot) => {
    if (isOccupied && pilot) {
      setSelectedSeatDetails(pilot);
      try {
        const tap = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
        tap.volume = 0.15;
        tap.play().catch(() => {});
      } catch (e) {}
    } else if (!isOccupied && config) {
      const updatedConfig = { ...config, seatNumber: seatId };
      setConfig(updatedConfig);
      localStorage.setItem(`flight_config_${sessionId}`, JSON.stringify(updatedConfig));
      setSelectedSeatDetails(null);

      try {
        const slide = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
        slide.volume = 0.2;
        slide.play().catch(() => {});
      } catch (e) {}
    }
  };

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

  const resetCamera = () => {
    setPitch(40);
    setYaw(-15);
    setZoom(1);
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

  // Custom Aircraft Seating Maps rendering config (Supports 3D CSS structures!)
  const renderSeatRow = (rowNumber: number, letters: string[], isFirstOrBusiness = false) => {
    return (
      <div key={rowNumber} className="flex items-center justify-center gap-4 transform-style-3d">
        {/* Left Side Seats */}
        <div className="flex gap-2 transform-style-3d">
          {letters.slice(0, letters.length / 2).map((letter) => {
            const seatId = `${rowNumber}${letter}`;
            const pilot = multiplayerPilots.find((p) => p.seat === seatId);
            const isMe = config.seatNumber === seatId;
            const isOccupied = !!pilot && !isMe;

            return (
              <div 
                key={seatId} 
                className="relative transform-style-3d transition-transform duration-300 hover:scale-105"
                style={{ transform: `translateZ(${isMe ? "14px" : isOccupied ? "8px" : "2px"})` }}
              >
                {/* 3D Drop Shadow */}
                <div className="absolute inset-0 bg-black/60 blur-[3px] rounded-lg translate-y-[4px] translate-z-[-2px] pointer-events-none" />
                
                <button
                  onClick={() => handleSeatClick(seatId, isOccupied, pilot)}
                  className={`relative flex items-center justify-center rounded-lg font-mono text-[9px] font-bold border transition-all duration-300 transform-style-3d ${
                    isFirstOrBusiness ? "size-10 text-xs" : "size-8 text-[9px]"
                  } ${
                    isMe
                      ? "bg-electric-500 text-white border-electric-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] ring-2 ring-electric-400/50"
                      : isOccupied
                      ? "bg-purple-600/40 border-purple-500/35 text-purple-200 hover:bg-purple-600/60"
                      : "bg-navy-900/60 border-white/10 text-white/30 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {isMe ? "YOU" : isOccupied ? pilot?.avatar : seatId}

                  {/* Pulsing Holographic Column for Active focusers! */}
                  {isMe && isActive && (
                    <div className="absolute inset-0 border border-electric-400 rounded-lg animate-ping opacity-45 pointer-events-none" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Plane Center Aisle */}
        <div className="w-8 flex items-center justify-center transform-style-3d">
          <span className="text-[9px] font-mono text-white/20 select-none">{rowNumber}</span>
        </div>

        {/* Right Side Seats */}
        <div className="flex gap-2 transform-style-3d">
          {letters.slice(letters.length / 2).map((letter) => {
            const seatId = `${rowNumber}${letter}`;
            const pilot = multiplayerPilots.find((p) => p.seat === seatId);
            const isMe = config.seatNumber === seatId;
            const isOccupied = !!pilot && !isMe;

            return (
              <div 
                key={seatId} 
                className="relative transform-style-3d transition-transform duration-300 hover:scale-105"
                style={{ transform: `translateZ(${isMe ? "14px" : isOccupied ? "8px" : "2px"})` }}
              >
                {/* 3D Drop Shadow */}
                <div className="absolute inset-0 bg-black/60 blur-[3px] rounded-lg translate-y-[4px] translate-z-[-2px] pointer-events-none" />
                
                <button
                  onClick={() => handleSeatClick(seatId, isOccupied, pilot)}
                  className={`relative flex items-center justify-center rounded-lg font-mono text-[9px] font-bold border transition-all duration-300 transform-style-3d ${
                    isFirstOrBusiness ? "size-10 text-xs" : "size-8 text-[9px]"
                  } ${
                    isMe
                      ? "bg-electric-500 text-white border-electric-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] ring-2 ring-electric-400/50"
                      : isOccupied
                      ? "bg-purple-600/40 border-purple-500/35 text-purple-200 hover:bg-purple-600/60"
                      : "bg-navy-900/60 border-white/10 text-white/30 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {isMe ? "YOU" : isOccupied ? pilot?.avatar : seatId}

                  {/* Pulsing Holographic Column */}
                  {isMe && isActive && (
                    <div className="absolute inset-0 border border-electric-400 rounded-lg animate-ping opacity-45 pointer-events-none" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy-950 text-white pb-16">
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900/40 via-navy-950 to-black z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-40 z-0" />

      {/* Holographic flight status bar */}
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

        {/* Live flight path tracker */}
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
        
        {/* Core Console Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Instruments, Checklist, Sound Deck */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Holographic Instruments */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/30 p-6 backdrop-blur-md">
              <h3 className="font-display text-xs font-black tracking-widest text-electric-400 uppercase mb-5">
                Flight Telemetry Instruments
              </h3>
              
              <div className="space-y-4 font-mono">
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

          {/* Right Column: HUD Focus clock & 3D Interactive Seating Chart */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Holographic Tab Selector */}
            <div className="flex bg-navy-900/40 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("timer")}
                className={`flex-1 py-3 text-xs font-black tracking-wider uppercase rounded-xl transition duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "timer"
                    ? "bg-electric-500 text-white shadow-md shadow-electric-500/20"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                <Compass className="size-4" />
                <span>🧭 Autopilot Timer</span>
              </button>
              
              <button
                onClick={() => setActiveTab("cabin")}
                className={`flex-1 py-3 text-xs font-black tracking-wider uppercase rounded-xl transition duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "cabin"
                    ? "bg-electric-500 text-white shadow-md shadow-electric-500/20"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                <Users className="size-4" />
                <span>💺 Holographic 3D Seating Map</span>
              </button>
            </div>

            {/* Central Console Display (Dynamic Tab Panels) */}
            <div className="rounded-3xl border border-white/10 bg-navy-900/20 p-8 backdrop-blur-md min-h-[520px] relative overflow-hidden shadow-2xl flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {/* PANEL A: AUTOPILOT CHRONOMETER TIMER */}
                {activeTab === "timer" && (
                  <motion.div
                    key="timer-panel"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-8 text-center flex flex-col justify-between h-full"
                  >
                    <div>
                      <span className="rounded-full bg-electric-500/10 border border-electric-500/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-electric-400 uppercase">
                        {session.mode} Flight Mode
                      </span>
                      <p className="text-xs text-white/40 mt-2.5 font-mono">
                        {isActive ? "✦ AUTOPILOT ACTIVE (KEEP STUDYING)" : "✦ AUTOPILOT IDLE (ENGAGE GUIDANCE)"}
                      </p>
                    </div>

                    <div className="relative py-6 flex items-center justify-center">
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
                  </motion.div>
                )}

                {/* PANEL B: 3D INTERACTIVE MULTIPLAYER CABIN SEATING PLAN */}
                {activeTab === "cabin" && (
                  <motion.div
                    key="cabin-panel"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6 flex flex-col h-full transform-style-3d"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-extrabold text-md text-white tracking-wide">
                          Holographic 3D Interactive Seating Deck
                        </h3>
                        <p className="text-xs text-white/45 mt-0.5">
                          Drag the camera using telemetry controls on the right. Tap empty seats to switch seating in 3D.
                        </p>
                      </div>
                      <span className="rounded bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-400 animate-pulse">
                        ● {multiplayerPilots.length + 1} Pilots In Cabin
                      </span>
                    </div>

                    {/* Interactive 3D Seat Deck Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2 transform-style-3d">
                      
                      {/* Left: 3D Render Perspective Plane Seat grid */}
                      <div className="lg:col-span-8 bg-black/45 rounded-3xl border border-white/5 p-6 overflow-hidden min-h-[350px] relative flex items-center justify-center transform-style-3d select-none">
                        
                        {/* 3D Cabin Canvas Grid */}
                        <div 
                          className="transition-transform duration-500 ease-out transform-style-3d relative"
                          style={{
                            perspective: "1200px",
                            transform: `rotateX(${pitch}deg) rotateY(0deg) rotateZ(${yaw}deg) scale(${zoom})`,
                          }}
                        >
                          {/* 3D Cabin Wireframe Outline */}
                          <div className="absolute inset-x-[-20px] top-[-30px] bottom-[-20px] border border-dashed border-electric-500/20 rounded-[40px] pointer-events-none transform-style-3d">
                            <div className="absolute inset-0 border border-dashed border-electric-500/10 translate-z-[20px] rounded-[40px]" />
                            <div className="absolute inset-0 border border-dashed border-electric-500/5 translate-z-[40px] rounded-[40px]" />
                          </div>

                          <div className="space-y-6 transform-style-3d">
                            {/* First Class Suite Rows (Rows 1-2) */}
                            <div className="space-y-3 transform-style-3d">
                              <p className="text-[8px] font-mono text-amber-400 font-extrabold tracking-widest uppercase text-center select-none translate-z-[10px]">
                                ✦ First Class Suites ✦
                              </p>
                              {renderSeatRow(1, ["A", "D"], true)}
                              {renderSeatRow(2, ["A", "D"], true)}
                            </div>

                            {/* Business Class Rows (Rows 4-8) */}
                            <div className="space-y-3 transform-style-3d">
                              <p className="text-[8px] font-mono text-electric-400 font-extrabold tracking-widest uppercase text-center select-none translate-z-[10px]">
                                ✦ Business Pods ✦
                              </p>
                              {renderSeatRow(4, ["A", "C", "F"], true)}
                              {renderSeatRow(8, ["A", "C", "F"], true)}
                            </div>

                            {/* Economy Class (Rows 14-32) */}
                            <div className="space-y-3 transform-style-3d">
                              <p className="text-[8px] font-mono text-white/30 font-extrabold tracking-widest uppercase text-center select-none translate-z-[10px]">
                                ✦ Main Cabin Economy ✦
                              </p>
                              {renderSeatRow(14, ["A", "B", "D", "J"])}
                              {renderSeatRow(26, ["A", "B", "D", "J"])}
                              {renderSeatRow(32, ["A", "B", "D", "J"])}
                            </div>
                          </div>

                        </div>

                        {/* Interactive Holographic 3D Camera Controls Overlay */}
                        <div className="absolute bottom-4 right-4 bg-navy-950/80 border border-white/10 rounded-2xl p-2.5 flex flex-col gap-2 backdrop-blur-md">
                          <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest text-center">3D Camera</p>
                          <div className="grid grid-cols-3 gap-1">
                            <div />
                            <button onClick={() => setPitch((p) => Math.min(80, p + 5))} className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white"><ArrowUp className="size-3.5" /></button>
                            <div />
                            <button onClick={() => setYaw((y) => y - 5)} className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white"><ArrowLeft className="size-3.5" /></button>
                            <button onClick={resetCamera} className="p-1.5 rounded-lg bg-electric-500/20 border border-electric-500/30 hover:bg-electric-500/30 text-electric-400"><RotateCcw className="size-3.5" /></button>
                            <button onClick={() => setYaw((y) => y + 5)} className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white"><ArrowRight className="size-3.5" /></button>
                            <div />
                            <button onClick={() => setPitch((p) => Math.max(10, p - 5))} className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white"><ArrowDown className="size-3.5" /></button>
                            <div />
                          </div>
                          
                          <div className="flex gap-1.5 mt-1 border-t border-white/5 pt-2">
                            <button onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} className="flex-1 p-1 rounded-md bg-white/5 hover:bg-white/10 text-white flex justify-center"><ZoomIn className="size-3" /></button>
                            <button onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))} className="flex-1 p-1 rounded-md bg-white/5 hover:bg-white/10 text-white flex justify-center"><ZoomOut className="size-3" /></button>
                          </div>
                        </div>

                      </div>

                      {/* Right: Hover/Click Cadet Details Overlay */}
                      <div className="lg:col-span-4 flex flex-col justify-center transform-style-3d">
                        <AnimatePresence mode="wait">
                          {selectedSeatDetails ? (
                            <motion.div
                              key={selectedSeatDetails.seat}
                              initial={{ opacity: 0, scale: 0.95, z: -10 }}
                              animate={{ opacity: 1, scale: 1, z: 0 }}
                              exit={{ opacity: 0, scale: 0.95, z: -10 }}
                              className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5 text-center space-y-4 transform-style-3d"
                            >
                              <div className={`size-14 rounded-full mx-auto flex items-center justify-center text-3xl border ${selectedSeatDetails.avatarColor}`}>
                                {selectedSeatDetails.avatar}
                              </div>
                              
                              <div>
                                <h4 className="font-display font-extrabold text-sm text-purple-300">
                                  {selectedSeatDetails.name}
                                </h4>
                                <p className="text-[10px] text-white/40 font-mono mt-0.5">Assigned Seat {selectedSeatDetails.seat}</p>
                              </div>

                              <div className="space-y-2 pt-3 border-t border-white/5 text-[10px] text-left text-white/60 font-mono">
                                <div className="flex justify-between">
                                  <span>Task/Subject:</span>
                                  <span className="font-bold text-white truncate max-w-[110px]">{selectedSeatDetails.subject}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Time Focused:</span>
                                  <span className="text-emerald-400 font-semibold">⚡ {selectedSeatDetails.focusTime}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Streak:</span>
                                  <span className="text-white">{selectedSeatDetails.streak} days 🔥</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total Coins:</span>
                                  <span className="text-amber-400">🪙 {selectedSeatDetails.coins}</span>
                                </div>
                              </div>
                              
                              <p className="text-[9px] text-purple-400 italic">
                                “Send focus vibes to study partner”
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty-details"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="rounded-3xl border border-white/5 bg-white/4 p-5 text-center text-white/45 text-xs flex flex-col items-center justify-center min-h-[220px]"
                            >
                              <Users className="size-8 text-white/20 mb-3 animate-pulse" />
                              <p className="font-bold text-white/60">Study Partner Details</p>
                              <p className="text-[10px] text-white/35 mt-1 max-w-[150px] mx-auto leading-relaxed">
                                Click an occupied seat in the 3D cabin to inspect that Pilot Cadet's live stats!
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Control Deck (Engage Timer buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-white/5 pt-6 mt-6">
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
