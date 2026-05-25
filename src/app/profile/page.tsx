"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Trash2,
  Coins,
  Clock,
  Compass,
  Award,
  Sparkles,
  Check,
  Loader2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { computePilotRank } from "@/lib/pilotRank";

interface ProfileDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  pilotId?: string;
  age: string;
  studyTime: string;
  studyDuration: string;
  distractibility: string;
  callDistraction: string;
  coins: number;
  avatarUrl?: string;
  onboarded: boolean;
  totalHours?: number;
  currentStreak?: number;
  longestStreak?: number;
  createdAt?: string;
}

function getAvatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
];

function validatePhoneNumber(dialCode: string, number: string): string | null {
  const digits = number.replace(/\D/g, "");
  
  if (!digits) {
    return "Satellite frequency (Phone) is required";
  }

  if (dialCode === "+91") {
    if (digits.length !== 10) {
      return "India phone number must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(digits)) {
      return "India mobile number must start with 6, 7, 8, or 9";
    }
  } else if (dialCode === "+1") {
    if (digits.length !== 10) {
      return "US/Canada phone number must be exactly 10 digits";
    }
  } else if (dialCode === "+44") {
    if (digits.length !== 10) {
      return "UK mobile number must be exactly 10 digits";
    }
  } else if (dialCode === "+61") {
    if (digits.length !== 9) {
      return "Australia phone number must be exactly 9 digits";
    }
    if (!/^4/.test(digits)) {
      return "Australia mobile number must start with 4";
    }
  } else if (dialCode === "+49") {
    if (digits.length < 10 || digits.length > 11) {
      return "Germany phone number must be 10 or 11 digits";
    }
  } else if (dialCode === "+33") {
    if (digits.length !== 9) {
      return "France phone number must be exactly 9 digits";
    }
    if (!/^[6-7]/.test(digits)) {
      return "France mobile number must start with 6 or 7";
    }
  } else if (dialCode === "+81") {
    if (digits.length !== 10) {
      return "Japan phone number must be exactly 10 digits";
    }
    if (!/^[7-9]/.test(digits)) {
      return "Japan mobile number must start with 7, 8, or 9";
    }
  } else if (dialCode === "+65") {
    if (digits.length !== 8) {
      return "Singapore phone number must be exactly 8 digits";
    }
    if (!/^[8-9]/.test(digits)) {
      return "Singapore mobile number must start with 8 or 9";
    }
  } else if (dialCode === "+971") {
    if (digits.length !== 9) {
      return "UAE phone number must be exactly 9 digits";
    }
    if (!/^5[024568]/.test(digits)) {
      return "UAE mobile number must start with 50, 52, 54, 55, 56, or 58";
    }
  } else {
    if (digits.length < 8) {
      return "Phone number must be at least 8 digits";
    }
  }

  return null;
}

