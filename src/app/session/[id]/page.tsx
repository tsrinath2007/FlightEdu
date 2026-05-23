"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Shield, Compass, Navigation, Award, Volume2, VolumeX, AlertTriangle, 
  Play, Pause, LogOut, CheckCircle2, ChevronRight, Compass as AltimeterIcon,
  Users, Info, Sparkles, User, RotateCcw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  ShoppingBag, Heart
} from "lucide-react";
import { CadetAvatar, HairStyle, ClothingStyle, EyesStyle, ActivityType } from "@/components/journey/CadetAvatar";

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
  avatarHair: HairStyle;
  avatarHairColor: string;
  avatarClothing: ClothingStyle;
  avatarEyes: EyesStyle;
  avatarActivity: ActivityType;
  isActive: boolean;
}

const INITIAL_MULTIPLAYER_PILOTS: MultiplayerPilot[] = [
  { seat: "1A", name: "Captain Emily", subject: "Quantum Computing", focusTime: "1h 42m", streak: 12, coins: 2850, avatarHair: "bob", avatarHairColor: "purple", avatarClothing: "uniform", avatarEyes: "glossy", avatarActivity: "BOOK", isActive: true },
  { seat: "2D", name: "Cadet Liam", subject: "Advanced Next.js", focusTime: "52m", streak: 5, coins: 820, avatarHair: "spiky", avatarHairColor: "black", avatarClothing: "hoodie", avatarEyes: "glasses", avatarActivity: "LAPTOP", isActive: true },
  { seat: "4C", name: "Co-Pilot Sophia", subject: "Aerodynamics", focusTime: "2h 10m", streak: 21, coins: 4930, avatarHair: "curls", avatarHairColor: "blonde", avatarClothing: "uniform", avatarEyes: "glossy", avatarActivity: "WRITING", isActive: true },
  { seat: "8F", name: "Cadet Aarav", subject: "Organic Chemistry", focusTime: "15m", streak: 3, coins: 340, avatarHair: "spiky", avatarHairColor: "brown", avatarClothing: "rose_tee", avatarEyes: "glossy", avatarActivity: "CHILL", isActive: true },
  { seat: "14D", name: "Cadet Chloe", subject: "Macroeconomics", focusTime: "38m", streak: 7, coins: 1150, avatarHair: "curls", avatarHairColor: "purple", avatarClothing: "tanktop", avatarEyes: "glossy", avatarActivity: "WRITING", isActive: true },
  { seat: "26B", name: "Cadet Hiroshi", subject: "Japanese Linguistics", focusTime: "1h 05m", streak: 15, coins: 2310, avatarHair: "bob", avatarHairColor: "black", avatarClothing: "hoodie", avatarEyes: "glossy", avatarActivity: "BOOK", isActive: false },
  { seat: "32J", name: "Cadet Elena", subject: "Creative Writing", focusTime: "2h 45m", streak: 18, coins: 3750, avatarHair: "bob", avatarHairColor: "blonde", avatarClothing: "rose_tee", avatarEyes: "glasses", avatarActivity: "LAPTOP", isActive: true },
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

  // Customize & Avatar States
  const [avatarHair, setAvatarHair] = useState<HairStyle>("spiky");
  const [avatarHairColor, setAvatarHairColor] = useState("black");
  const [avatarClothing, setAvatarClothing] = useState<ClothingStyle>("tanktop");
  const [avatarEyes, setAvatarEyes] = useState<EyesStyle>("glossy");
  const [avatarActivity, setAvatarActivity] = useState<ActivityType>("LAPTOP");
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [walletCoins, setWalletCoins] = useState(500);
  const [customizeTab, setCustomizeTab] = useState<"daily" | "emotes" | "skins" | "owned">("emotes");
  const [sendingEnergy, setSendingEnergy] = useState<string | null>(null);

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

  // Synchronize earned coins with wallet
  useEffect(() => {
    if (coinsEarned > 0) {
      setWalletCoins((prev) => {
        const base = Number(localStorage.getItem(`wallet_coins_${sessionId}`) || "500");
        const next = Math.round(base + 0.05); // increment matches focus accrual rate
        localStorage.setItem(`wallet_coins_${sessionId}`, String(next));
        return next;
      });
    }
  }, [coinsEarned, sessionId]);

  // Load session & config & customize items
  useEffect(() => {
    const savedCoins = localStorage.getItem(`wallet_coins_${sessionId}`);
    if (savedCoins) {
      setWalletCoins(Number(savedCoins));
    } else {
      setWalletCoins(500);
      localStorage.setItem(`wallet_coins_${sessionId}`, "500");
    }

    const savedOwned = localStorage.getItem(`owned_customizer_items`);
    if (savedOwned) {
      try {
        setOwnedItems(JSON.parse(savedOwned));
      } catch (e) {
        setOwnedItems(["hair_spiky", "clothing_tanktop", "eyes_glossy", "activity_LAPTOP"]);
      }
    } else {
      const initialOwned = ["hair_spiky", "clothing_tanktop", "eyes_glossy", "activity_LAPTOP"];
      setOwnedItems(initialOwned);
      localStorage.setItem(`owned_customizer_items`, JSON.stringify(initialOwned));
    }

    const savedHair = localStorage.getItem(`avatar_hair`);
    if (savedHair) setAvatarHair(savedHair as any);
    const savedHairColor = localStorage.getItem(`avatar_hair_color`);
    if (savedHairColor) setAvatarHairColor(savedHairColor);
    const savedClothing = localStorage.getItem(`avatar_clothing`);
    if (savedClothing) setAvatarClothing(savedClothing as any);
    const savedEyes = localStorage.getItem(`avatar_eyes`);
    if (savedEyes) setAvatarEyes(savedEyes as any);
    const savedActivity = localStorage.getItem(`avatar_activity`);
    if (savedActivity) setAvatarActivity(savedActivity as any);

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

  const equipItem = (type: "hair" | "clothing" | "eyes" | "activity", value: string, id: string) => {
    try {
      const slide = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
      slide.volume = 0.2;
      slide.play().catch(() => {});
    } catch (e) {}

    if (type === "hair") {
      setAvatarHair(value as any);
      localStorage.setItem(`avatar_hair`, value);
    } else if (type === "clothing") {
      setAvatarClothing(value as any);
      localStorage.setItem(`avatar_clothing`, value);
    } else if (type === "eyes") {
      setAvatarEyes(value as any);
      localStorage.setItem(`avatar_eyes`, value);
    } else if (type === "activity") {
      setAvatarActivity(value as any);
      localStorage.setItem(`avatar_activity`, value);
    }
  };

  const purchaseItem = (id: string, price: number, type: "hair" | "clothing" | "eyes" | "activity", value: string) => {
    if (walletCoins < price) {
      alert("⚠️ Insufficient Focus Coins! Keep studying on autopilot to earn more coins.");
      return;
    }

    try {
      const buySound = new Audio("https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav");
      buySound.volume = 0.3;
      buySound.play().catch(() => {});
    } catch (e) {}

    const newCoins = walletCoins - price;
    setWalletCoins(newCoins);
    localStorage.setItem(`wallet_coins_${sessionId}`, String(newCoins));

    const updatedOwned = [...ownedItems, id];
    setOwnedItems(updatedOwned);
    localStorage.setItem(`owned_customizer_items`, JSON.stringify(updatedOwned));

    equipItem(type, value, id);
  };

  const sendFocusVibes = (targetSeat: string) => {
    setSendingEnergy(targetSeat);
    try {
      const sweep = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
      sweep.volume = 0.25;
      sweep.play().catch(() => {});
    } catch (e) {}
    setTimeout(() => {
      setSendingEnergy(null);
    }, 2500);
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

                {/* PANEL B: 2D ANIMATED MULTIPLAYER STUDY LOUNGE & CUSTOMIZER */}
                {activeTab === "cabin" && (
                  <motion.div
                    key="cabin-panel"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6 flex flex-col h-full overflow-y-auto pr-1"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-extrabold text-md text-white tracking-wide">
                          VoyageIQ Executive Lounge Cabin
                        </h3>
                        <p className="text-xs text-white/45 mt-0.5">
                          Study live with fellow pilot cadets! Select study pods to inspect stats and customize your spiky chibi avatar.
                        </p>
                      </div>
                      <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-[10px] font-bold text-purple-400 animate-pulse">
                        ● {multiplayerPilots.length + 1} Pilots In Cabin
                      </span>
                    </div>

                    {/* Interactive 2D Lounge layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
                      
                      {/* Left: 2D Interactive Lounge Pods */}
                      <div className="lg:col-span-8 bg-black/35 rounded-3xl border border-white/5 p-6 min-h-[380px] relative flex flex-col justify-between overflow-hidden shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)]">
                        
                        {/* Energy Vibes Streaming Beam Line */}
                        <AnimatePresence>
                          {sendingEnergy && (() => {
                            const target = multiplayerPilots.find(p => p.seat === sendingEnergy);
                            if (!target) return null;
                            return (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none z-50 overflow-visible"
                              >
                                {/* Glowing neon vector energy lines shooting from Center to target */}
                                <svg className="absolute inset-0 w-full h-full">
                                  <defs>
                                    <linearGradient id="beam-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                                      <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                                    </linearGradient>
                                  </defs>
                                  <motion.line 
                                    x1="50%" y1="50%" 
                                    x2="80%" y2="40%" 
                                    stroke="url(#beam-grad)"
                                    strokeWidth="4"
                                    strokeDasharray="8 4"
                                    animate={{ strokeDashoffset: [-20, 0] }}
                                    transition={{ ease: "linear", duration: 0.5, repeat: Infinity }}
                                  />
                                </svg>
                                <div className="absolute top-[40%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                  <span className="text-lg animate-ping">⚡✨🚀</span>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>

                        {/* Lounge Grid row by row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          
                          {/* 1. YOUR COZY STUDY POD */}
                          <div 
                            onClick={() => {
                              setSelectedSeatDetails(null);
                              try {
                                const tap = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
                                tap.volume = 0.15;
                                tap.play().catch(() => {});
                              } catch (e) {}
                            }}
                            className={`relative group flex flex-col items-center justify-between rounded-2xl p-3 border transition duration-300 cursor-pointer ${
                              !selectedSeatDetails
                                ? "bg-electric-500/10 border-electric-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] ring-1 ring-electric-400/40"
                                : "bg-navy-900/45 border-white/5 hover:border-white/12 hover:bg-navy-900/60"
                            }`}
                          >
                            <div className="flex justify-between w-full items-center mb-1">
                              <span className="text-[8px] font-mono font-bold text-electric-400 tracking-wider">POD {config.seatNumber} (YOU)</span>
                              <span className={`text-[7px] font-mono px-1 rounded uppercase font-bold ${isActive ? "bg-emerald-500/25 text-emerald-400 animate-pulse" : "bg-neutral-800 text-neutral-400"}`}>
                                {isActive ? "Focusing" : "Idle"}
                              </span>
                            </div>
                            
                            <CadetAvatar
                              size="md"
                              hairStyle={avatarHair}
                              hairColor={avatarHairColor}
                              clothing={avatarClothing}
                              eyesStyle={avatarEyes}
                              activity={avatarActivity}
                              isActive={isActive}
                            />
                            
                            <span className="text-[10px] font-display font-semibold text-white/90 truncate mt-1">Study Cadet</span>
                          </div>

                          {/* 2. MULTIPLAYER CADET STUDY PODS */}
                          {multiplayerPilots.map((pilot) => {
                            const isSelected = selectedSeatDetails?.seat === pilot.seat;
                            return (
                              <div
                                key={pilot.seat}
                                onClick={() => handleSeatClick(pilot.seat, true, pilot)}
                                className={`relative group flex flex-col items-center justify-between rounded-2xl p-3 border transition duration-300 cursor-pointer ${
                                  isSelected
                                    ? "bg-purple-500/10 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] ring-1 ring-purple-400/40"
                                    : "bg-navy-900/45 border-white/5 hover:border-white/12 hover:bg-navy-900/60"
                                }`}
                              >
                                <div className="flex justify-between w-full items-center mb-1">
                                  <span className="text-[8px] font-mono font-bold text-purple-400 tracking-wider">POD {pilot.seat}</span>
                                  <span className={`text-[7px] font-mono px-1 rounded uppercase font-bold ${pilot.isActive ? "bg-emerald-500/25 text-emerald-400" : "bg-neutral-800 text-neutral-400"}`}>
                                    {pilot.isActive ? "Focusing" : "Idle"}
                                  </span>
                                </div>
                                
                                <CadetAvatar
                                  size="md"
                                  hairStyle={pilot.avatarHair}
                                  hairColor={pilot.avatarHairColor}
                                  clothing={pilot.avatarClothing}
                                  eyesStyle={pilot.avatarEyes}
                                  activity={pilot.avatarActivity}
                                  isActive={pilot.isActive}
                                />
                                
                                <span className="text-[10px] font-display font-semibold text-white/90 truncate mt-1">{pilot.name.split(" ")[1] || pilot.name}</span>
                              </div>
                            );
                          })}

                        </div>

                      </div>

                      {/* Right: Inspect Cadet Stats Sidebar */}
                      <div className="lg:col-span-4 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                          {selectedSeatDetails ? (
                            <motion.div
                              key={selectedSeatDetails.seat}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5 text-center space-y-4 shadow-xl relative overflow-visible"
                            >
                              <div className="relative size-24 mx-auto flex items-center justify-center overflow-visible">
                                <CadetAvatar
                                  size="md"
                                  hairStyle={selectedSeatDetails.avatarHair}
                                  hairColor={selectedSeatDetails.avatarHairColor}
                                  clothing={selectedSeatDetails.avatarClothing}
                                  eyesStyle={selectedSeatDetails.avatarEyes}
                                  activity={selectedSeatDetails.avatarActivity}
                                  isActive={selectedSeatDetails.isActive}
                                />
                              </div>
                              
                              <div>
                                <h4 className="font-display font-extrabold text-sm text-purple-300">
                                  {selectedSeatDetails.name}
                                </h4>
                                <p className="text-[10px] text-white/40 font-mono mt-0.5">Study Pod {selectedSeatDetails.seat}</p>
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
                              
                              <button
                                onClick={() => sendFocusVibes(selectedSeatDetails.seat)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shadow-purple-600/20"
                              >
                                <Sparkles className="size-3.5" />
                                <span>Send Focus Vibes</span>
                              </button>
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
                                Click any active pilot cadet's pod in the Lounge to inspect their live study stats and send focus vibes!
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </div>

                    {/* ========================================================
                        CUSTOMIZER CLOSET BOTTOM DRAWER (PARITY WITH SCREENSHOT!)
                       ======================================================== */}
                    <div className="rounded-3xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                      
                      {/* closet panel header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="size-5 text-electric-400" />
                          <div>
                            <h4 className="font-display font-extrabold text-sm text-white">VoyageIQ Duty Free Store Closet</h4>
                            <p className="text-[10px] text-white/40">Personalize your spiky chibi study cadet hair, outfit, eyes, and study emotes!</p>
                          </div>
                        </div>

                        {/* currency pills */}
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-pink-500/10 border border-pink-500/25 px-3 py-1 text-[10px] font-bold text-pink-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                            🌸 Season 1
                          </span>
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-3 py-1 text-[10px] font-bold text-amber-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            🍌 3
                          </span>
                          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                            🪙 {walletCoins}
                          </span>
                        </div>
                      </div>

                      {/* customizer tabs selector */}
                      <div className="flex bg-navy-950/60 border border-white/5 rounded-2xl p-1 max-w-md">
                        {(["daily", "emotes", "skins", "owned"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setCustomizeTab(tab)}
                            className={`flex-1 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-xl transition duration-300 ${
                              customizeTab === tab
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-white/45 hover:text-white/70"
                            }`}
                          >
                            {tab === "daily" ? "Daily" : tab === "emotes" ? "Emotes" : tab === "skins" ? "Skins" : "Owned"}
                          </button>
                        ))}
                      </div>

                      {/* Customizer Grids content */}
                      <div className="min-h-[160px] pt-1">
                        
                        {/* EMOTES ACTIVITY TAB */}
                        {customizeTab === "emotes" && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                              { id: "activity_LAPTOP", name: "Laptop", value: "LAPTOP", price: 0, icon: "💻", desc: "Alternating rapid typing with terminal code glow." },
                              { id: "activity_BOOK", name: "Book", value: "BOOK", price: 120, icon: "📚", desc: "Comfy sitting sway reading and slow pages turning." },
                              { id: "activity_WRITING", name: "Writing", value: "WRITING", price: 180, icon: "📝", desc: "Focused notebook note scribbling and pencil sketch." },
                              { id: "activity_CHILL", name: "Coffee Chill", value: "CHILL", price: 250, icon: "☕", desc: "Steaming coffee/tea sipping lift cycle." },
                            ].map((item) => {
                              const isOwned = item.price === 0 || ownedItems.includes(item.id);
                              const isEquipped = avatarActivity === item.value;
                              
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => isOwned && equipItem("activity", item.value, item.id)}
                                  className={`relative rounded-2xl border p-3.5 flex flex-col justify-between items-center text-center transition duration-300 cursor-pointer ${
                                    isEquipped
                                      ? "border-emerald-400 bg-emerald-500/5 shadow-[0_0_12px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
                                      : "border-white/5 bg-navy-950/30 hover:border-white/10 hover:bg-navy-950/50"
                                  }`}
                                >
                                  {isEquipped && (
                                    <span className="absolute top-1.5 right-2 bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-[6px] font-extrabold uppercase px-1 rounded">
                                      Equipped
                                    </span>
                                  )}
                                  <span className="text-2xl mt-1">{item.icon}</span>
                                  <div className="mt-1">
                                    <p className="text-[10px] font-bold text-white">{item.name}</p>
                                    <p className="text-[7px] text-white/35 line-clamp-1 mt-0.5">{item.desc}</p>
                                  </div>
                                  
                                  {/* purchase / select action button */}
                                  <div className="w-full mt-3">
                                    {isEquipped ? (
                                      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold py-1 rounded-xl">Equipped</div>
                                    ) : isOwned ? (
                                      <button className="w-full bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold py-1 rounded-xl transition">Equip</button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          purchaseItem(item.id, item.price, "activity", item.value);
                                        }}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-black text-[8px] font-bold py-1 rounded-xl transition flex items-center justify-center gap-1"
                                      >
                                        <span>🪙 {item.price}</span>
                                        <span>Buy</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* SKINS CUSTOMIZER TAB */}
                        {customizeTab === "skins" && (
                          <div className="space-y-4">
                            
                            {/* Hair style row */}
                            <div>
                              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1.5 pl-1">Hair Styles Closet</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { id: "hair_spiky", name: "Spiky Black", value: "spiky", color: "black", price: 0, desc: "Classic spiky bangs style." },
                                  { id: "hair_bob", name: "Sleek Bob", value: "bob", color: "purple", price: 100, desc: "Clean rounded bob styling." },
                                  { id: "hair_curls", name: "Curly Buns", value: "curls", color: "blonde", price: 120, desc: "Fluffy side twin buns styling." },
                                  { id: "hair_pilot", name: "Pilot Cap", value: "pilot", color: "black", price: 200, desc: "Official flight crew peaked visor cap." },
                                ].map((item) => {
                                  const isOwned = item.price === 0 || ownedItems.includes(item.id);
                                  const isEquipped = avatarHair === item.value;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => isOwned && equipItem("hair", item.value, item.id)}
                                      className={`relative rounded-xl border p-2 flex items-center gap-2.5 transition duration-300 cursor-pointer ${
                                        isEquipped
                                          ? "border-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(52,211,153,0.12)]"
                                          : "border-white/5 bg-navy-950/30 hover:border-white/10 hover:bg-navy-950/50"
                                      }`}
                                    >
                                      <div className="size-8 rounded bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-xs">{item.value === "pilot" ? "🎓" : "💇‍♂️"}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-white truncate">{item.name}</p>
                                        {isEquipped ? (
                                          <span className="text-[7px] font-bold text-emerald-400">Equipped</span>
                                        ) : isOwned ? (
                                          <span className="text-[7px] text-white/50">Equip</span>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              purchaseItem(item.id, item.price, "hair", item.value);
                                            }}
                                            className="text-[7px] font-bold text-amber-400 hover:text-amber-300 transition"
                                          >
                                            🪙 {item.price} Buy
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Clothing style row */}
                            <div>
                              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1.5 pl-1">Clothing outfits</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                  { id: "clothing_tanktop", name: "Black Tank Top", value: "tanktop", price: 0, desc: "Default cool tank collar tee." },
                                  { id: "clothing_hoodie", name: "Cozy Hoodie", value: "hoodie", price: 150, desc: "Cozy light sky drawstring hoodie." },
                                  { id: "clothing_uniform", name: "Pilot Suit", value: "uniform", price: 300, desc: "Official navy pilot crew suit & gold tie." },
                                  { id: "clothing_rose_tee", name: "Rose Tee", value: "rose_tee", price: 120, desc: "Warm pastel crewneck rose shirt." },
                                ].map((item) => {
                                  const isOwned = item.price === 0 || ownedItems.includes(item.id);
                                  const isEquipped = avatarClothing === item.value;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => isOwned && equipItem("clothing", item.value, item.id)}
                                      className={`relative rounded-xl border p-2 flex items-center gap-2.5 transition duration-300 cursor-pointer ${
                                        isEquipped
                                          ? "border-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(52,211,153,0.12)]"
                                          : "border-white/5 bg-navy-950/30 hover:border-white/10 hover:bg-navy-950/50"
                                      }`}
                                    >
                                      <div className="size-8 rounded bg-neutral-900 border border-white/5 flex items-center justify-center shrink-0">
                                        <span className="text-xs">👕</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-white truncate">{item.name}</p>
                                        {isEquipped ? (
                                          <span className="text-[7px] font-bold text-emerald-400">Equipped</span>
                                        ) : isOwned ? (
                                          <span className="text-[7px] text-white/50">Equip</span>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              purchaseItem(item.id, item.price, "clothing", item.value);
                                            }}
                                            className="text-[7px] font-bold text-amber-400 hover:text-amber-300 transition"
                                          >
                                            🪙 {item.price} Buy
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        )}

                        {/* DAILY PERKS TAB */}
                        {customizeTab === "daily" && (
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { id: "perk_espresso", name: "Lofi Espresso Multiplier", price: 100, icon: "☕", desc: "Adds +0.5x multiplier to focus coins earned." },
                              { id: "perk_shield", name: "Focus Shield Boost", price: 150, icon: "🛡️", desc: "Improves pressure comfort rating, boosting focus focus stability." },
                            ].map((item) => {
                              const isOwned = ownedItems.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="rounded-2xl border border-white/5 bg-navy-950/30 p-3.5 flex items-center gap-4 transition hover:border-white/10"
                                >
                                  <span className="text-3xl shrink-0">{item.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-white">{item.name}</p>
                                    <p className="text-[7px] text-white/35 mt-0.5">{item.desc}</p>
                                    
                                    <div className="mt-2.5">
                                      {isOwned ? (
                                        <span className="inline-block bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[7px] font-bold px-2.5 py-0.5 rounded-full">Equipped Active</span>
                                      ) : (
                                        <button
                                          onClick={() => purchaseItem(item.id, item.price, "clothing", "tanktop")} 
                                          className="bg-amber-500 hover:bg-amber-400 text-black text-[7px] font-bold px-3 py-1 rounded-lg transition"
                                        >
                                          🪙 {item.price} Booster
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* OWNED ITEMS IN CLOSED CLOSET TAB */}
                        {customizeTab === "owned" && (
                          <div className="flex flex-wrap gap-2.5">
                            {ownedItems.length === 0 ? (
                              <p className="text-xs text-white/35 italic pl-1">No custom assets bought yet. Browse Skins or Emotes grids to buy items!</p>
                            ) : (
                              ownedItems.map((id) => {
                                const itemName = id.replace("hair_", "Hair ").replace("clothing_", "Outfit ").replace("activity_", "Emote ").replace("eyes_", "Eyes ").replace("_", " ").toUpperCase();
                                return (
                                  <div
                                    key={id}
                                    className="rounded-xl border border-white/5 bg-navy-950/40 px-3.5 py-2 flex items-center gap-2 text-[9px] font-bold text-white/80"
                                  >
                                    <span className="text-xs">⭐</span>
                                    <span>{itemName}</span>
                                    <span className="text-[7px] font-extrabold text-emerald-400 uppercase tracking-widest pl-1">Unlocked</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

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
