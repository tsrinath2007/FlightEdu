"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Shield, Compass, Navigation, Award, Volume2, VolumeX, AlertTriangle, 
  Play, Pause, LogOut, CheckCircle2, ChevronRight, ChevronLeft, Compass as AltimeterIcon,
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
  studySubject?: string;
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
  isPrivate?: boolean;
  hostId?: string;
  inviteCode?: string;
  participants?: any[];
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
  userId?: string;
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
  const [walletCoins, setWalletCoins] = useState(0);
  const [customizeTab, setCustomizeTab] = useState<"daily" | "emotes" | "skins" | "owned">("emotes");
  const [sendingEnergy, setSendingEnergy] = useState<string | null>(null);

  // Fullscreen Immersive states
  const [isFullscreenLounge, setIsFullscreenLounge] = useState(false);
  const [timerDisplayMode, setTimerDisplayMode] = useState<"clock" | "minutes">("clock");
  const [timerCountMode, setTimerCountMode] = useState<"down" | "up">("down");

  // Multiplayer Seat States
  const [multiplayerPilots, setMultiplayerPilots] = useState<MultiplayerPilot[]>(INITIAL_MULTIPLAYER_PILOTS);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<MultiplayerPilot | null>(null);
  const [relocatingSeat, setRelocatingSeat] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/onboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const activePilots = React.useMemo(() => {
    if (session?.isPrivate) {
      return multiplayerPilots.filter((p) => !!p.userId);
    }
    return multiplayerPilots;
  }, [session?.isPrivate, multiplayerPilots]);

  const isHost = React.useMemo(() => {
    if (!session || !currentUser) return false;
    return session.hostId === currentUser.id;
  }, [session, currentUser]);

  const pendingBoarders = React.useMemo(() => {
    if (!session || !session.participants) return [];
    return session.participants.filter((p: any) => !p.isAccepted);
  }, [session]);

  const handleApproveBoarding = async (targetUserId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, approve }),
      });
      if (res.ok) {
        // Optimistically update local session state to trigger instant UI refresh
        setSession((prev) => {
          if (!prev || !prev.participants) return prev;
          if (approve) {
            return {
              ...prev,
              participants: prev.participants.map((p) =>
                p.userId === targetUserId ? { ...p, isAccepted: true } : p
              ),
            };
          } else {
            return {
              ...prev,
              participants: prev.participants.filter((p) => p.userId !== targetUserId),
            };
          }
        });
        fetchParticipants();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process boarding request");
      }
    } catch (e) {
      alert("Failed to process boarding request");
    }
  };

  // Invite friends states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Fetch and sync session & participants
  const fetchParticipants = useCallback(async () => {
    // Prioritize local session if present (offline fallback)
    const localSession = localStorage.getItem(`flight_session_${sessionId}`);
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession) as FlightSession;
        setSession(parsed);
      } catch {}
    }

    try {
      // Add cache-busting timestamp to prevent client component fetch caching
      const res = await fetch(`/api/sessions/${sessionId}?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json() as { session: FlightSession & { participants?: any[] } };
        setSession(data.session);
        
        // Replace mock pilots with real ones
        if (data.session.participants) {
          const localUser = localStorage.getItem("flightedu_onboarding");
          let myId = currentUser?.id || "";
          if (!myId && localUser) {
            try {
              myId = JSON.parse(localUser).id || "";
            } catch {}
          }
          
          let mySeat = "12D";
          const localConfig = localStorage.getItem(`flight_config_${sessionId}`);
          if (localConfig) {
            try {
              mySeat = JSON.parse(localConfig).seatNumber || "12D";
            } catch {}
          }
          
          // Filter out the current user, and only include participants who have accepted the invite
          const filteredParticipants = data.session.participants.filter(p => p.userId !== myId && p.isAccepted);
          
          const mapped = filteredParticipants.map((p, idx) => {
            const u = p.user;
            
            // Prioritize database-persisted seat, fallback to static seat assignment
            let seat = p.seat;
            if (!seat) {
              const seats = ["1A", "2D", "4C", "8F", "14D", "26B", "32J"];
              const availableSeats = seats.filter(s => s !== mySeat);
              seat = availableSeats[idx % availableSeats.length] || "8F";
            }
            
            return {
              seat,
              name: u.name || "Pilot",
              subject: u.studyTime || "Focus Study",
              focusTime: u.studyDuration || "Flexible",
              streak: u.currentStreak || 0,
              coins: u.coins || 0,
              avatarHair: "spiky" as HairStyle,
              avatarHairColor: "black",
              avatarClothing: "uniform" as ClothingStyle,
              avatarEyes: "glossy" as EyesStyle,
              avatarActivity: "LAPTOP" as ActivityType,
              isActive: true,
              userId: u.id,
            };
          });
          
          if (data.session.isPrivate) {
            setMultiplayerPilots(mapped);
          } else {
            // For public sessions, merge real participants and simulated participants, making sure seats don't overlap!
            const realSeats = new Set(mapped.map(p => p.seat));
            const activeSimulated = INITIAL_MULTIPLAYER_PILOTS.filter(p => !realSeats.has(p.seat) && p.seat !== mySeat);
            setMultiplayerPilots([...mapped, ...activeSimulated]);
          }
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      setSession((prev) => {
        if (prev) return prev;
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
        return defaultSession;
      });
    }
  }, [sessionId, currentUser]);

  // Initialize focus timer once session is loaded (runs only once per session setup)
  useEffect(() => {
    if (session && totalDurationSeconds === 0) {
      setSecondsRemaining(session.duration * 60);
      setTotalDurationSeconds(session.duration * 60);
    }
  }, [session, totalDurationSeconds]);

  // Fetch friends list to invite
  useEffect(() => {
    if (showInviteModal) {
      setLoadingFriends(true);
      fetch("/api/friends/request")
        .then((res) => res.json())
        .then((data) => {
          setFriendsList(data.friends || []);
        })
        .catch(() => {})
        .finally(() => setLoadingFriends(false));
    }
  }, [showInviteModal]);

  const handleInviteFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId }),
      });
      if (res.ok) {
        alert("Flight invite sent successfully!");
        fetchParticipants();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to invite friend");
      }
    } catch (e) {
      alert("Failed to send invite");
    }
  };

  const [clapCounts, setClapCounts] = useState<Record<string, number>>({});
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});

  const handleClap = (seat: string) => {
    setClapCounts(prev => ({ ...prev, [seat]: (prev[seat] || 0) + 1 }));
    try {
      const clapAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
      clapAudio.volume = 0.2;
      clapAudio.play().catch(() => {});
    } catch {}
  };

  const handleCheer = (seat: string) => {
    setCheerCounts(prev => ({ ...prev, [seat]: (prev[seat] || 0) + 1 }));
    try {
      const cheerAudio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
      cheerAudio.volume = 0.2;
      cheerAudio.play().catch(() => {});
    } catch {}
  };

  const handleNextPilot = () => {
    if (activePilots.length <= 1) return;
    const currentIndex = activePilots.findIndex(p => p.seat === selectedSeatDetails?.seat);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % activePilots.length;
    setSelectedSeatDetails(activePilots[nextIndex]);
  };

  const handlePrevPilot = () => {
    if (activePilots.length <= 1) return;
    const currentIndex = activePilots.findIndex(p => p.seat === selectedSeatDetails?.seat);
    const prevIndex = currentIndex === -1 ? activePilots.length - 1 : (currentIndex - 1 + activePilots.length) % activePilots.length;
    setSelectedSeatDetails(activePilots[prevIndex]);
  };

  const syncSeatToDatabase = useCallback(async (seatNum: string, currentSubject?: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/seat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          seatNumber: seatNum,
          studySubject: currentSubject
        }),
      });
      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "This seat is already occupied.");
      }
    } catch (e: any) {
      console.warn("Failed to sync seat to database:", e);
      throw e;
    }
  }, [sessionId]);

  const handleKickParticipant = async (targetUserId: string) => {
    const confirmKick = confirm("Are you sure you want to remove this pilot from the cabin?");
    if (!confirmKick) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}/kick`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (res.ok) {
        alert("Pilot removed from the cabin.");
        setSelectedSeatDetails(null);
        fetchParticipants();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to kick participant");
      }
    } catch (e) {
      alert("Failed to kick participant");
    }
  };

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
    // Load wallet from profile (DB-persisted coins or localStorage onboarding cache)
    let profileCoins = 0;
    try {
      const cached = localStorage.getItem("flightedu_onboarding");
      if (cached) {
        const parsed = JSON.parse(cached);
        profileCoins = Number(parsed.coins) || 0;
      }
    } catch {}
    // Session-specific earned coins are layered on top
    const savedSessionCoins = localStorage.getItem(`wallet_coins_${sessionId}`);
    if (savedSessionCoins) {
      setWalletCoins(Number(savedSessionCoins));
    } else {
      setWalletCoins(profileCoins);
      localStorage.setItem(`wallet_coins_${sessionId}`, String(profileCoins));
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
        const parsed = JSON.parse(localConfig);
        setConfig(parsed);
        syncSeatToDatabase(parsed.seatNumber, parsed.studySubject);
      } catch (e) {
        console.error("Config parse fail:", e);
      }
    } else {
      const def = {
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
        studySubject: "Focus Study",
      };
      setConfig(def as any);
      syncSeatToDatabase(def.seatNumber, def.studySubject);
    }

    fetchParticipants();
  }, [sessionId, fetchParticipants, syncSeatToDatabase]);

  // Dynamic Polling for Multiplayer Cabin Participants
  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [sessionId, fetchParticipants]);

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
      // Sync earned coins to profile on landing
      syncCoinsToProfile();
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
      setRelocatingSeat(seatId);
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

  const syncCoinsToProfile = async (overrideCoins?: number) => {
    const finalCoins = overrideCoins !== undefined ? overrideCoins : Math.min(100, Math.round(coinsEarned));
    const isCompleted = secondsRemaining === 0;

    // Persist earned coins back to the localStorage profile cache
    try {
      const cached = localStorage.getItem("flightedu_onboarding");
      if (cached) {
        const parsed = JSON.parse(cached);
        const currentCoins = Number(parsed.coins) || 0;
        parsed.coins = Math.max(0, currentCoins + finalCoins);
        localStorage.setItem("flightedu_onboarding", JSON.stringify(parsed));
      }
    } catch {}
    // Also try DB sync with keepalive to prevent browser cancel on page navigation
    try {
      const elapsedSeconds = totalDurationSeconds - secondsRemaining;
      await fetch("/api/user/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinsEarned: finalCoins,
          secondsFocused: elapsedSeconds,
          sessionId: sessionId,
          completed: isCompleted,
        }),
        keepalive: true,
      });
    } catch (e) {
      console.warn("DB coin sync failed:", e);
    }
  };

  const handleEject = async () => {
    // Fail-safe check for session mode via state and direct localStorage cache
    let currentMode = session?.mode;
    if (!currentMode) {
      try {
        const localSession = localStorage.getItem(`flight_session_${sessionId}`);
        if (localSession) {
          const parsed = JSON.parse(localSession);
          currentMode = parsed.mode;
        }
      } catch (err) {
        console.warn("Fail-safe session cache read failed:", err);
      }
    }

    let finalCoins = Math.min(100, Math.round(coinsEarned));

    if (currentMode === "HARDCORE") {
      const confirmEject = confirm("⚠️ WARNING: Hardcore Flight Mode engaged. Ejecting early will cost -500 focus coins! Do you still want to eject?");
      if (!confirmEject) return;
      
      // Deduct 500 focus coins for early ejection in Hardcore mode!
      finalCoins = -500;
    }
    if (audioRef.current) audioRef.current.pause();
    await syncCoinsToProfile(finalCoins);
    router.push("/dashboard");
  };

  const renderSeat = (seatId: string) => {
    if (!config) return null;
    const isMe = config.seatNumber === seatId;
    const pilot = activePilots.find((p) => p.seat === seatId);
    const isOccupied = !!pilot && !isMe;

    if (isMe) {
      return (
        <div
          onClick={() => {
            setSelectedSeatDetails(null);
            try {
              const tap = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
              tap.volume = 0.15;
              tap.play().catch(() => {});
            } catch (e) {}
          }}
          className="relative group w-14 h-14 shrink-0 flex flex-col items-center justify-between rounded-xl p-1 border transition duration-300 cursor-pointer bg-electric-500/10 border-electric-400 shadow-[0_0_12px_rgba(56,189,248,0.3)] ring-1 ring-electric-400/30"
        >
          <span className="text-[6px] font-mono font-bold text-electric-400 uppercase leading-none">YOU</span>
          <CadetAvatar
            size="sm"
            hairStyle={avatarHair}
            hairColor={avatarHairColor}
            clothing={avatarClothing}
            eyesStyle={avatarEyes}
            activity={avatarActivity}
            isActive={isActive}
            className="scale-90"
          />
        </div>
      );
    }

    if (isOccupied && pilot) {
      const isSelected = selectedSeatDetails?.seat === pilot.seat;
      return (
        <div
          onClick={() => handleSeatClick(pilot.seat, true, pilot)}
          className={`relative group w-14 h-14 shrink-0 flex flex-col items-center justify-between rounded-xl p-1 border transition duration-300 cursor-pointer ${
            isSelected
              ? "bg-purple-500/15 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/30"
              : "bg-navy-900/40 border-white/5 hover:border-white/12 hover:bg-navy-900/60"
          }`}
        >
          <span className="text-[6px] font-mono font-bold text-purple-400 uppercase leading-none">{pilot.seat}</span>
          <CadetAvatar
            size="sm"
            hairStyle={pilot.avatarHair}
            hairColor={pilot.avatarHairColor}
            clothing={pilot.avatarClothing}
            eyesStyle={pilot.avatarEyes}
            activity={pilot.avatarActivity}
            isActive={pilot.isActive}
            className="scale-90"
          />
        </div>
      );
    }

    return (
      <button
        onClick={() => handleSeatClick(seatId, false)}
        className="w-14 h-14 shrink-0 bg-navy-950/50 hover:bg-electric-500/20 hover:border-electric-400/40 border border-white/5 rounded-xl cursor-pointer flex flex-col items-center justify-center transition duration-300 font-mono text-[9px] font-bold text-white/20"
      >
        <span>💺</span>
        <span className="text-[7px] text-white/30 tracking-wider mt-0.5">{seatId}</span>
      </button>
    );
  };

  const getFullscreenTimerText = () => {
    const elapsedSecs = totalDurationSeconds - secondsRemaining;
    const targetSecs = timerCountMode === "down" ? secondsRemaining : elapsedSecs;
    const sign = timerCountMode === "down" ? "-" : "+";

    if (timerDisplayMode === "minutes") {
      const minutes = Math.floor(targetSecs / 60);
      return `${sign}${minutes}m`;
    } else {
      const h = Math.floor(targetSecs / 3600);
      const m = Math.floor((targetSecs % 3600) / 60);
      const s = targetSecs % 60;
      return `${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
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

        <div className="flex flex-wrap items-center gap-4">
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

          {/* Copyable Boarding Code pill */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(session?.inviteCode || sessionId.substring(0, 8).toUpperCase());
              alert("🎫 Boarding Code copied! Share it with your friends.");
            }}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-full px-4 py-2 font-mono text-[10px] text-emerald-400 font-bold transition duration-300 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/5 select-none"
          >
            <span>🎫 CODE: <strong>{session?.inviteCode || sessionId.substring(0, 8).toUpperCase()}</strong></span>
            <span className="text-[8px] bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider font-bold">Copy</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8">
        
        {/* Core Console Cockpit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Instruments, Checklist, Sound Deck */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Host Boarding Alerts HUD card */}
            {isHost && pendingBoarders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-md space-y-4 shadow-xl shadow-yellow-500/5"
              >
                <div className="flex items-center gap-2">
                  <span className="animate-ping size-2 rounded-full bg-yellow-400" />
                  <h3 className="font-display text-xs font-black tracking-widest text-yellow-400 uppercase">
                    📡 Boarding Clearance Request
                  </h3>
                </div>
                <p className="text-xs text-white/70 leading-normal">
                  A cadet is requesting clearance to board this private flight cabin:
                </p>
                <div className="space-y-3 pt-1">
                  {pendingBoarders.map((participant: any) => (
                    <div key={participant.userId} className="flex flex-col gap-3 bg-white/4 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center font-display font-extrabold text-yellow-300 text-xs">
                          {participant.user?.name?.substring(0, 2).toUpperCase() || "CD"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{participant.user?.name || "Pilot Cadet"}</p>
                          <p className="text-[9px] font-mono text-white/40 mt-0.5 font-bold text-yellow-400">
                            Subject: {participant.user?.studyTime || "Focus Study"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <button
                          onClick={() => handleApproveBoarding(participant.userId, false)}
                          className="py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/50 text-red-400 font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveBoarding(participant.userId, true)}
                          className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

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
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsFullscreenLounge(true);
                            try {
                              const slide = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
                              slide.volume = 0.2;
                              slide.play().catch(() => {});
                            } catch (e) {}
                          }}
                          className="rounded-full bg-electric-500/10 border border-electric-500/25 hover:bg-electric-500/20 px-3.5 py-1 text-[10px] font-bold text-electric-400 flex items-center gap-1.5 transition shadow-[0_0_8px_rgba(14,165,233,0.1)] cursor-pointer"
                        >
                          <span>💻</span>
                          <span>Immersive Focus Mode</span>
                        </button>
                        
                        {session?.isPrivate && session.hostId === currentUser?.id && (
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 transition shadow-[0_0_8px_rgba(16,185,129,0.15)] cursor-pointer"
                          >
                            <span>👥</span>
                            <span>Invite Wingman</span>
                          </button>
                        )}

                        <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-[10px] font-bold text-purple-400 animate-pulse select-none">
                          ● {activePilots.length + 1} Pilots In Cabin
                        </span>
                      </div>
                    </div>

                    {/* Interactive 2D Lounge layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
                      
                      {/* Left: 2D Interactive Lounge Pods */}
                      <div className="lg:col-span-8 bg-black/35 rounded-3xl border border-white/5 p-6 min-h-[380px] relative flex flex-col justify-between overflow-hidden shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)]">
                        
                        {/* Energy Vibes Streaming Beam Line */}
                        <AnimatePresence>
                          {sendingEnergy && (() => {
                            const target = activePilots.find(p => p.seat === sendingEnergy);
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

                        {/* Airplane Cabin Floor Plan Map */}
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-1 select-none scrollbar-thin scrollbar-thumb-white/10">
                          
                          {/* Nose / Cockpit visual header */}
                          <div className="flex flex-col items-center justify-center border-b border-dashed border-white/10 pb-4">
                            <div className="w-16 h-8 bg-gradient-to-t from-slate-800 to-slate-900 rounded-t-full border-t border-x border-white/20 flex items-center justify-center shadow-md">
                              <span className="text-[7px] font-mono font-bold text-white/40 tracking-widest uppercase">Flight Deck</span>
                            </div>
                            <div className="w-px h-4 bg-gradient-to-b from-white/20 to-transparent" />
                          </div>

                          {/* 1. FIRST CLASS (Rows 1-2) */}
                          <div className="space-y-2">
                            <p className="text-[7px] font-mono font-extrabold tracking-[0.2em] uppercase text-center text-amber-400">✦ First Class Suites ✦</p>
                            
                            {[1, 2].map((rowNum) => (
                              <div key={rowNum} className="flex items-center justify-center gap-6">
                                {/* Left Seat: A */}
                                {renderSeat(`${rowNum}A`)}
                                {/* Center Aisle row label */}
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 font-bold select-none">{rowNum}</div>
                                {/* Right Seat: D */}
                                {renderSeat(`${rowNum}D`)}
                              </div>
                            ))}
                          </div>

                          <div className="h-px bg-white/5 my-1" />

                          {/* 2. BUSINESS CLASS (Rows 4-8) */}
                          <div className="space-y-2">
                            <p className="text-[7px] font-mono font-extrabold tracking-[0.2em] uppercase text-center text-electric-400">✦ Business Pods ✦</p>
                            
                            {[4, 8].map((rowNum) => (
                              <div key={rowNum} className="flex items-center justify-center gap-3">
                                {/* Left Seats: A, C */}
                                <div className="flex gap-2">
                                  {renderSeat(`${rowNum}A`)}
                                  {renderSeat(`${rowNum}C`)}
                                </div>
                                {/* Center Aisle */}
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 font-bold select-none">{rowNum}</div>
                                {/* Right Seat: F */}
                                {renderSeat(`${rowNum}F`)}
                              </div>
                            ))}
                          </div>

                          <div className="h-px bg-white/5 my-1" />

                          {/* 3. ECONOMY CLASS (Rows 14-32) */}
                          <div className="space-y-2">
                            <p className="text-[7px] font-mono font-extrabold tracking-[0.2em] uppercase text-center text-white/30">✦ Main Cabin Economy ✦</p>
                            
                            {[14, 26, 32].map((rowNum) => (
                              <div key={rowNum} className="flex items-center justify-center gap-3">
                                {/* Left Seats: A, B */}
                                <div className="flex gap-1.5">
                                  {renderSeat(`${rowNum}A`)}
                                  {renderSeat(`${rowNum}B`)}
                                </div>
                                {/* Center Aisle */}
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 font-bold select-none">{rowNum}</div>
                                {/* Right Seats: D, J */}
                                <div className="flex gap-1.5">
                                  {renderSeat(`${rowNum}D`)}
                                  {renderSeat(`${rowNum}J`)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tail visual footer */}
                          <div className="flex flex-col items-center justify-center border-t border-dashed border-white/10 pt-4 mt-2">
                            <div className="w-px h-4 bg-gradient-to-t from-white/20 to-transparent" />
                            <div className="w-10 h-3 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b border-b border-x border-white/10 flex justify-center items-end" />
                          </div>

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
                              className="bg-white/5 border border-white/10 rounded-[32px] p-6 text-center space-y-4 shadow-2xl relative overflow-visible backdrop-blur-xl max-w-sm mx-auto w-full"
                            >
                              {/* Top Banner details */}
                              <div className="flex items-center justify-between pb-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {selectedSeatDetails.seat.endsWith("A") ? "🇳🇱" : selectedSeatDetails.seat.endsWith("D") ? "🇮🇳" : selectedSeatDetails.seat.endsWith("C") ? "🇸🇬" : "🇺🇸"}
                                  </span>
                                  <div className="text-left">
                                    <h4 className="font-display font-extrabold text-sm text-white tracking-wide leading-tight">
                                      {selectedSeatDetails.name}
                                    </h4>
                                    <p className="text-[9px] text-white/40 font-mono">
                                      @{selectedSeatDetails.userId ? `pilot_${selectedSeatDetails.userId.substring(0, 5)}` : `crew_${selectedSeatDetails.seat}`}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Time Elapsed Badge */}
                                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-emerald-400 font-bold font-mono text-[10px] sm:text-xs shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                                  {selectedSeatDetails.focusTime}
                                </div>
                              </div>

                              {/* Stats Capsule Grid */}
                              <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 rounded-2xl p-2.5">
                                <div className="text-center">
                                  <p className="text-sm font-black text-white leading-none">{selectedSeatDetails.streak}d</p>
                                  <p className="text-[7.5px] font-mono text-white/45 uppercase tracking-wider mt-1">Streak</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                  <p className="text-sm font-black text-white leading-none">{selectedSeatDetails.focusTime}</p>
                                  <p className="text-[7.5px] font-mono text-white/45 uppercase tracking-wider mt-1">Focused</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-black text-white leading-none">🪙 {selectedSeatDetails.coins}</p>
                                  <p className="text-[7.5px] font-mono text-white/45 uppercase tracking-wider mt-1">Coins</p>
                                </div>
                              </div>

                              {/* Year / Cabin Class Banner */}
                              <div className="rounded-xl bg-white/[0.04] py-1.5 px-3 text-[9px] font-bold text-white/70 font-mono uppercase tracking-wider text-center">
                                {(() => {
                                  const row = parseInt(selectedSeatDetails.seat.replace(/[A-Z]/g, "")) || 1;
                                  return row <= 2 ? "First Class Suite" : row <= 8 ? "Business Class Pod" : row <= 14 ? "Premium Economy Seat" : "Economy Class Pod";
                                })()}
                              </div>

                              {/* Current Task Capsule */}
                              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-3 space-y-1.5 text-left">
                                <div className="flex items-center justify-between text-[7px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                                  <span>⚡ Current Task</span>
                                  <button
                                    onClick={() => handleClap(selectedSeatDetails.seat)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-white font-bold hover:bg-blue-500/20 active:scale-95 transition text-[8px] cursor-pointer"
                                  >
                                    👏 {clapCounts[selectedSeatDetails.seat] || 1}
                                  </button>
                                </div>
                                <p className="text-[10px] font-bold text-white leading-tight">
                                  📚 {selectedSeatDetails.subject}
                                </p>
                              </div>

                              {/* Dream Mandate Capsule */}
                              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-3 space-y-1.5 text-left">
                                <div className="flex items-center justify-between text-[7px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                                  <span>⭐ My Dream</span>
                                  <button
                                    onClick={() => handleCheer(selectedSeatDetails.seat)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-white font-bold hover:bg-amber-500/20 active:scale-95 transition text-[8px] cursor-pointer"
                                  >
                                    🎉 {cheerCounts[selectedSeatDetails.seat] || 3}
                                  </button>
                                </div>
                                <p className="text-[9px] font-medium text-white/80 leading-normal italic">
                                  “Fly high, reach uni, study my dream job, and conquer this study session!”
                                </p>
                              </div>

                              {/* Action Gift button */}
                              <button
                                onClick={() => {
                                  sendFocusVibes(selectedSeatDetails.seat);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider transition duration-300 shadow-lg shadow-orange-600/15 active:scale-[0.98] cursor-pointer"
                              >
                                <span>☕</span>
                                <span>Gift Coffee Vibes</span>
                              </button>

                              {/* Kick button if Host of private session */}
                              {session?.isPrivate && session.hostId === currentUser?.id && selectedSeatDetails.userId && selectedSeatDetails.userId !== currentUser?.id && (
                                <button
                                  onClick={() => handleKickParticipant(selectedSeatDetails.userId!)}
                                  className="w-full flex items-center justify-center gap-2 py-1.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 font-extrabold text-[8px] uppercase tracking-wider transition duration-300"
                                >
                                  <LogOut className="size-3 rotate-180" />
                                  <span>Kick Cadet ❌</span>
                                </button>
                              )}

                              {/* Footer selectors */}
                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <button
                                  onClick={handlePrevPilot}
                                  className="size-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
                                  title="Previous Cadet"
                                >
                                  <ChevronLeft className="size-4" />
                                </button>
                                
                                <button
                                  onClick={() => setSelectedSeatDetails(null)}
                                  className="px-5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-extrabold text-[9px] uppercase tracking-widest transition cursor-pointer"
                                >
                                  Close
                                </button>

                                <button
                                  onClick={handleNextPilot}
                                  className="size-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
                                  title="Next Cadet"
                                >
                                  <ChevronRight className="size-4" />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty-details"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="rounded-3xl border border-white/5 bg-white/4 p-5 text-center text-white/45 text-xs flex flex-col items-center justify-center min-h-[220px] max-w-sm mx-auto w-full"
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
          {/* IMMERSIVE FULLSCREEN FOCUS LOUNGE OVERLAY */}
          <AnimatePresence>
            {isFullscreenLounge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="fixed inset-0 z-50 bg-[#070b18]/98 backdrop-blur-2xl flex flex-col justify-between p-6 md:p-8 select-none"
              >
                {/* 1. Header Ticket bar: Top-Left customizable Clock & Top-Right Exit */}
                <div className="flex items-center justify-between w-full pb-4 border-b border-white/5">
                  
                  {/* Top-Left togglable Clock */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTimerCountMode(prev => prev === "down" ? "up" : "down");
                        try {
                          const click = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
                          click.volume = 0.1;
                          click.play().catch(() => {});
                        } catch (e) {}
                      }}
                      className="size-8 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 flex items-center justify-center text-sm font-black text-electric-400 tracking-wider shadow-sm transition cursor-pointer"
                      title="Toggle count up (+) vs count down (-)"
                    >
                      {timerCountMode === "down" ? "−" : "+"}
                    </button>

                    <div 
                      onClick={() => {
                        setTimerDisplayMode(prev => prev === "clock" ? "minutes" : "clock");
                        try {
                          const click = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav");
                          click.volume = 0.1;
                          click.play().catch(() => {});
                        } catch (e) {}
                      }}
                      className="cursor-pointer group select-none"
                      title="Click to toggle Clock format vs Minutes format"
                    >
                      <p className="text-[8px] font-mono font-bold tracking-widest text-white/30 uppercase group-hover:text-electric-400/80 transition">Flight Focus Clock</p>
                      <h2 className="font-mono text-2xl md:text-3xl font-extrabold text-white tracking-widest leading-none mt-1 shadow-neon filter drop-shadow-[0_0_8px_rgba(56,189,248,0.4)] group-hover:scale-102 transition-transform">
                        {getFullscreenTimerText()}
                      </h2>
                    </div>
                  </div>

                  {/* Flight telemetry stats centered (Aesthetic) */}
                  <div className="hidden md:flex items-center gap-6 font-mono text-[10px] text-white/35">
                    <div>
                      <span>ALT: </span>
                      <span className="font-bold text-white/70 animate-pulse">{altitude.toLocaleString()} FT</span>
                    </div>
                    <div>
                      <span>SPD: </span>
                      <span className="font-bold text-white/70">{speed} KM/H</span>
                    </div>
                    <div>
                      <span>COINS: </span>
                      <span className="font-bold text-amber-400">🪙 {coinsEarned.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Top-Right Exit Focus Mode button */}
                  <button
                    onClick={() => {
                      setIsFullscreenLounge(false);
                      try {
                        const click = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
                        click.volume = 0.2;
                        click.play().catch(() => {});
                      } catch (e) {}
                    }}
                    className="rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 px-4 py-2 text-[10px] font-bold text-red-400 tracking-wider transition uppercase cursor-pointer"
                  >
                    Exit Focus Mode ❌
                  </button>

                </div>

                {/* 2. Middle Main Body: Massive visual 2D Cabin Seating map floor plan */}
                <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-8 max-h-[70vh] overflow-hidden">
                  <div className="w-full max-w-lg bg-black/40 border border-white/5 rounded-3xl p-6 relative flex flex-col justify-between overflow-y-auto max-h-[85%] shadow-2xl">
                    
                    {/* Energy Vibes Streaming Beam Line Overlay inside fullscreen */}
                    <AnimatePresence>
                      {sendingEnergy && (() => {
                        const target = activePilots.find(p => p.seat === sendingEnergy);
                        if (!target) return null;
                        return (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none z-50 overflow-visible"
                          >
                            <svg className="absolute inset-0 w-full h-full">
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
                              <span className="text-xl animate-bounce">⚡✨🚀</span>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>

                    {/* Reuses our beautiful renderSeat layout dynamically inside fullscreen */}
                    <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-white/10">
                      
                      {/* Cockpit visual header */}
                      <div className="flex flex-col items-center justify-center border-b border-dashed border-white/10 pb-4">
                        <div className="w-18 h-9 bg-gradient-to-t from-slate-800 to-slate-900 rounded-t-full border-t border-x border-white/20 flex items-center justify-center shadow-lg">
                          <span className="text-[7.5px] font-mono font-bold text-white/50 tracking-widest uppercase animate-pulse">Flight Control</span>
                        </div>
                        <div className="w-px h-5 bg-gradient-to-b from-white/20 to-transparent" />
                      </div>

                      {/* 1. FIRST CLASS (Rows 1-2) */}
                      <div className="space-y-2">
                        <p className="text-[7.5px] font-mono font-extrabold tracking-[0.25em] uppercase text-center text-amber-400">✦ First Class Suites ✦</p>
                        {[1, 2].map((rowNum) => (
                          <div key={rowNum} className="flex items-center justify-center gap-8">
                            {renderSeat(`${rowNum}A`)}
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/35 font-bold select-none">{rowNum}</div>
                            {renderSeat(`${rowNum}D`)}
                          </div>
                        ))}
                      </div>

                      <div className="h-px bg-white/5 my-1.5" />

                      {/* 2. BUSINESS CLASS (Rows 4-8) */}
                      <div className="space-y-2">
                        <p className="text-[7.5px] font-mono font-extrabold tracking-[0.25em] uppercase text-center text-electric-400">✦ Business Pods ✦</p>
                        {[4, 8].map((rowNum) => (
                          <div key={rowNum} className="flex items-center justify-center gap-4">
                            <div className="flex gap-2.5">
                              {renderSeat(`${rowNum}A`)}
                              {renderSeat(`${rowNum}C`)}
                            </div>
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/35 font-bold select-none">{rowNum}</div>
                            {renderSeat(`${rowNum}F`)}
                          </div>
                        ))}
                      </div>

                      <div className="h-px bg-white/5 my-1.5" />

                      {/* 3. ECONOMY CLASS (Rows 14-32) */}
                      <div className="space-y-2">
                        <p className="text-[7.5px] font-mono font-extrabold tracking-[0.25em] uppercase text-center text-white/30">✦ Main Cabin Economy ✦</p>
                        {[14, 26, 32].map((rowNum) => (
                          <div key={rowNum} className="flex items-center justify-center gap-4">
                            <div className="flex gap-2">
                              {renderSeat(`${rowNum}A`)}
                              {renderSeat(`${rowNum}B`)}
                            </div>
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/35 font-bold select-none">{rowNum}</div>
                            <div className="flex gap-2">
                              {renderSeat(`${rowNum}D`)}
                              {renderSeat(`${rowNum}J`)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tail Visual exhaust */}
                      <div className="flex flex-col items-center justify-center border-t border-dashed border-white/10 pt-4 mt-2">
                        <div className="w-px h-5 bg-gradient-to-t from-white/20 to-transparent" />
                        <div className="w-12 h-3.5 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b border-b border-x border-white/10 flex justify-center items-end" />
                      </div>

                    </div>

                  </div>
                </div>

                {/* 3. Footer Control Deck: Changing Emote activity or Sound track on the fly in fullscreen */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                  
                  {/* Current assigned seat indicator */}
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-xl bg-electric-500/10 border border-electric-500/20 text-electric-400 flex items-center justify-center text-sm font-bold">💺</span>
                    <div>
                      <p className="text-[8px] font-mono font-bold text-white/30 uppercase">Assigned Cabin Seat</p>
                      <p className="text-[10px] text-white font-bold tracking-wide mt-0.5">Pod {config.seatNumber} • {config.cabinClass.name}</p>
                    </div>
                  </div>

                  {/* Fast Action Emote Quick Bar! */}
                  <div className="flex bg-navy-950 border border-white/5 rounded-2xl p-1 items-center gap-1.5 max-w-sm">
                    {[
                      { value: "LAPTOP", name: "Laptop 💻" },
                      { value: "BOOK", name: "Book 📚" },
                      { value: "WRITING", name: "Write 📝" },
                      { value: "CHILL", name: "Chill ☕" },
                    ].map((act) => {
                      const isOwned = act.value === "LAPTOP" || ownedItems.includes(`activity_${act.value}`);
                      const isEquipped = avatarActivity === act.value;
                      
                      return (
                        <button
                          key={act.value}
                          onClick={() => isOwned && equipItem("activity", act.value, `activity_${act.value}`)}
                          disabled={!isOwned}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase transition duration-300 ${
                            isEquipped
                              ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/15"
                              : !isOwned
                              ? "text-white/20 cursor-not-allowed opacity-50"
                              : "text-white/45 hover:bg-white/5 hover:text-white/80 cursor-pointer"
                          }`}
                        >
                          {act.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sound & Autopilot controllers */}
                  <div className="flex items-center gap-3">
                    {/* Ambient toggle */}
                    <button
                      onClick={toggleAmbience}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition duration-300 text-[9px] font-bold tracking-wider uppercase cursor-pointer ${
                        ambiencePlaying
                          ? "bg-electric-500/10 border-electric-400/40 text-electric-400"
                          : "bg-white/4 border-white/5 hover:bg-white/8 text-white/70"
                      }`}
                    >
                      <Volume2 className="size-3.5" />
                      <span>{ambiencePlaying ? "Sound Playing" : "Ambience Muted"}</span>
                    </button>

                    {/* Play/Pause Focus Timer */}
                    <button
                      onClick={toggleAutopilot}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl transition duration-300 text-[9px] font-extrabold tracking-widest uppercase cursor-pointer ${
                        isActive
                          ? "bg-amber-500 hover:bg-amber-400 text-navy-950"
                          : "bg-electric-500 hover:bg-electric-400 text-white"
                      }`}
                    >
                      {isActive ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
                      <span>{isActive ? "Pause Focus" : "Start Focus"}</span>
                    </button>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      {/* Invite Friends Modal overlay */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070b18]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c122c]/95 border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-md text-white flex items-center gap-2">
                  <span>🛫</span> Invite a Wingman
                </h3>
                <p className="text-xs text-white/40">
                  Invite your friends to study live with you in this private cabin.
                </p>
              </div>

              {/* Copier-Friendly Holographic Boarding Pass Code */}
              <div className="rounded-2xl border border-electric-500/20 bg-electric-500/5 p-4 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden">
                <span className="text-[8px] font-mono font-bold tracking-widest text-electric-400 uppercase">
                  🎫 Flight Boarding Pass Code
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-2xl font-black tracking-widest text-white selection:bg-electric-500">
                    {session?.inviteCode || sessionId.substring(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(session?.inviteCode || sessionId.substring(0, 8).toUpperCase());
                      alert("🎫 Boarding Code copied! Share it with your friends.");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white transition duration-300 cursor-pointer"
                  >
                    Copy Code 📋
                  </button>
                </div>
                <p className="text-[9px] text-white/40 text-center">
                  Share this Boarding Code with your wingman so they can enter it on their radar map and board your flight instantly!
                </p>
              </div>

              {/* Friends list scrollable */}
              <div className="pt-2">
                {loadingFriends ? (
                  <div className="flex justify-center py-8">
                    <div className="size-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                ) : friendsList.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs space-y-1">
                    <p>No crew members found.</p>
                    <p className="text-[10px] text-white/20">Add some friends first in your Dashboard Crew tab!</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {friendsList.map((friend) => {
                      const u = friend.user;
                      if (!u) return null;
                      const isAlreadyInCabin = activePilots.some((p) => p.userId === u.id);
                      return (
                        <div key={u.id} className="flex items-center justify-between bg-white/4 border border-white/5 rounded-2xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-display font-extrabold text-purple-300 text-xs uppercase">
                              {u.name?.substring(0, 2) || "PL"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{u.name}</p>
                              <p className="text-[9px] font-mono text-white/40 mt-0.5">ID: {u.pilotId}</p>
                            </div>
                          </div>
                          {isAlreadyInCabin ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                              In Cabin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInviteFriend(u.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-600/15"
                            >
                              Invite
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Seating Relocation Confirmation Modal */}
      <AnimatePresence>
        {relocatingSeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070b18]/80 backdrop-blur-md z-[110] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c122c]/95 border border-white/10 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl text-center space-y-5"
            >
              <div className="size-16 rounded-2xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-2xl mx-auto shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                💺
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-md text-white">Relocate to Study Pod {relocatingSeat}?</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Do you want to reassign your focus instruments and dashboard console to seat {relocatingSeat}?
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-bold uppercase tracking-wider">
                <button
                  onClick={() => setRelocatingSeat(null)}
                  className="py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const targetSeat = relocatingSeat;
                    setRelocatingSeat(null);
                    
                    if (config) {
                      const oldSeat = config.seatNumber;
                      try {
                        // Optimistically assign
                        const updatedConfig = { ...config, seatNumber: targetSeat };
                        setConfig(updatedConfig);
                        localStorage.setItem(`flight_config_${sessionId}`, JSON.stringify(updatedConfig));
                        setSelectedSeatDetails(null);
                        
                        await syncSeatToDatabase(targetSeat, config.studySubject);
                        
                        try {
                          const slide = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav");
                          slide.volume = 0.2;
                          slide.play().catch(() => {});
                        } catch (e) {}
                        
                        // Re-fetch participants to update local seating visual map immediately
                        fetchParticipants();
                      } catch (err: any) {
                        // Revert if double booked or failed!
                        const oldConfig = { ...config, seatNumber: oldSeat };
                        setConfig(oldConfig);
                        localStorage.setItem(`flight_config_${sessionId}`, JSON.stringify(oldConfig));
                        alert(err.message || "⚠️ This seat is already taken!");
                      }
                    }
                  }}
                  className="py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white transition duration-300 shadow-lg shadow-electric-600/15 cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
