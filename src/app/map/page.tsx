"use client";

import { useState, useEffect, useRef } from "react";
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
  lat: number; // Real GPS Latitude
  lng: number; // Real GPS Longitude
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
    lat: 25.2532,
    lng: 55.3657,
    country: "UAE", 
    timezone: "GMT+4", 
    description: "Ultra-modern desert metropolis, gateway between East and West.",
    preferredDestinations: ["blr", "hyd", "lhr", "sin", "bom", "del", "cdg", "doh", "cpt", "cai"] 
  },
  { 
    id: "blr", 
    name: "Bengaluru", 
    code: "BLR", 
    x: 65, 
    y: 52, 
    lat: 13.1986,
    lng: 77.7066,
    country: "India", 
    timezone: "GMT+5:30", 
    description: "The Silicon Valley of India, beautiful gardens and tech hubs.",
    preferredDestinations: ["dxb", "hyd", "sin", "hnd", "bom", "del"] 
  },
  { 
    id: "hyd", 
    name: "Hyderabad", 
    code: "HYD", 
    x: 64, 
    y: 49, 
    lat: 17.2403,
    lng: 78.4294,
    country: "India", 
    timezone: "GMT+5:30", 
    description: "Historic City of Pearls, famous for biryani and high-tech parks.",
    preferredDestinations: ["dxb", "blr", "sin", "lhr", "bom", "del"] 
  },
  { 
    id: "sin", 
    name: "Singapore", 
    code: "SIN", 
    x: 74, 
    y: 60, 
    lat: 1.3502,
    lng: 103.9915,
    country: "Singapore", 
    timezone: "GMT+8", 
    description: "Futuristic garden city state, financial capital of Southeast Asia.",
    preferredDestinations: ["dxb", "blr", "hyd", "syd", "hnd", "hkg", "bkk"] 
  },
  { 
    id: "lhr", 
    name: "London", 
    code: "LHR", 
    x: 38, 
    y: 28, 
    lat: 51.4700,
    lng: -0.4543,
    country: "United Kingdom", 
    timezone: "GMT+1", 
    description: "Vibrant global cultural center, historic architecture and financial hub.",
    preferredDestinations: ["dxb", "jfk", "hyd", "cdg", "fra", "ams"] 
  },
  { 
    id: "jfk", 
    name: "New York", 
    code: "JFK", 
    x: 20, 
    y: 33, 
    lat: 40.6413,
    lng: -73.7781,
    country: "United States", 
    timezone: "GMT-4", 
    description: "The Big Apple, spectacular skyscrapers, global media and finance capital.",
    preferredDestinations: ["lhr", "syd", "lax", "sfo", "yyz", "mex", "gru"] 
  },
  { 
    id: "hnd", 
    name: "Tokyo", 
    code: "HND", 
    x: 86, 
    y: 38, 
    lat: 35.5494,
    lng: 139.7798,
    country: "Japan", 
    timezone: "GMT+9", 
    description: "High-tech metropolis blending neon skyscrapers and ancient temples.",
    preferredDestinations: ["sin", "blr", "syd", "icn", "hkg"] 
  },
  { 
    id: "syd", 
    name: "Sydney", 
    code: "SYD", 
    x: 88, 
    y: 78, 
    lat: -33.9461,
    lng: 151.1772,
    country: "Australia", 
    timezone: "GMT+10", 
    description: "Stunning harbor city, famous opera house and sun-drenched beaches.",
    preferredDestinations: ["sin", "jfk", "hnd", "lax"] 
  },
  { 
    id: "bom", 
    name: "Mumbai", 
    code: "BOM", 
    x: 63, 
    y: 47, 
    lat: 19.0896,
    lng: 72.8656,
    country: "India", 
    timezone: "GMT+5:30", 
    description: "Historic gateway city of India, home of Bollywood and massive finance centers.",
    preferredDestinations: ["dxb", "blr", "hyd", "sin", "lhr"] 
  },
  { 
    id: "del", 
    name: "New Delhi", 
    code: "DEL", 
    x: 63, 
    y: 42, 
    lat: 28.5562,
    lng: 77.1000,
    country: "India", 
    timezone: "GMT+5:30", 
    description: "Vibrant capital of India, blending thousands of years of history with modern politics.",
    preferredDestinations: ["dxb", "blr", "hyd", "lhr", "hnd"] 
  },
  { 
    id: "lax", 
    name: "Los Angeles", 
    code: "LAX", 
    x: 10, 
    y: 38, 
    lat: 33.9425,
    lng: -118.4081,
    country: "United States", 
    timezone: "GMT-8", 
    description: "Creative capital of the world, golden beaches, Hollywood glamour, and coastal sun.",
    preferredDestinations: ["jfk", "sfo", "hnd", "syd"] 
  },
  { 
    id: "sfo", 
    name: "San Francisco", 
    code: "SFO", 
    x: 9, 
    y: 35, 
    lat: 37.6213,
    lng: -122.3790,
    country: "United States", 
    timezone: "GMT-8", 
    description: "Innovative technology capital, home of the Golden Gate, rolling hills, and startup hubs.",
    preferredDestinations: ["lax", "jfk", "hnd"] 
  },
  { 
    id: "cdg", 
    name: "Paris", 
    code: "CDG", 
    x: 41, 
    y: 29, 
    lat: 49.0097,
    lng: 2.5479,
    country: "France", 
    timezone: "GMT+1", 
    description: "The City of Light, global epicenter of art, fashion, gastronomy, and romance.",
    preferredDestinations: ["lhr", "dxb", "jfk", "fra"] 
  },
  { 
    id: "fra", 
    name: "Frankfurt", 
    code: "FRA", 
    x: 43, 
    y: 28, 
    lat: 50.0379,
    lng: 8.5622,
    country: "Germany", 
    timezone: "GMT+1", 
    description: "Financial heart of continental Europe, towering skyscrapers and historic river banks.",
    preferredDestinations: ["cdg", "lhr", "dxb", "sin"] 
  },
  { 
    id: "icn", 
    name: "Seoul", 
    code: "ICN", 
    x: 82, 
    y: 36, 
    lat: 37.4602,
    lng: 126.4407,
    country: "South Korea", 
    timezone: "GMT+9", 
    description: "Dynamic high-tech capital, K-pop epicenters, futuristic towers, and royal palaces.",
    preferredDestinations: ["hnd", "sin", "lax"] 
  },
  { 
    id: "hkg", 
    name: "Hong Kong", 
    code: "HKG", 
    x: 78, 
    y: 44, 
    lat: 22.3080,
    lng: 113.9185,
    country: "Hong Kong", 
    timezone: "GMT+8", 
    description: "Breathtaking vertical skyline, bustling harbor, shopping, and culinary wonders.",
    preferredDestinations: ["sin", "hnd", "dxb", "lhr"] 
  },
  { 
    id: "gru", 
    name: "São Paulo", 
    code: "GRU", 
    x: 31, 
    y: 72, 
    lat: -23.4356,
    lng: -46.4731,
    country: "Brazil", 
    timezone: "GMT-3", 
    description: "Huge cultural melting pot, skyscrapers, rich art galleries, and vibrant carnival spirits.",
    preferredDestinations: ["jfk", "cdg", "cpt"] 
  },
  { 
    id: "cpt", 
    name: "Cape Town", 
    code: "CPT", 
    x: 48, 
    y: 77, 
    lat: -33.9715,
    lng: 18.6021,
    country: "South Africa", 
    timezone: "GMT+2", 
    description: "Stunning coastal city bounded by Table Mountain, vineyards, and white sand beaches.",
    preferredDestinations: ["dxb", "lhr", "gru"] 
  },
  { 
    id: "cai", 
    name: "Cairo", 
    code: "CAI", 
    x: 49, 
    y: 39, 
    lat: 30.1219,
    lng: 31.4056,
    country: "Egypt", 
    timezone: "GMT+2", 
    description: "The Cradle of Civilization, ancient pyramids, Nile cruises, and bustling bazaars.",
    preferredDestinations: ["dxb", "lhr", "fra"] 
  },
  { 
    id: "yyz", 
    name: "Toronto", 
    code: "YYZ", 
    x: 21, 
    y: 30, 
    lat: 43.6777,
    lng: -79.6248,
    country: "Canada", 
    timezone: "GMT-5", 
    description: "Diverse cultural hub of Canada, CN tower views, lakeside parks, and active finance sectors.",
    preferredDestinations: ["jfk", "lhr", "lax"] 
  },
  { 
    id: "mex", 
    name: "Mexico City", 
    code: "MEX", 
    x: 16, 
    y: 47, 
    lat: 19.4363,
    lng: -99.0721,
    country: "Mexico", 
    timezone: "GMT-6", 
    description: "Ancient Aztec origins, beautiful spanish architecture, museums, and rich street food.",
    preferredDestinations: ["jfk", "lax", "gru"] 
  },
  { 
    id: "bkk", 
    name: "Bangkok", 
    code: "BKK", 
    x: 72, 
    y: 50, 
    lat: 13.6900,
    lng: 100.7501,
    country: "Thailand", 
    timezone: "GMT+7", 
    description: "Ornate shrines, vibrant street life, floating markets, and rich Thailand culinary arts.",
    preferredDestinations: ["sin", "hnd", "dxb", "blr"] 
  },
  { 
    id: "doh", 
    name: "Doha", 
    code: "DOH", 
    x: 53, 
    y: 41, 
    lat: 25.2731,
    lng: 51.6081,
    country: "Qatar", 
    timezone: "GMT+3", 
    description: "Sleek modern coastline, Islamic arts, beautiful desert dunes, and global transit hubs.",
    preferredDestinations: ["dxb", "lhr", "hyd", "sin"] 
  },
  { 
    id: "ams", 
    name: "Amsterdam", 
    code: "AMS", 
    x: 41, 
    y: 27, 
    lat: 52.3105,
    lng: 4.7683,
    country: "Netherlands", 
    timezone: "GMT+1", 
    description: "Canals, tulips, art museums, and incredibly bicycle-friendly cobblestone streets.",
    preferredDestinations: ["lhr", "cdg", "dxb", "jfk"] 
  }
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
  actualTime: number;
  coinsEarned: number;
  startedAt: string;
  endedAt: string;
  completed: boolean;
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
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  
  // Session creation details
  const [sessionMode, setSessionMode] = useState<"CHILL" | "HARDCORE">("CHILL");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Boarding Code & Joining States
  const [activeBoardingTab, setActiveBoardingTab] = useState<"router" | "join">("router");
  const [joinFlightCode, setJoinFlightCode] = useState("");
  const [joiningFlight, setJoiningFlight] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<"IDLE" | "PENDING" | "ACCEPTED">("IDLE");
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [studySubject, setStudySubject] = useState("");

  // Google Maps Style Toggle
  const [mapStyle, setMapStyle] = useState<"hybrid" | "roadmap" | "satellite" | "terrain">("hybrid");

  // Leaflet references
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // 1. Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Inject Leaflet JS
    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  // Initialize or update the map
  useEffect(() => {
    if (!leafletLoaded || !GLOBAL_HUBS) return;

    const L = (window as any).L;
    if (!L) return;

    // Check if map container exists in DOM
    const container = document.getElementById("leaflet-map-viewport");
    if (!container) return;

    // Clean up old map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map("leaflet-map-viewport", {
      center: [20.0, 30.0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: false, // Custom position Zoom controls below
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    // Select Google Maps tiles URL based on selected style
    // lyrs keys: m = roadmap (Standard Streets), s = satellite (Only), y = hybrid (Sat + Roads), t = terrain (Terrain)
    let mapUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // Default Hybrid
    if (mapStyle === "roadmap") mapUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    if (mapStyle === "satellite") mapUrl = "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
    if (mapStyle === "terrain") mapUrl = "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}";

    L.tileLayer(mapUrl, {
      maxZoom: 20,
      attribution: "&copy; Google Maps",
    }).addTo(map);

    // Plot hubs as custom interactive markers
    GLOBAL_HUBS.forEach((city) => {
      const isSelected = selectedCity?.id === city.id;
      const isOrigin = origin?.id === city.id;
      const isDest = destination?.id === city.id;

      let colorClass = "text-white/60";
      let coreBg = "bg-[#050a17] border-white/40";
      let pingRing = "";

      if (isOrigin) {
        colorClass = "text-emerald-400 font-extrabold";
        coreBg = "bg-emerald-400 border-white shadow-[0_0_10px_#10b981]";
        pingRing = "border-emerald-400 animate-pulse";
      } else if (isDest) {
        colorClass = "text-amber-400 font-extrabold";
        coreBg = "bg-amber-400 border-white shadow-[0_0_10px_#f59e0b]";
        pingRing = "border-amber-400 animate-pulse";
      } else if (isSelected) {
        colorClass = "text-electric-400 font-extrabold";
        coreBg = "bg-electric-400 border-white shadow-[0_0_10px_#0ea5e9] scale-125";
        pingRing = "border-electric-400 animate-pulse";
      }

      // Leaflet divIcon
      const iconHtml = `
        <div class="relative flex flex-col items-center select-none" style="transform: translate(0, 0);">
          ${
            pingRing
              ? `<div class="absolute -top-2 size-8 rounded-full border-2 ${pingRing} opacity-50 pointer-events-none"></div>`
              : ""
          }
          <div class="size-3.5 rounded-full border-2 shadow-lg ${coreBg}"></div>
          <div class="mt-1 px-1.5 py-0.5 rounded-md bg-[#0a0f26]/90 border border-white/10 backdrop-blur-sm text-[7.5px] font-mono tracking-wider font-extrabold uppercase shadow-sm ${colorClass}">
            ${city.code}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-hub-icon-wrap",
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);
      marker.on("click", () => {
        handleSelectCity(city);
      });
    });

    // Draw active flight route polyline
    if (origin && destination) {
      const routeCoords = [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ];

      // Draw thick glowing blue underlay
      L.polyline(routeCoords, {
        color: "#0ea5e9",
        weight: 6,
        opacity: 0.25,
      }).addTo(map);

      // Draw active animating flight line
      L.polyline(routeCoords, {
        color: isPrivate ? "#fbbf24" : "#38bdf8",
        weight: 3,
        opacity: 0.9,
        dashArray: "8, 8",
        className: "animated-flight-line",
      }).addTo(map);

      // Fit map bounds to show full route
      map.fitBounds(L.latLngBounds(routeCoords), {
        padding: [60, 60],
        animate: true,
        duration: 1.2,
      });
    } else if (selectedCity) {
      // Fly to selected city hub
      map.flyTo([selectedCity.lat, selectedCity.lng], 4, {
        animate: true,
        duration: 1.5,
      });
    }

    // Draw past travel history dashed flight paths
    travelHistory.forEach((hist) => {
      const oCity = GLOBAL_HUBS.find((h) => h.code === hist.originCode);
      const dCity = GLOBAL_HUBS.find((h) => h.code === hist.destinationCode);
      if (oCity && dCity) {
        L.polyline(
          [
            [oCity.lat, oCity.lng],
            [dCity.lat, dCity.lng],
          ],
          {
            color: "#10b981", // Emerald green for past travel paths!
            weight: 2,
            opacity: 0.45,
            dashArray: "3, 5",
          }
        ).addTo(map);
      }
    });
  }, [leafletLoaded, selectedCity, origin, destination, travelHistory, mapStyle]);

  // Load user profile & travel history on mount
  useEffect(() => {
    // 1. Fetch user coins from local manifest or DB
    const cached = localStorage.getItem("flightedu_onboarding");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.coins !== undefined) setUserCoins(parsed.coins);
        if (parsed.studyTime) setStudySubject(parsed.studyTime);
      } catch {}
    }

    fetch("/api/user/onboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.coins !== undefined) setUserCoins(data.user.coins);
          if (data.user.studyTime) setStudySubject(data.user.studyTime);
        }
      })
      .catch(() => {});

    // 2. Fetch travel history
    setHistoryLoading(true);
    fetch("/api/sessions/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history) {
          const mapped = data.history.map((h: any) => {
            const actualMinutes = Math.max(
              h.hoursCompleted > 0 ? 1 : 0,
              Math.round(h.hoursCompleted * 60)
            );
            
            // Retrieve exact coinsEarned from database, falling back to legacy dynamic logic if 0 and completed/time suggests otherwise
            let coins = h.coinsEarned;
            if (coins === 0 && h.hoursCompleted > 0 && h.completed) {
              coins = Math.min(100, Math.round(actualMinutes * 1.6));
            } else if (h.completed === false && h.session.mode === "HARDCORE" && coins === 0) {
              coins = -500;
            }

            const start = h.joinedAt ? new Date(h.joinedAt) : new Date();
            const end = h.leftAt 
              ? new Date(h.leftAt) 
              : new Date(start.getTime() + actualMinutes * 60000);

            const formatOptions: Intl.DateTimeFormatOptions = {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            };

            return {
              id: h.id,
              origin: h.session.origin,
              originCode: h.session.originCode,
              destination: h.session.destination,
              destinationCode: h.session.destinationCode,
              transportMode: h.session.transportMode,
              duration: h.session.duration,
              mode: h.session.mode,
              completedAt: start.toLocaleDateString(),
              actualTime: actualMinutes,
              coinsEarned: coins,
              startedAt: start.toLocaleString("en-US", formatOptions),
              endedAt: end.toLocaleString("en-US", formatOptions),
              completed: h.completed,
            };
          });
          setTravelHistory(mapped);
        }
      })
      .catch(() => {
        // Fallback mock history if offline
        setTravelHistory([
          { 
            id: "h1", 
            origin: "Dubai", 
            originCode: "DXB", 
            destination: "Bengaluru", 
            destinationCode: "BLR", 
            transportMode: "FLIGHT", 
            duration: 180, 
            mode: "CHILL", 
            completedAt: "May 20, 2026",
            actualTime: 180,
            coinsEarned: 100, // Capped at 100!
            startedAt: "May 20, 2026, 02:30:00 PM",
            endedAt: "May 20, 2026, 05:30:00 PM",
            completed: true
          },
          { 
            id: "h2", 
            origin: "Bengaluru", 
            originCode: "BLR", 
            destination: "Hyderabad", 
            destinationCode: "HYD", 
            transportMode: "FLIGHT", 
            duration: 60, 
            mode: "CHILL", 
            completedAt: "May 22, 2026",
            actualTime: 25, // Ejected early after 25 mins!
            coinsEarned: 40,
            startedAt: "May 22, 2026, 09:15:00 AM",
            endedAt: "May 22, 2026, 09:40:00 AM",
            completed: false
          },
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

      // Save initial seat/flight detail configuration cached locally for check-in
      const initialConfig = {
        sessionId: data.session.id,
        studySubject: studySubject.trim() || "Focus Study",
      };
      localStorage.setItem(`flight_config_${data.session.id}`, JSON.stringify(initialConfig));

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
      
      // Save initial seat/flight detail configuration cached locally for check-in
      const initialConfig = {
        sessionId: mockSessionId,
        studySubject: studySubject.trim() || "Focus Study",
      };
      localStorage.setItem(`flight_config_${mockSessionId}`, JSON.stringify(initialConfig));

      router.push(`/session/${mockSessionId}/boarding`);
    } finally {
      setCreatingSession(false);
    }
  };

  const handleJoinFlightCode = async () => {
    if (!joinFlightCode.trim()) {
      setJoinError("Please enter a Boarding Pass Code first.");
      return;
    }

    setJoiningFlight(true);
    setJoinError(null);

    try {
      const res = await fetch("/api/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: joinFlightCode.trim().toUpperCase(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Failed to board flight.");
      }

      const data = await res.json() as {
        success: boolean;
        status: "BOARDED" | "PENDING";
        sessionId: string;
        message: string;
      };

      setJoinedSessionId(data.sessionId);

      // Save initial seat/flight detail configuration cached locally for check-in
      const initialConfig = {
        sessionId: data.sessionId,
        studySubject: studySubject.trim() || "Focus Study",
      };
      localStorage.setItem(`flight_config_${data.sessionId}`, JSON.stringify(initialConfig));

      if (data.status === "BOARDED") {
        setJoinStatus("ACCEPTED");
        // Public flight, accepted immediately!
        router.push(`/session/${data.sessionId}/boarding`);
      } else {
        // Private flight, request pending host approval!
        setJoinStatus("PENDING");
        setJoinError(null);
      }
    } catch (err: any) {
      setJoinError(err.message || "Failed to board flight. Verify your code.");
    } finally {
      setJoiningFlight(false);
    }
  };

  // Poll for private flight host approval clearance in real-time
  useEffect(() => {
    if (joinStatus !== "PENDING" || !joinedSessionId) return;

    let pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${joinedSessionId}`);
        if (res.ok) {
          const data = await res.json() as {
            session: {
              id: string;
              participants?: Array<{
                userId: string;
                isAccepted: boolean;
              }>;
            };
          };

          // Try loading current user's ID
          let myId = "";
          const cachedUser = localStorage.getItem("flightedu_onboarding");
          if (cachedUser) {
            try {
              myId = JSON.parse(cachedUser).id || "";
            } catch {}
          }
          if (!myId) {
            // Fetch from onboard API if cached is missing
            const onboardRes = await fetch("/api/user/onboard");
            if (onboardRes.ok) {
              const onboardData = await onboardRes.json();
              myId = onboardData.user?.id || "";
            }
          }

          if (data.session && data.session.participants) {
            const myParticipant = data.session.participants.find(p => p.userId === myId);
            if (myParticipant) {
              if (myParticipant.isAccepted) {
                // Host has accepted the boarding request!
                clearInterval(pollInterval);
                setJoinStatus("ACCEPTED");
                
                // Get the updated configurations and take off to the boarding gate!
                router.push(`/session/${joinedSessionId}/boarding`);
              }
            } else {
              // Host declined / deleted participant record!
              clearInterval(pollInterval);
              setJoinStatus("IDLE");
              setJoinError("⚠️ Boarding request was declined by the host pilot.");
            }
          }
        }
      } catch (err) {
        console.warn("Cleared polling interval due to error check:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [joinStatus, joinedSessionId, router]);

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
                  {/* Google Maps Style Toggle */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full bg-navy-950/90 border border-white/10 p-0.5 backdrop-blur-md shadow-lg">
            {[
              { id: "hybrid", label: "🛰️ Hybrid" },
              { id: "roadmap", label: "🗺️ Streets" },
              { id: "satellite", label: "🛸 Sat" },
              { id: "terrain", label: "🏔️ Terrain" }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id as any)}
                className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider transition ${
                  mapStyle === style.id
                    ? "bg-electric-500 text-white shadow-md shadow-electric-500/20"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* THE REAL INTERACTIVE GOOGLE MAPS TELEMETRY VIEWPORT */}
          <div className="flex-1 min-h-[300px] lg:min-h-[450px] relative">
            <div id="leaflet-map-viewport" className="w-full h-full absolute inset-0 z-0 bg-[#070b19]" />
            
            {/* Custom Embedded style overrides for premium dark/cyber HUD feel */}
            <style jsx global>{`
              .leaflet-container {
                background: #070b19 !important;
                font-family: inherit;
              }
              .leaflet-bar {
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                background: rgba(10, 15, 38, 0.9) !important;
                backdrop-filter: blur(8px);
                border-radius: 12px !important;
                overflow: hidden;
                box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4) !important;
              }
              .leaflet-bar a {
                background: transparent !important;
                color: rgba(255, 255, 255, 0.7) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
                transition: all 0.2s;
              }
              .leaflet-bar a:hover {
                color: #fff !important;
                background: rgba(255, 255, 255, 0.08) !important;
              }
              .custom-hub-icon-wrap {
                background: none !important;
                border: none !important;
              }
              .animated-flight-line {
                stroke-dasharray: 8, 8;
                animation: flight-dash-flow 30s linear infinite;
              }
              @keyframes flight-dash-flow {
                to {
                  stroke-dashoffset: -1000;
                }
              }
              /* Hide standard leaflet attribution for cockpit space styling */
              .leaflet-control-attribution {
                background: rgba(7, 11, 25, 0.7) !important;
                color: rgba(255, 255, 255, 0.3) !important;
                backdrop-filter: blur(4px);
                font-size: 8px !important;
                border-top-left-radius: 8px;
                border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
              }
            `}</style>
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
                      {travelHistory.map((item) => {
                        const isExpanded = expandedHistoryId === item.id;
                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 overflow-hidden transition-all duration-300"
                          >
                            {/* Header Summary Row (Clickable) */}
                            <button
                              onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                              className="w-full flex items-center justify-between p-3.5 text-left text-xs transition hover:bg-white/5 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`text-base font-bold ${item.completed ? "text-emerald-400" : "text-amber-400"}`}>
                                  {item.completed ? "✓" : "⚠️"}
                                </span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white tracking-wider">{item.originCode}</span>
                                    <ChevronRight className="size-3 text-white/30" />
                                    <span className="font-bold text-white tracking-wider">{item.destinationCode}</span>
                                  </div>
                                  <p className="text-[10px] text-white/45 mt-0.5">
                                    {item.completed ? "Landed safely" : "Ejected early"} • {item.completedAt}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-[10px] font-bold text-emerald-400 font-mono">⚡ {item.actualTime} mins</span>
                                  <span className="text-[10px] font-bold text-yellow-400 font-mono">
                                    🪙 {item.coinsEarned} coin{item.coinsEarned !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <span className="text-white/35 text-[8px] transition duration-300" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                                  ▶
                                </span>
                              </div>
                            </button>

                            {/* Expandable Details Panel */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="border-t border-emerald-500/10 bg-[#0c122c]/50 p-4 space-y-3 text-[10.5px] leading-relaxed text-white/70"
                                >
                                  {/* Detailed statistics grid */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-xl border border-white/5 bg-white/4 p-2">
                                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Flight Route</p>
                                      <p className="mt-0.5 font-bold text-white">{item.origin} → {item.destination}</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/4 p-2">
                                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Cabin Mode</p>
                                      <p className="mt-0.5 font-bold text-white uppercase">{item.mode} CLASS</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/4 p-2">
                                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Scheduled Duration</p>
                                      <p className="mt-0.5 font-bold text-white font-mono">{item.duration} minutes</p>
                                    </div>
                                    <div className="rounded-xl border border-white/5 bg-white/4 p-2">
                                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Actual Focus Time</p>
                                      <p className="mt-0.5 font-bold text-emerald-400 font-mono">{item.actualTime} minutes</p>
                                    </div>
                                  </div>

                                  {/* Coins Earned with Cap notice */}
                                  <div className="rounded-xl border border-white/5 bg-white/4 p-2 flex items-center justify-between">
                                    <div>
                                      <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Coins Claimed</p>
                                      <p className="mt-0.5 font-bold text-yellow-400 font-mono">🪙 {item.coinsEarned} focus coins</p>
                                    </div>
                                    {item.coinsEarned === 100 && (
                                      <span className="rounded bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-[8px] font-bold text-yellow-400 uppercase tracking-wider">
                                        ⚡ Max Cap Reached
                                      </span>
                                    )}
                                  </div>

                                  {/* Flight Log Timeline */}
                                  <div className="space-y-2 relative border-l border-white/10 pl-4 ml-2 mt-1">
                                    <div className="relative">
                                      <div className="absolute -left-[21px] top-1.5 z-10 size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                                      <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">🛫 Takeoff (Start)</p>
                                      <p className="font-mono text-white/80">{item.startedAt}</p>
                                    </div>

                                    <div className="relative pt-2">
                                      <div className={`absolute -left-[21px] top-3.5 z-10 size-2 rounded-full ${item.completed ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"}`} />
                                      <p className={`text-[8px] font-bold uppercase tracking-wider ${item.completed ? "text-emerald-400" : "text-amber-400"}`}>
                                        {item.completed ? "🛬 Landed (Complete)" : "⚠️ Ejected Early (Terminated)"}
                                      </p>
                                      <p className="font-mono text-white/80">{item.endedAt}</p>
                                    </div>
                                  </div>

                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LOWER SECTION: Direct Boarding Manifest (opens when origin & destination chosen!) */}
          <div className="p-5 border-t border-white/5 bg-navy-950 shrink-0">
            {/* Aerospace Navigation Tabs */}
            <div className="flex border border-white/10 rounded-2xl bg-white/4 p-1 mb-4 select-none">
              <button
                onClick={() => {
                  setActiveBoardingTab("router");
                  setJoinError(null);
                }}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition duration-300 cursor-pointer ${
                  activeBoardingTab === "router"
                    ? "bg-electric-500 text-white shadow-lg shadow-electric-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🗺️ Flight Router
              </button>
              <button
                onClick={() => {
                  setActiveBoardingTab("join");
                  setJoinError(null);
                }}
                className={`flex-1 py-2 text-center rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition duration-300 cursor-pointer ${
                  activeBoardingTab === "join"
                    ? "bg-electric-500 text-white shadow-lg shadow-electric-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🎫 Boarding Code
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeBoardingTab === "router" ? (
                origin && destination ? (() => {
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

                      {/* Ask Focus Subject (what he is studying) */}
                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <label className="text-[7.5px] font-bold text-white/45 uppercase tracking-widest">
                          What are you studying today?
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, Organic Chemistry, UI Design..."
                          value={studySubject}
                          onChange={(e) => setStudySubject(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60 transition duration-300"
                        />
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
                  <motion.div 
                    key="compass-ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6 text-white/40 leading-relaxed font-mono"
                  >
                    <Compass className="size-6 text-white/20 mx-auto mb-2 animate-spin-slow" />
                    <p className="text-[10px] font-bold text-white/60 uppercase">Flight Router Ready</p>
                    <p className="text-[8px] text-white/30 max-w-[180px] mx-auto mt-1 leading-normal">
                      Select a city pin on the radar map to designate departure (🛫) and arrival (🛬) points to board direct!
                    </p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="boarding-code-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-4 text-xs"
                >
                  {joinStatus === "PENDING" ? (
                    <div className="text-center py-6 text-yellow-400 font-mono space-y-4 bg-white/4 border border-white/5 rounded-2xl p-4">
                      <div className="size-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider">⏳ SECURING BOARDING CLEARANCE</p>
                        <p className="text-[8px] text-white/40 max-w-[200px] mx-auto leading-normal">
                          Request submitted. Waiting for the Host Pilot to clear your entry... Please stand by.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setJoinStatus("IDLE");
                          setJoinedSessionId(null);
                        }}
                        className="px-3 py-1 rounded-xl border border-red-500/30 hover:border-red-500/50 bg-red-500/5 text-red-400 font-bold uppercase text-[8px] transition cursor-pointer"
                      >
                        Cancel Request ❌
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Ask Focus Subject (what he is studying) */}
                      <div className="space-y-1.5">
                        <label className="text-[7.5px] font-bold text-white/45 uppercase tracking-widest">
                          What are you studying today?
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, Organic Chemistry, UI Design..."
                          value={studySubject}
                          onChange={(e) => setStudySubject(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60 transition"
                        />
                      </div>

                      {/* Invite Code Input */}
                      <div className="space-y-1.5">
                        <label className="text-[7.5px] font-bold text-white/45 uppercase tracking-widest">
                          Enter Boarding Pass Code
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          placeholder="e.g. A8X9J2K1"
                          value={joinFlightCode}
                          onChange={(e) => setJoinFlightCode(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-mono font-bold tracking-widest text-center uppercase text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60 transition"
                        />
                      </div>

                      {/* Join error */}
                      {joinError && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-[9px] text-red-400">
                          ⚠️ {joinError}
                        </div>
                      )}

                      {/* Submit button */}
                      <Button
                        size="lg"
                        className="w-full shadow-lg shadow-electric-500/20 uppercase tracking-widest font-extrabold text-[10px] py-4 bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500"
                        loading={joiningFlight}
                        onClick={handleJoinFlightCode}
                      >
                        🎫 Board Cabin via Pass Code
                      </Button>
                    </div>
                  )}
                </motion.div>
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