export default function ProfilePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<ProfileDetails | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  // Flight & Achievements state
  const [flights, setFlights] = useState<any[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [currentPassportPage, setCurrentPassportPage] = useState(0);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    gender: "prefer_not_to_say",
    age: "21",
    studyTime: "",
    studyDuration: "",
    distractibility: "",
    callDistraction: "",
  });
  
  // Password Reset state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Feedback messages
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Avatar upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Image must be under 5 MB" });
      return;
    }

    setAvatarUploading(true);

    // Read file as base64 for instant local save
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      
      // Always save to localStorage first (reliable fallback)
      localStorage.setItem("gofocusgen_avatar", base64);
      setAvatarPreview(base64);

      // Scale and compress image to a small, lightweight Base64 string for database storage fallback
      let compressedBase64 = base64;
      try {
        compressedBase64 = await new Promise<string>((resolve) => {
          const img = new Image();
          img.src = base64;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const MAX_WIDTH = 150;
            const MAX_HEIGHT = 150;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.75)); // 75% quality JPEG is extremely small (~10KB)
            } else {
              resolve(base64);
            }
          };
          img.onerror = () => resolve(base64);
        });
      } catch (cErr) {
        console.warn("Base64 image compression failed:", cErr);
      }

      // Try uploading to Supabase Storage first
      let finalAvatarUrl = compressedBase64;
      try {
        const supabase = createClient();
        if (!supabase) throw new Error("No client");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `avatars/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        finalAvatarUrl = publicUrl;
      } catch (err) {
        console.warn("Cloud upload failed, using compressed base64 for DB fallback:", err);
      }

      try {
        // Save final URL (either remote URL or compressed Base64) to DB
        await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: finalAvatarUrl }),
        });

        // Also overwrite localStorage with the persisted remote/compressed URL for future loads
        localStorage.setItem("gofocusgen_avatar", finalAvatarUrl);
        
        // Update gofocusgen_onboarding cache to prevent stale overrides on refresh
        const cached = localStorage.getItem("gofocusgen_onboarding");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.avatarUrl = finalAvatarUrl;
            localStorage.setItem("gofocusgen_onboarding", JSON.stringify(parsed));
          } catch {}
        }
        
        setDbUser((prev) => prev ? { ...prev, avatarUrl: finalAvatarUrl } : prev);
        setFeedback({ type: "success", text: "Profile picture updated ✅" });
      } catch (dbErr) {
        console.warn("Failed to sync avatar with DB:", dbErr);
        setFeedback({ type: "error", text: "Failed to save profile picture to server" });
      } finally {
        setAvatarUploading(false);
        setTimeout(() => setFeedback(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    // Load saved avatar from localStorage on mount
    const savedAvatar = localStorage.getItem("gofocusgen_avatar");
    if (savedAvatar) setAvatarPreview(savedAvatar);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      
      // Determine if signed in via Google OAuth
      const isGoogle = user.app_metadata?.provider === "google" || user.identities?.some((id: any) => id.provider === "google");
      setIsGoogleUser(!!isGoogle);

      // --- Build profile from all sources: DB > localStorage cache > Supabase auth metadata ---

      // 1. Read localStorage onboarding cache (always available)
      let localData: Record<string, string> = {};
      try {
        const cached = localStorage.getItem("gofocusgen_onboarding");
        if (cached) localData = JSON.parse(cached) as Record<string, string>;
      } catch {}

      // 2. Read Supabase auth user_metadata (stored during sign-up)
      const meta = user.user_metadata ?? {};
      const metaPhone = meta.phone ?? meta.phone_number ?? "";
      const metaGender = meta.gender ?? "";
      const metaName = meta.full_name ?? meta.name ?? "";
      const metaPilotId = meta.pilot_id ?? meta.pilotId ?? "";

      // 3. Merge: localStorage > auth metadata as fallback
      const fallbackProfile: ProfileDetails = {
        id: user.id,
        email: user.email ?? "",
        name: localData.name || metaName,
        phone: localData.phone || metaPhone,
        gender: localData.gender || metaGender,
        pilotId: localData.pilotId || metaPilotId,
        age: localData.age ?? "21",
        studyTime: localData.studyTime ?? "",
        studyDuration: localData.studyDuration ?? "",
        distractibility: localData.distractibility ?? "",
        callDistraction: localData.callDistraction ?? "",
        coins: Number(localData.coins) || 0,
        avatarUrl: undefined,
        onboarded: true,
      };

      // 4. Try to get authoritative data from DB (may fail if DB is paused)
      try {
        const res = await fetch("/api/user/onboard");
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.id) {
            // DB returned data — DB is authoritative, especially for coins
            const dbProfile = {
              ...fallbackProfile,
              ...data.user,
              // DB may return null for some fields, keep fallback in those cases
              phone: data.user.phone || fallbackProfile.phone,
              gender: data.user.gender || fallbackProfile.gender,
              pilotId: data.user.pilotId || fallbackProfile.pilotId,
              name: data.user.name || fallbackProfile.name,
              // DB coins is ALWAYS authoritative (so SQL updates work)
              coins: data.user.coins ?? fallbackProfile.coins,
            };
            setDbUser(dbProfile);
            // Persist to localStorage so next refresh is instant
            localStorage.setItem("gofocusgen_onboarding", JSON.stringify(dbProfile));

            // Sync DB-authoritative avatarUrl back to cache to prevent stale reverts on refresh
            if (dbProfile.avatarUrl) {
              setAvatarPreview(dbProfile.avatarUrl);
              localStorage.setItem("gofocusgen_avatar", dbProfile.avatarUrl);
            }

            const userPhone = dbProfile.phone || "";
            let cc = "+91";
            let num = userPhone;
            for (const c of COUNTRY_CODES) {
              if (userPhone.startsWith(c.code)) {
                cc = c.code;
                num = userPhone.substring(c.code.length);
                break;
              }
            }
            setCountryCode(cc);
            setPhoneNumber(num.replace(/\D/g, ""));
            setEditForm({
              name: dbProfile.name || "",
              phone: userPhone,
              gender: dbProfile.gender || "prefer_not_to_say",
              age: dbProfile.age || "21",
              studyTime: dbProfile.studyTime || "",
              studyDuration: dbProfile.studyDuration || "",
              distractibility: dbProfile.distractibility || "",
              callDistraction: dbProfile.callDistraction || "",
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("DB fetch failed, using local fallback:", err);
      }

      // 5. DB unavailable — show fallback data from localStorage/auth metadata
      setDbUser(fallbackProfile);
      const userPhone = fallbackProfile.phone || "";
      let cc = "+91";
      let num = userPhone;
      for (const c of COUNTRY_CODES) {
        if (userPhone.startsWith(c.code)) {
          cc = c.code;
          num = userPhone.substring(c.code.length);
          break;
        }
      }
      setCountryCode(cc);
      setPhoneNumber(num.replace(/\D/g, ""));
      setEditForm({
        name: fallbackProfile.name || "",
        phone: userPhone,
        gender: fallbackProfile.gender || "prefer_not_to_say",
        age: fallbackProfile.age || "21",
        studyTime: fallbackProfile.studyTime || "",
        studyDuration: fallbackProfile.studyDuration || "",
        distractibility: fallbackProfile.distractibility || "",
        callDistraction: fallbackProfile.callDistraction || "",
      });
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    async function loadFlights() {
      try {
        const res = await fetch("/api/user/flights");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.flights) {
            setFlights(data.flights);
            localStorage.setItem("gofocusgen_flights", JSON.stringify(data.flights));
          }
        } else {
          const cached = localStorage.getItem("gofocusgen_flights");
          if (cached) setFlights(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Failed to load flights:", err);
        const cached = localStorage.getItem("gofocusgen_flights");
        if (cached) setFlights(JSON.parse(cached));
      } finally {
        setFlightsLoading(false);
      }
    }
    loadFlights();
  }, []);
 
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    const phoneError = validatePhoneNumber(countryCode, phoneNumber);
    if (phoneError) {
      setFeedback({ type: "error", text: phoneError });
      setSaveLoading(false);
      return;
    }

    const fullPhone = `${countryCode}${phoneNumber}`;

    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          phone: fullPhone,
          email: dbUser?.email || "",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        setIsEditing(false);
        setFeedback({ type: "success", text: "Flight manifest details updated successfully!" });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: "error", text: "Failed to update profile details. Please try again." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    const supabase = createClient();
    if (!supabase) {
      setPasswordMessage({ type: "error", text: "Authentication client error." });
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Account password reset successfully!" });
      setPassword("");
      confirmPassword && setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 4000);
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE MY CABIN") {
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
      });

      if (res.ok) {
        // Signout client side
        const supabase = createClient();
        await supabase?.auth.signOut();
        router.push("/login?message=account_deleted");
      } else {
        alert("Failed to delete account. Please try again.");
        setDeleteLoading(false);
      }
    } catch (err) {
      alert("Error occurred while deleting account.");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white">
        <Loader2 className="size-10 animate-spin text-electric-400" />
        <p className="mt-4 text-white/50 text-sm">Preparing pilot terminal...</p>
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
  const totalHours = dbUser?.totalHours ?? 0;
  const completedFlightsCount = flights.length;
  
  const rankInfo = computePilotRank(completedFlightsCount, totalHours, uniqueAirportsCount);

  // Badge list definitions
  const badgesData = [
    {
      id: "silk_road",
      name: "Silk Road Scholar",
      icon: "🕌",
      desc: "Complete 10 study flights to or from Asian destinations.",
      current: asiaRoutesCount,
      target: 10,
      unlocked: asiaRoutesCount >= 10,
      progressText: `${asiaRoutesCount}/10 routes`,
      color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/10",
    },
    {
      id: "transatlantic",
      name: "Transatlantic Grind",
      icon: "🌊",
      desc: "Complete a continuous cruise session of 8 hours (480 minutes) or more.",
      current: maxFlightDuration,
      target: 480,
      unlocked: maxFlightDuration >= 480,
      progressText: maxFlightDuration >= 480 ? "Unlocked" : `${Math.round(maxFlightDuration)}/480 mins`,
      color: "from-blue-500/20 to-sky-500/20 text-sky-300 border-blue-500/30 shadow-blue-500/10",
    },
    {
      id: "frequent_flyer",
      name: "Frequent Flyer",
      icon: "🔥",
      desc: "Maintain an active focus study streak of 7 days or more.",
      current: dbUser?.currentStreak ?? 0,
      target: 7,
      unlocked: (dbUser?.currentStreak ?? 0) >= 7 || (dbUser?.longestStreak ?? 0) >= 7,
      progressText: `Streak: ${dbUser?.currentStreak ?? 0}/7 days`,
      color: "from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30 shadow-rose-500/10",
    },
    {
      id: "around_the_world",
      name: "Around The World",
      icon: "🌍",
      desc: "Explore the globe by studying in 15 or more unique airports.",
      current: uniqueAirportsCount,
      target: 15,
      unlocked: uniqueAirportsCount >= 15,
      progressText: `${uniqueAirportsCount}/15 airports`,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10",
    },
    {
      id: "red_eye",
      name: "Red-Eye Warrior",
      icon: "🦉",
      desc: "Navigate through the dark hours by landing a study run between 00:00 and 05:00 AM.",
      current: hasRedEye ? 1 : 0,
      target: 1,
      unlocked: hasRedEye,
      progressText: hasRedEye ? "Unlocked" : "0/1 flight",
      color: "from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/10",
    },
  ];

  // Helper to check if flight has an exotic route
  const isExoticRoute = (origin: string, destination: string, duration: number) => {
    if (duration >= 240) return true;
    const interContinentalPairs = [
      ["JFK", "SYD"], ["SYD", "JFK"],
      ["BLR", "NRT"], ["NRT", "BLR"],
      ["LHR", "SIN"], ["SIN", "LHR"],
      ["DXB", "JFK"], ["JFK", "DXB"],
      ["SIN", "JFK"], ["JFK", "SIN"],
      ["LAX", "NRT"], ["NRT", "LAX"],
      ["HND", "LHR"], ["LHR", "HND"],
      ["CDG", "SIN"], ["SIN", "CDG"]
    ];
    return interContinentalPairs.some(([o, d]) => origin === o && destination === d);
  };

  // Pagination for Passport Stamps
  const stampsPerPage = 4;
  const totalStampsPages = Math.max(1, Math.ceil(flights.length / stampsPerPage));
  const displayedFlights = flights.slice(currentPassportPage * stampsPerPage, (currentPassportPage + 1) * stampsPerPage);

  return (
    <main className="relative flex min-h-screen flex-col overflow-y-auto bg-navy-950 pb-32">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1a35] to-[#0a1628]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-15"
          style={{
            background: "radial-gradient(ellipse at center, #1e4d8c 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 pt-6 pb-4 max-w-4xl mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition">
          <ArrowLeft className="size-4" />
          <span className="text-sm font-medium">To Cockpit</span>
        </Link>
        <span className="font-display text-lg font-bold text-white tracking-wide">Pilot Terminal</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="relative z-20 mx-auto w-full max-w-4xl px-4 flex-1">
        {/* Feedback Banner */}
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

        {/* Profile Card & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Account details (Left Panel) */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md text-center">
              {/* Avatar with upload */}
              <div
                className="relative mx-auto size-24 rounded-full cursor-pointer group"
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                title="Click to change profile picture"
              >
                <div className="size-full rounded-full border-2 border-electric-500/40 p-1 bg-navy-900/60 overflow-hidden">
                  <img
                    src={avatarPreview || dbUser?.avatarUrl || getAvatarUrl(dbUser?.email || "pilot")}
                    alt="avatar"
                    className="size-full rounded-full object-cover"
                  />
                </div>
                {/* Camera overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarUploading ? (
                    <span className="size-5 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  ) : (
                    <span className="text-xl">📷</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-electric-500 flex items-center justify-center border-2 border-navy-950">
                  <span className="text-[10px]">✏️</span>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <h2 className="mt-4 text-lg font-bold text-white truncate">{dbUser?.name || "Anonymous Pilot"}</h2>
              <p className="text-xs text-white/40 truncate">{dbUser?.email || "no-email@gofocusgen.com"}</p>
              {dbUser?.pilotId && (
                <p className="text-xs font-mono text-neon-400 mt-0.5 tracking-wider">@{dbUser.pilotId}</p>
              )}

              <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-3 items-center justify-center">
                <div className="flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-300">
                  <Coins className="size-4" />
                  <span className="text-sm font-bold">{dbUser?.coins ?? 0} Coins</span>
                </div>

                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase?.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-red-500/20 hover:border-red-500/40 text-red-400 font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign Out 🚪</span>
                </button>
              </div>
            </Card>

            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-md">
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Flight Coordinates</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60">
                    <User className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Display Name</p>
                    <p className="text-sm font-medium text-white/80">{dbUser?.name || "Not entered"}</p>
                  </div>
                </div>

                {dbUser?.pilotId && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-neon-400">
                      <span className="size-4 flex items-center justify-center text-xs font-bold">#</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30">Pilot ID</p>
                      <p className="text-sm font-medium text-neon-400 font-mono tracking-wide">@{dbUser.pilotId}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/30">Auth Email</p>
                    <p className="text-sm font-medium text-white/80 truncate">{dbUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Contact Protocol</p>
                    <p className="text-sm font-medium text-white/80">{dbUser?.phone || "None configured"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-white/60">
                    <span className="size-4 flex items-center justify-center text-xs">👥</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Gender Designation</p>
                    <p className="text-sm font-medium text-white/80 capitalize">
                      {dbUser?.gender ? dbUser.gender.replace(/_/g, " ") : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Onboarding flight manifest details (Right Panel) */}
          <div className="md:col-span-2 space-y-6">
            {/* 1. Aviation Rank Card */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/15 text-3xl shadow-inner">
                    {rankInfo.icon}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-electric-400">Aviation Rank</span>
                    <h4 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      {rankInfo.name}
                      {rankInfo.name !== "Student Pilot" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-300 font-semibold uppercase tracking-wider">Active</span>
                      )}
                    </h4>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 block mb-0.5">Flight Metrics</span>
                  <span className="text-xs font-mono text-white/70">
                    ✈️ {completedFlightsCount} flights • ⏱️ {Math.round(totalHours)} hrs
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-white/70 mb-5 leading-relaxed">{rankInfo.desc}</p>
              
              {rankInfo.nextRank ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white/40">Next Level: <strong className="text-white font-semibold">{rankInfo.nextRank}</strong></span>
                    <span className="text-electric-300 font-mono text-[11px] bg-electric-500/10 px-2 py-0.5 rounded border border-electric-500/20">{rankInfo.nextRankReq}</span>
                  </div>
                  <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-electric-500 via-indigo-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${rankInfo.progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/30 font-medium">
                    <span>Current Rank: {rankInfo.name}</span>
                    <span>Progress: {rankInfo.progressPercent}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 text-amber-300 shadow-lg shadow-amber-500/5">
                  <Sparkles className="size-5 shrink-0 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide">Commander tier unlocked! You have achieved master status. 🚀</span>
                </div>
              )}
            </Card>

            {/* 2. Digital Passport Booklet */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="size-5 text-electric-400 animate-pulse" />
                    Digital Flight Passport
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Your official visa booklet & landing records</p>
                </div>
                
                {completedFlightsCount > 0 && (
                  <div className="flex items-center gap-2 bg-navy-900/60 border border-white/10 px-3 py-1 rounded-full text-xs text-white/60 font-medium">
                    📖 Stamps: <strong className="text-white">{completedFlightsCount}</strong>
                  </div>
                )}
              </div>

              {/* Physical-style booklet wrapper */}
              <div className="bg-[#2f1f17] border-4 border-[#1e140f] rounded-2xl p-2.5 sm:p-4 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />
                
                {/* Vintage Leather spine line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/40 hidden md:block" />
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 border-r border-dashed border-white/10 hidden md:block" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT PAGE: Biodata */}
                  <div className="bg-[#f5ebd6] text-[#423329] border border-[#dcd0b8] rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[300px]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-bl-full pointer-events-none flex items-center justify-center font-serif text-[60px] font-bold opacity-10 text-[#423329]">
                      GFG
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-[#423329]/20 pb-2 mb-3">
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#7c6352]">GoFocusGen Space Fleet</span>
                        <span className="font-mono text-[9px] font-bold bg-[#423329]/10 px-1.5 py-0.5 rounded text-[#423329]/70">
                          PASSPORT NO: GFG-{dbUser?.id?.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex gap-4">
                        {/* Avatar box */}
                        <div className="size-16 sm:size-20 bg-[#ebdcb8] border-2 border-[#c5b597] rounded-lg p-1 shrink-0 overflow-hidden shadow-md">
                          <img
                            src={avatarPreview || dbUser?.avatarUrl || getAvatarUrl(dbUser?.email || "pilot")}
                            alt="biodata avatar"
                            className="size-full object-cover rounded grayscale contrast-125 mix-blend-multiply"
                          />
                        </div>
                        
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Pilot Name / Nom</span>
                            <span className="text-xs font-bold text-[#2d221b] truncate block font-sans tracking-wide uppercase">
                              {dbUser?.name || "Anonymous Pilot"}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Pilot Code ID</span>
                            <span className="text-xs font-mono font-bold text-[#2d221b] truncate block tracking-wider">
                              @{dbUser?.pilotId || "UNLICENSED"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4 border-t border-dashed border-[#423329]/20 pt-3">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Authority / Autorité</span>
                          <span className="text-[10px] font-bold text-[#2d221b]">GFG Control</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Active Rank</span>
                          <span className="text-[10px] font-bold text-[#2d221b] flex items-center gap-1 font-serif">
                            {rankInfo.icon} {rankInfo.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Total Landings</span>
                          <span className="text-[10px] font-bold text-[#2d221b] font-mono">{completedFlightsCount} flights</span>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider text-[#8b7260] block font-bold">Issue Date / Émission</span>
                          <span className="text-[10px] font-bold text-[#2d221b] font-mono">
                            {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : "26 MAY 2026"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-[#423329]/10 text-center">
                      <span className="font-mono text-[7px] text-[#8b7260] tracking-widest block font-bold uppercase">
                        P&lt;GFGPILOT&lt;&lt;{dbUser?.name?.replace(/\s+/g, "").toUpperCase() || "ANONYMOUS"}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                      </span>
                    </div>
                  </div>

                  {/* RIGHT PAGE: Visa Stamps */}
                  <div className="bg-[#f5ebd6] text-[#423329] border border-[#dcd0b8] rounded-xl p-4 sm:p-5 relative overflow-hidden shadow-inner flex flex-col justify-between min-h-[300px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-[#423329]/20 pb-2 mb-3">
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#7c6352]">Visa Stamp Entries</span>
                        <span className="font-serif font-bold text-[10px] text-[#7c6352]/70">
                          Page {currentPassportPage + 1} of {totalStampsPages}
                        </span>
                      </div>

                      {flightsLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[180px] w-full">
                          <Loader2 className="size-6 animate-spin text-[#7c6352]" />
                          <span className="text-[10px] text-[#7c6352]/70 mt-2">Reading stamp booklet...</span>
                        </div>
                      ) : displayedFlights.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 pb-3">
                          {displayedFlights.map((flight, idx) => {
                            const origin = flight.session?.originCode || "???";
                            const dest = flight.session?.destinationCode || "???";
                            const destCity = flight.session?.destination?.split(",")[0]?.toUpperCase() || "UNKNOWN";
                            const duration = flight.session?.duration || 0;
                            const tMode = flight.session?.transportMode || "FLIGHT";
                            const dateStr = flight.session?.completedAt || flight.joinedAt
                              ? new Date(flight.session?.completedAt || flight.joinedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
                              : "UNKNOWN";

                            // Generate nice deterministic ink colors
                            const isExotic = isExoticRoute(origin, dest, duration);
                            const inkColorStyles = isExotic
                              ? "border-2 border-amber-600/75 text-amber-800 bg-amber-500/5 font-bold shadow-[inset_0_0_10px_rgba(245,158,11,0.2)] sparkle-pulse"
                              : idx % 4 === 0
                              ? "border-2 border-[#5a4ba1]/70 text-[#5a4ba1] bg-[#5a4ba1]/5"
                              : idx % 4 === 1
                              ? "border-2 border-[#2b7a78]/70 text-[#2b7a78] bg-[#2b7a78]/5"
                              : idx % 4 === 2
                              ? "border-2 border-[#823329]/70 text-[#823329] bg-[#823329]/5"
                              : "border-2 border-[#3e6b4d]/70 text-[#3e6b4d] bg-[#3e6b4d]/5";

                            // Dynamic tilt rotation
                            const rotateDeg = ((idx * 9 + currentPassportPage * 13) % 12) - 6;
                            const transportEmoji = tMode === "TRAIN" ? "🚆" : tMode === "BUS" ? "🚌" : tMode === "CAR" ? "🚗" : "✈️";

                            return (
                              <motion.div
                                key={flight.id}
                                className={`rounded-full p-2 text-center flex flex-col items-center justify-center aspect-square relative shadow-sm border-dashed select-none ${inkColorStyles}`}
                                style={{ transform: `rotate(${rotateDeg}deg)` }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                              >
                                {isExotic && (
                                  <div className="absolute -top-1 -right-1 text-[9px] animate-pulse">⭐</div>
                                )}
                                <span className="text-[7px] font-bold tracking-widest font-mono opacity-80 uppercase block">
                                  {origin} ➔ {dest}
                                </span>
                                <span className="text-[12px] font-black tracking-wide my-0.5 block leading-none font-sans">
                                  {dest}
                                </span>
                                <span className="text-[6px] font-extrabold max-w-[70px] truncate block leading-tight font-serif">
                                  {destCity}
                                </span>
                                <span className="text-[6px] font-mono mt-0.5 block opacity-90 font-bold border-t border-[#423329]/10 pt-0.5 leading-none">
                                  {transportEmoji} {dateStr}
                                </span>
                              </motion.div>
                            );
                          })}
                          
                          {/* Dotted placeholders for empty slots */}
                          {Array.from({ length: stampsPerPage - displayedFlights.length }).map((_, placeholderIdx) => (
                            <div
                              key={`placeholder-${placeholderIdx}`}
                              className="rounded-full border border-dashed border-[#423329]/15 aspect-square flex flex-col items-center justify-center select-none text-[8px] text-[#423329]/25 font-bold uppercase tracking-wider text-center p-2"
                            >
                              <span>Stamp Slot</span>
                              <span className="text-xs mt-1">🧭</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center min-h-[180px] w-full text-center p-4">
                          <div className="text-3xl animate-bounce mb-2">✈️</div>
                          <span className="text-xs font-bold text-[#7c6352] uppercase tracking-wider block">No visa entries</span>
                          <p className="text-[10px] text-[#7c6352]/70 mt-1 max-w-[170px] leading-relaxed">
                            Take off on a focus study flight from the cockpit to receive your first landing stamp!
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalStampsPages > 1 && (
                      <div className="flex items-center justify-between border-t border-[#423329]/10 pt-2.5">
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          disabled={currentPassportPage === 0}
                          onClick={() => setCurrentPassportPage((p) => Math.max(0, p - 1))}
                          className="px-2 py-1 h-auto text-[10px] font-bold text-[#7c6352] hover:text-[#423329] hover:bg-black/5 disabled:opacity-20 flex items-center gap-1"
                        >
                          <ChevronLeft className="size-3" /> Prev
                        </Button>
                        <span className="text-[10px] font-bold font-mono text-[#7c6352]/70">
                          {currentPassportPage + 1} / {totalStampsPages}
                        </span>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          disabled={currentPassportPage === totalStampsPages - 1}
                          onClick={() => setCurrentPassportPage((p) => Math.min(totalStampsPages - 1, p + 1))}
                          className="px-2 py-1 h-auto text-[10px] font-bold text-[#7c6352] hover:text-[#423329] hover:bg-black/5 disabled:opacity-20 flex items-center gap-1"
                        >
                          Next <ChevronRight className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Route Mastery Badges Showcase */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="size-5 text-electric-400" />
                    Route Mastery Showcase
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Global travel focus milestones and achievements</p>
                </div>
                
                <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-full">
                  ⭐ Unlocked: {badgesData.filter(b => b.unlocked).length} / 5
                </span>
              </div>

              {/* Badges Case Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badgesData.map((badge) => {
                  const percent = Math.min(100, Math.round((badge.current / badge.target) * 100));

                  return (
                    <motion.div
                      key={badge.id}
                      className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                        badge.unlocked
                          ? "bg-gradient-to-br from-indigo-950/40 via-navy-950/30 to-purple-950/40 border-purple-500/30 text-white shadow-lg shadow-purple-500/5 hover:border-purple-500/50 hover:shadow-purple-500/10 group"
                          : "bg-white/[0.01] border-white/5 opacity-55 hover:opacity-75 transition-opacity"
                      }`}
                      whileHover={badge.unlocked ? { y: -2, scale: 1.01 } : {}}
                    >
                      {/* Decorative unlocked ring glow */}
                      {badge.unlocked && (
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition pointer-events-none" />
                      )}

                      <div className="flex gap-3">
                        <div className={`size-11 rounded-xl flex items-center justify-center border text-2xl shrink-0 ${
                          badge.unlocked
                            ? "bg-purple-500/15 border-purple-500/30 text-white"
                            : "bg-white/5 border-white/10 text-white/30 grayscale"
                        }`}>
                          {badge.icon}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold tracking-wide truncate text-white font-sans">
                            {badge.name}
                          </h4>
                          <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                            {badge.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-white/40">
                          <span>Status</span>
                          <span className={badge.unlocked ? "text-purple-300 font-bold" : "text-white/60"}>
                            {badge.progressText}
                          </span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              badge.unlocked
                                ? "bg-gradient-to-r from-purple-500 to-electric-400"
                                : "bg-white/10"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Check star decoration */}
                      {badge.unlocked && (
                        <div className="absolute top-2 right-2 text-xs text-amber-400">
                          ⭐
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* 4. Onboarding flight manifest details Card */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="size-5 text-electric-400" />
                    Flight Onboarding Manifest
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Your study-time cabin configurations</p>
                </div>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-white/10 hover:bg-white/5 text-white/80"
                  >
                    Edit Manifest
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Pilot Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Gender</label>
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                      >
                        <option value="male">Male 👨</option>
                        <option value="female">Female 👩</option>
                        <option value="prefer_not_to_say">Prefer not to say 👤</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Satellite Dial-in Link (Phone)</label>
                      <div className="flex gap-1.5">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-navy-900 border border-white/10 rounded-lg px-2 py-2 text-xs focus:border-electric-500 focus:outline-none shrink-0"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={`${c.country}-${c.code}`} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="555-019-2834"
                          className="flex-1 bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Age Category</label>
                      <select
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                      >
                        <option value="Teen">13-19 (Teen)</option>
                        <option value="Young Adult">20-25 (Young Adult)</option>
                        <option value="Professional">26-35 (Professional)</option>
                        <option value="Expert Scholar">36+ (Expert Scholar)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Preferred Departure Slot</label>
                      <input
                        type="text"
                        value={editForm.studyTime}
                        onChange={(e) => setEditForm({ ...editForm, studyTime: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        placeholder="e.g., Redeye flight, Early morning"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Cruise Duration</label>
                      <input
                        type="text"
                        value={editForm.studyDuration}
                        onChange={(e) => setEditForm({ ...editForm, studyDuration: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        placeholder="e.g., 90 minutes"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Distraction Shield</label>
                      <input
                        type="text"
                        value={editForm.distractibility}
                        onChange={(e) => setEditForm({ ...editForm, distractibility: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        placeholder="e.g., Zero tolerance"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Zen Phone Protocol</label>
                      <input
                        type="text"
                        value={editForm.callDistraction}
                        onChange={(e) => setEditForm({ ...editForm, callDistraction: e.target.value })}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none"
                        placeholder="e.g., Strict auto-decline"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button type="submit" disabled={saveLoading} className="bg-electric-500 hover:bg-electric-600 text-white font-semibold">
                      {saveLoading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: dbUser?.name || "",
                          phone: dbUser?.phone || "",
                          gender: dbUser?.gender || "prefer_not_to_say",
                          age: dbUser?.age || "21",
                          studyTime: dbUser?.studyTime || "",
                          studyDuration: dbUser?.studyDuration || "",
                          distractibility: dbUser?.distractibility || "",
                          callDistraction: dbUser?.callDistraction || "",
                        });
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Clock className="size-4 text-electric-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Onboarding Age Category</p>
                        <p className="text-sm font-medium text-white/90">{dbUser?.age || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="size-4 text-electric-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Departure Slot Preference</p>
                        <p className="text-sm font-medium text-white/90">{dbUser?.studyTime || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Compass className="size-4 text-electric-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Standard Flight Cruise Duration</p>
                        <p className="text-sm font-medium text-white/90">{dbUser?.studyDuration || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="size-4 text-electric-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Distraction Turbulence Shield</p>
                        <p className="text-sm font-medium text-white/90">{dbUser?.distractibility || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Smartphone className="size-4 text-electric-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Zen Phone Call Protocol</p>
                        <p className="text-sm font-medium text-white/90">{dbUser?.callDistraction || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Password Reset (Middle Panel) */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Lock className="size-5 text-electric-400" />
                Secure Flight Credentials
              </h3>
              <p className="text-xs text-white/40 mb-4">Reset your account login password</p>

              {isGoogleUser ? (
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-start gap-3">
                  <Shield className="size-5 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    <strong>OAuth Single Sign-On Active:</strong> You are logged in securely using Google OAuth. Password resets are handled directly inside your Google Account settings.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {passwordMessage && (
                    <div className={`p-3 rounded-lg border text-xs font-semibold ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}>
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none text-white"
                        placeholder="At least 6 characters"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/60">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-electric-500 focus:outline-none text-white"
                        placeholder="At least 6 characters"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={passwordLoading} className="bg-white/10 hover:bg-white/15 text-white font-semibold hover:border-white/20 border border-white/10">
                    {passwordLoading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                    Reset Password
                  </Button>
                </form>
              )}
            </Card>

            {/* Danger Zone (Bottom Panel) */}
            <Card className="p-6 bg-rose-950/15 border-rose-500/20 backdrop-blur-md">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2 mb-1.5">
                <Trash2 className="size-5" />
                Danger Zone
              </h3>
              <p className="text-xs text-rose-300/60 mb-4">
                Permanently delete your GoFocusGen pilot credential logs, flight metrics, and coins. This action is completely irreversible.
              </p>
              
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete Pilot Account
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleteLoading && setShowDeleteModal(false)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-rose-500/30 bg-navy-900 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertTriangle className="size-6 shrink-0 animate-pulse" />
                <h3 className="text-lg font-bold">Irreversible Cabin Deletion</h3>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-4">
                You are about to permanently scrap your GoFocusGen profile. All flight logs, coin reserves, study analytics, and Supabase auth records will be wiped from our systems.
              </p>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-4 text-center">
                <p className="text-xs text-white/50">To confirm, type the phrase below in all-caps:</p>
                <p className="text-sm font-mono font-bold text-white select-none mt-1 tracking-wider">DELETE MY CABIN</p>
              </div>

              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                disabled={deleteLoading}
                className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:outline-none text-white text-center font-mono font-bold tracking-wider mb-5"
                placeholder="Type the confirmation phrase"
              />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "DELETE MY CABIN" || deleteLoading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-40"
                >
                  {deleteLoading ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
                  Scrap Account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInput("");
                  }}
                  disabled={deleteLoading}
                  className="flex-1 text-white/60 hover:text-white hover:bg-white/5"
                >
                  Abort
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-3 pb-8 pt-4">
        <BottomNav />
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
