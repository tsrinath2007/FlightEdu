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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
];

export default function ProfilePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<ProfileDetails | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
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
      localStorage.setItem("flightedu_avatar", base64);
      setAvatarPreview(base64);

      // Try uploading to Supabase Storage
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
        // Save URL to DB
        await fetch("/api/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: publicUrl }),
        });
        // Also overwrite localStorage with the remote URL for future loads
        localStorage.setItem("flightedu_avatar", publicUrl);
        setDbUser((prev) => prev ? { ...prev, avatarUrl: publicUrl } : prev);
      } catch (err) {
        console.warn("Cloud upload failed, avatar saved locally:", err);
      } finally {
        setAvatarUploading(false);
      }
      setFeedback({ type: "success", text: "Profile picture updated ✅" });
      setTimeout(() => setFeedback(null), 3000);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    // Load saved avatar from localStorage on mount
    const savedAvatar = localStorage.getItem("flightedu_avatar");
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
        const cached = localStorage.getItem("flightedu_onboarding");
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
          if (data.user && (data.user.phone || data.user.gender || data.user.name)) {
            // DB returned full data — use it and update localStorage cache
            const dbProfile = {
              ...fallbackProfile,
              ...data.user,
              // DB may return null for some fields, keep fallback in those cases
              phone: data.user.phone || fallbackProfile.phone,
              gender: data.user.gender || fallbackProfile.gender,
              pilotId: data.user.pilotId || fallbackProfile.pilotId,
              name: data.user.name || fallbackProfile.name,
            };
            setDbUser(dbProfile);
            // Persist to localStorage so next refresh is instant
            localStorage.setItem("flightedu_onboarding", JSON.stringify(dbProfile));

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedback(null);

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
              <p className="text-xs text-white/40 truncate">{dbUser?.email || "no-email@flightedu.com"}</p>
              {dbUser?.pilotId && (
                <p className="text-xs font-mono text-neon-400 mt-0.5 tracking-wider">@{dbUser.pilotId}</p>
              )}

              <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-center gap-2.5">
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-300">
                  <Coins className="size-4" />
                  <span className="text-sm font-bold">{dbUser?.coins ?? 0} Coins</span>
                </div>
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
                Permanently delete your FlightEdu pilot credential logs, flight metrics, and coins. This action is completely irreversible.
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
                You are about to permanently scrap your FlightEdu profile. All flight logs, coin reserves, study analytics, and Supabase auth records will be wiped from our systems.
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
    { icon: "🗺️", label: "Map", href: "/map" },
    { icon: "✈️", label: "Journey", href: "/journey" },
    { icon: "🏆", label: "Ranks", href: "/leaderboard" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-2xl bg-navy-800/80 backdrop-blur border border-white/10 px-2 py-1.5">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
