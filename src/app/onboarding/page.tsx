"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
  Smartphone,
  Mail,
  User,
  Clock,
  Compass,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface OnboardingData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: string;
  studyTime: string;
  studyDuration: string;
  distractibility: string;
  callDistraction: string;
}

const INITIAL_DATA: OnboardingData = {
  name: "",
  email: "",
  phone: "",
  gender: "prefer_not_to_say",
  age: "21",
  studyTime: "",
  studyDuration: "",
  distractibility: "",
  callDistraction: "",
};

const AGE_GROUPS = [
  { label: "13-19", value: "Teen", desc: "High School / Prep" },
  { label: "20-25", value: "Young Adult", desc: "University / Career Start" },
  { label: "26-35", value: "Professional", desc: "Continuous Learning" },
  { label: "36+", value: "Expert Scholar", desc: "Personal Growth" },
];

const STUDY_TIMES = [
  {
    value: "morning",
    label: "Morning Cabin",
    time: "05:00 - 12:00",
    emoji: "🌅",
    desc: "Fresh takeoff with peak cognitive battery.",
    color: "from-amber-400/20 to-orange-500/20 text-amber-300 border-amber-500/30",
  },
  {
    value: "afternoon",
    label: "Midday Transit",
    time: "12:00 - 17:00",
    emoji: "☀️",
    desc: "Steady cruise altitude through midday slump.",
    color: "from-sky-400/20 to-blue-500/20 text-sky-300 border-sky-500/30",
  },
  {
    value: "evening",
    label: "Sunset Descent",
    time: "17:00 - 21:00",
    emoji: "🌆",
    desc: "Wind-down velocity with highly focused review.",
    color: "from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30",
  },
  {
    value: "night",
    label: "Midnight Flight",
    time: "21:00 - 05:00",
    emoji: "🌌",
    desc: "Silent space cruising. Zero external static.",
    color: "from-indigo-600/20 to-violet-600/20 text-indigo-300 border-indigo-500/30",
  },
];

const STUDY_DURATIONS = [
  {
    value: "short",
    label: "Quick Layover",
    hours: "Under 2 hrs / day",
    emoji: "⏱️",
    desc: "Micro sessions focused on rapid high-yield tasks.",
  },
  {
    value: "medium",
    label: "Regional Flight",
    hours: "2 - 4 hrs / day",
    emoji: "⌛",
    desc: "Optimal balance of focus block and recovery.",
  },
  {
    value: "long",
    label: "Cross-Continental",
    hours: "4 - 6 hrs / day",
    emoji: "🚀",
    desc: "Deep focus voyage requiring structured navigation.",
  },
  {
    value: "ultra",
    label: "Deep Space Cruise",
    hours: "6+ hrs / day",
    emoji: "🌌",
    desc: "Elite duration, critical to avoid system overload.",
  },
];

const DISTRACT_LEVELS = [
  {
    value: "rarely",
    label: "Shielded Cockpit",
    level: "Rarely Distracted",
    emoji: "🛡️",
    desc: "Laser focus. Notifications and sirens bounce off your dome.",
  },
  {
    value: "occasionally",
    label: "Turbulent Cabin",
    level: "Occasionally Drifts",
    emoji: "📱",
    desc: "Notifications cause minor flight delays but you recover.",
  },
  {
    value: "highly",
    label: "Open Windshield",
    level: "Highly Distractible",
    emoji: "🌀",
    desc: "A leaf blowing in the wind takes you off-course.",
  },
];

const CALL_DISTRACTIONS = [
  {
    value: "pickup",
    label: "Instantly Pick Up",
    emoji: "📞",
    desc: "Emergency or not, phone goes straight to your ear.",
    vibe: "High Interference",
  },
  {
    value: "screen",
    label: "Screen & Decide",
    emoji: "👀",
    desc: "Check caller ID. If it's a VIP, study flight gets paused.",
    vibe: "Selective Focus",
  },
  {
    value: "decline",
    label: "Decline Immediately",
    emoji: "🚫",
    desc: "Study mode is sacred. They can call back post-landing.",
    vibe: "Armor Plated",
  },
  {
    value: "another_room",
    label: "Phone in Other Room",
    emoji: "📴",
    desc: "Physical detachment. Out of sight, out of orbit.",
    vibe: "Zen Master",
  },
];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setData((prev) => ({ ...prev, phone: `${countryCode}${phoneNumber}` }));
  }, [countryCode, phoneNumber]);

  useEffect(() => {
    async function loadUser() {
      // Check if simulated query parameter is present for local test bypass
      const params = new URLSearchParams(window.location.search);
      const isSimulatedParam = params.get("simulated") === "true";

      if (isSimulatedParam) {
        setIsSimulated(true);
        setData((prev) => ({
          ...prev,
          name: "Alex Groves",
          email: "alex.groves@gmail.com",
        }));
        setAuthLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setAuthLoading(false);
        return;
      }
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Not authenticated, redirect to home page login gate
        router.push("/");
        return;
      }

      // Check if they are already onboarded in the database
      try {
        const statusRes = await fetch("/api/user/onboard");
        const status = await statusRes.json() as { onboarded: boolean };
        if (status.onboarded) {
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        console.warn("Failed to check onboarding status:", err);
      }

      const userPhone = user.user_metadata?.phone ?? "";
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

      // Pre-populate details from Supabase User Auth Metadata
      setData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
        email: user.email ?? "",
        phone: userPhone,
        gender: user.user_metadata?.gender ?? "prefer_not_to_say",
      }));
      setAuthLoading(false);
    }
    loadUser();
  }, [router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 text-white gap-4">
        <span className="size-8 rounded-full border-4 border-electric-500 border-t-transparent animate-spin" />
        <p className="text-xs uppercase tracking-widest text-white/40">Loading Pilot Profile...</p>
      </div>
    );
  }

  const validateStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!data.name.trim()) newErrors.name = "Pilot's name is required";
      if (!data.email.trim()) {
        newErrors.email = "Flight dispatch email is required";
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        newErrors.email = "Provide a valid coordinates format (email)";
      }
      if (!data.phone.trim()) {
        newErrors.phone = "Satellite frequency (Phone) is required";
      } else if (data.phone.replace(/\D/g, "").length < 8) {
        newErrors.phone = "Provide a valid phone link";
      }
    } else if (step === 2) {
      if (!data.studyTime) newErrors.studyTime = "Please select your departure slot";
    } else if (step === 3) {
      if (!data.studyDuration) newErrors.studyDuration = "Please select your cruise duration";
      if (!data.distractibility) newErrors.distractibility = "Please gauge your shield effectiveness";
    } else if (step === 4) {
      if (!data.callDistraction) newErrors.callDistraction = "Please designate emergency protocols";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const completeOnboarding = async () => {
    if (!validateStep()) return;

    setSubmitLoading(true);
    try {
      // Post details to our database onboarding route
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        localStorage.setItem("flightedu_onboarding", JSON.stringify(data));
        setStep(5); // Show boarding pass
      } else {
        console.error("Failed to submit onboarding details to DB");
        // Fallback: Proceed to show boarding pass on client anyway to preserve UX resiliency
        localStorage.setItem("flightedu_onboarding", JSON.stringify(data));
        setStep(5);
      }
    } catch (err) {
      console.warn("Onboarding submit warning:", err);
      // Fallback
      localStorage.setItem("flightedu_onboarding", JSON.stringify(data));
      setStep(5);
    } finally {
      setSubmitLoading(false);
    }
  };

  const stepLabels = [
    "",
    "Credentials",
    "Flight Plan",
    "Focus Metrics",
    "Interference",
    "Ticket Issued",
  ];

  return (
    <main className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-navy-950 px-4 py-8 md:p-8 noise animate-fade-in">
      {/* Background ambient cosmic glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-30%] left-[20%] size-[600px] rounded-full bg-electric-500/10 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[10%] size-[500px] rounded-full bg-neon-600/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] size-[350px] rounded-full bg-gold-500/5 blur-[90px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🌍</span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            FlightEdu
          </span>
        </div>
        {step > 0 && step < 5 && (
          <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-white/50 md:flex">
            <span className={`size-1.5 rounded-full ${isSimulated ? "bg-amber-400 animate-pulse" : "bg-emerald-500 animate-ping"}`} />
            {isSimulated ? "Simulation Active (Testing Mode)" : "Connected via Google Session"}
          </div>
        )}
      </header>

      {/* Progress Timeline Indicator */}
      {step > 0 && step < 5 && (
        <div className="relative z-10 mx-auto mt-8 w-full max-w-2xl px-2">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-white/5" />
            <div
              className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-electric-500 to-neon-500 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 text-lg"
              animate={{ left: `calc(${((step - 1) / 3) * 100}% - 10px)` }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              🛫
            </motion.div>

            {[1, 2, 3, 4].map((nodeIdx) => {
              const isActive = step >= nodeIdx;
              const isCurrent = step === nodeIdx;
              return (
                <div key={nodeIdx} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.25 : 1,
                      borderColor: isCurrent
                        ? "#0ea5e9"
                        : isActive
                        ? "#8b5cf6"
                        : "rgba(255,255,255,0.08)",
                      backgroundColor: isActive ? "#0a0f1e" : "#050a17",
                    }}
                    className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                      isActive ? "text-white" : "text-white/30"
                    }`}
                  >
                    {isActive && step > nodeIdx ? (
                      <Check className="size-4 text-emerald-400" />
                    ) : (
                      nodeIdx
                    )}
                  </motion.div>
                  <span
                    className={`absolute top-10 whitespace-nowrap text-[10px] font-medium tracking-wider uppercase transition-colors duration-300 ${
                      isCurrent ? "text-electric-400" : "text-white/30"
                    }`}
                  >
                    {stepLabels[nodeIdx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Container Wizard */}
      <section className="relative z-10 mx-auto my-auto flex w-full max-w-2xl items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Identity Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <Card className="glass overflow-hidden border border-white/10 p-8 shadow-2xl">
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    <Sparkles className="size-4" /> Google Verification Complete
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">
                    Setup Flight Manifest
                  </h2>
                  <p className="text-sm text-white/50">
                    Confirm your pilot identity and coordinates before takeoff.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
                      Pilot Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="size-4 text-white/30" />
                      </div>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        placeholder="Alex Groves"
                        className={`w-full rounded-xl border ${
                          errors.name ? "border-coral-500/50" : "border-white/10"
                        } bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-xs text-coral-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
                      Flight Coordination Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="size-4 text-white/30" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={data.email}
                        placeholder="alex.groves@gmail.com"
                        className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-white/40 outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone number field */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
                      Satellite Dial-in Link (Phone)
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="rounded-xl border border-white/10 bg-navy-950 px-3 py-3 text-sm text-white outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30 shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={`${c.country}-${c.code}`} value={c.code} className="bg-navy-900 text-white">
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
                        className={`flex-1 rounded-xl border ${
                          errors.phone ? "border-coral-500/50" : "border-white/10"
                        } bg-white/5 py-3 px-4 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-coral-400">{errors.phone}</p>
                    )}
                  </div>

                  {/* Gender select field */}
                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-white/60">
                      Gender
                    </label>
                    <select
                      value={data.gender}
                      onChange={(e) => setData({ ...data, gender: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-navy-950 px-4 py-3 text-sm text-white outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                    >
                      <option value="male" className="bg-navy-900 text-white">Male 👨</option>
                      <option value="female" className="bg-navy-900 text-white">Female 👩</option>
                      <option value="prefer_not_to_say" className="bg-navy-900 text-white">Prefer not to say 👤</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                  <Button onClick={handleNext} className="w-32">
                    Next Section <ArrowRight className="size-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Age and When do u study */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <Card className="glass border border-white/10 p-8 shadow-2xl">
                <div className="mb-8">
                  <span className="text-xs font-semibold tracking-wider text-neon-400 uppercase">
                    Step 2: Flight Path Scheduling
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">
                    Chronology & Timelines
                  </h2>
                  <p className="text-sm text-white/50">
                    Tell us about your age brackets and premium takeoff timing.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-white/60">
                      Select Age Bracket
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {AGE_GROUPS.map((g) => (
                        <div
                          key={g.label}
                          onClick={() => setData({ ...data, age: g.label })}
                          className={`relative cursor-pointer rounded-xl border p-4 text-center transition-all ${
                            data.age === g.label
                              ? "border-neon-500 bg-neon-600/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white"
                              : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8 text-white/60"
                          }`}
                        >
                          <div className="text-base font-bold">{g.label}</div>
                          <div className="mt-1 text-[9px] uppercase tracking-wide text-white/40">
                            {g.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-white/60">
                      When do you study? (Peak Flight Schedule)
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {STUDY_TIMES.map((t) => {
                        const isSelected = data.studyTime === t.value;
                        return (
                          <div
                            key={t.value}
                            onClick={() => setData({ ...data, studyTime: t.value })}
                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                              isSelected
                                ? `bg-gradient-to-br ${t.color} border-white/20 shadow-glow-neon text-white`
                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8 text-white/60"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{t.emoji}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/45">
                                {t.time}
                              </span>
                            </div>
                            <h4 className="mt-3 font-display font-bold text-white text-sm">
                              {t.label}
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                              {t.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {errors.studyTime && (
                      <p className="mt-2 text-xs text-coral-400">{errors.studyTime}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between border-t border-white/5 pt-6">
                  <Button variant="ghost" onClick={handlePrev}>
                    Back
                  </Button>
                  <Button onClick={handleNext} className="w-32">
                    Next Section <ArrowRight className="size-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: How much time, Easily distracted? */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <Card className="glass border border-white/10 p-8 shadow-2xl">
                <div className="mb-8">
                  <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                    Step 3: Cabin Focus Configuration
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">
                    Durations & Shielding
                  </h2>
                  <p className="text-sm text-white/50">
                    Configure your daily study duration limit and focus shielding capacity.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-white/60">
                      How much time do you study daily?
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {STUDY_DURATIONS.map((dur) => {
                        const isSelected = data.studyDuration === dur.value;
                        return (
                          <div
                            key={dur.value}
                            onClick={() => setData({ ...data, studyDuration: dur.value })}
                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                              isSelected
                                ? "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-white"
                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8 text-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{dur.emoji}</span>
                              <div>
                                <h4 className="font-display font-bold text-white text-sm">
                                  {dur.label}
                                </h4>
                                <span className="text-[10px] text-white/50">{dur.hours}</span>
                              </div>
                            </div>
                            <p className="mt-2 text-[11px] text-white/40 leading-relaxed">
                              {dur.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {errors.studyDuration && (
                      <p className="mt-2 text-xs text-coral-400">{errors.studyDuration}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-white/60">
                      General Distractibility Shield Level
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {DISTRACT_LEVELS.map((lev) => {
                        const isSelected = data.distractibility === lev.value;
                        return (
                          <div
                            key={lev.value}
                            onClick={() => setData({ ...data, distractibility: lev.value })}
                            className={`cursor-pointer rounded-xl border p-4 text-center transition-all ${
                              isSelected
                                ? "border-electric-500 bg-electric-500/10 shadow-glow-electric text-white"
                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8 text-white/60"
                            }`}
                          >
                            <div className="text-3xl">{lev.emoji}</div>
                            <h4 className="mt-2 font-display font-semibold text-sm text-white">
                              {lev.label}
                            </h4>
                            <div className="text-[10px] text-electric-400 mt-0.5">{lev.level}</div>
                            <p className="mt-2 text-[10px] leading-relaxed text-white/40">
                              {lev.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {errors.distractibility && (
                      <p className="mt-2 text-xs text-coral-400">{errors.distractibility}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between border-t border-white/5 pt-6">
                  <Button variant="ghost" onClick={handlePrev}>
                    Back
                  </Button>
                  <Button onClick={handleNext} className="w-32">
                    Next Section <ArrowRight className="size-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: Call Distraction Scenario */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full"
            >
              <Card className="glass border border-white/10 p-8 shadow-2xl">
                <div className="mb-8">
                  <span className="text-xs font-semibold tracking-wider text-pink-400 uppercase">
                    Step 4: Emergency Interference Protocols
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">
                    Study Call Interference Test
                  </h2>
                  <p className="text-sm text-white/50">
                    Will you distract when someone calls you on your satellite link when you are cruising at peak focus?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CALL_DISTRACTIONS.map((c) => {
                      const isSelected = data.callDistraction === c.value;
                      return (
                        <div
                          key={c.value}
                          onClick={() => setData({ ...data, callDistraction: c.value })}
                          className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                            isSelected
                              ? "border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)] text-white"
                              : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/8 text-white/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{c.emoji}</span>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isSelected
                                  ? "bg-pink-500/20 text-pink-300"
                                  : "bg-white/5 text-white/40"
                              }`}
                            >
                              {c.vibe}
                            </span>
                          </div>
                          <h4 className="mt-3 font-display font-bold text-white text-sm">
                            {c.label}
                          </h4>
                          <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                            {c.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {errors.callDistraction && (
                    <p className="text-xs text-coral-400">{errors.callDistraction}</p>
                  )}

                  <div className="rounded-xl border border-white/5 bg-gradient-to-r from-blue-950/20 to-purple-950/20 p-4 text-xs text-white/50 flex gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <strong className="text-white">Did you know?</strong> In FlightEdu, choosing to physically detach your phone rewards you with a <span className="text-gradient-electric font-semibold">+1.5x Multiplier bonus</span> on all earned focus mileage!
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between border-t border-white/5 pt-6">
                  <Button variant="ghost" onClick={handlePrev}>
                    Back
                  </Button>
                  <Button
                    onClick={completeOnboarding}
                    loading={submitLoading}
                    className="w-48 bg-gradient-to-r from-electric-500 to-neon-500"
                  >
                    Finalize Manifest 🚀
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: Boarding Pass */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-navy-900 shadow-2xl p-px">
                <div className="absolute -left-16 -top-16 size-48 rounded-full bg-electric-500/10 blur-2xl" />
                <div className="absolute -right-16 -bottom-16 size-48 rounded-full bg-neon-600/10 blur-2xl" />

                <div className="bg-gradient-to-r from-electric-950 to-navy-800 px-6 py-6 text-center border-b border-dashed border-white/10 relative">
                  <div className="absolute left-0 right-0 bottom-[-6px] flex justify-between px-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                      <span key={i} className="size-[6px] rounded-full bg-navy-950" />
                    ))}
                  </div>

                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    🟢 Boarding Manifest Confirmed
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white uppercase">
                    FLIGHTEDU DISPATCH
                  </h2>
                  <p className="text-[10px] font-medium tracking-widest text-white/45 uppercase mt-1">
                    STUDENT FOCUS PASS & MANIFEST
                  </p>
                </div>

                <div className="px-8 py-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        Pilot Name
                      </div>
                      <div className="font-display font-bold text-white text-base truncate">
                        {data.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                        Seat Assignment
                      </div>
                      <div className="font-display font-bold text-gradient-electric text-base">
                        09F (Focus Cabin)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                        <Mail className="size-3 text-electric-400" /> Dispatch Coordinate
                      </div>
                      <div className="text-xs text-white/80 font-medium truncate">
                        {data.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                        <Phone className="size-3 text-electric-400" /> Satellite Link
                      </div>
                      <div className="text-xs text-white/80 font-medium truncate">
                        {data.phone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                        <Clock className="size-3 text-neon-400" /> Takeoff Timing
                      </div>
                      <div className="text-xs text-white font-semibold">
                        {STUDY_TIMES.find((t) => t.value === data.studyTime)?.label || "Midnight Flight"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 flex items-center gap-1.5">
                        <Compass className="size-3 text-amber-400" /> Duration Bracket
                      </div>
                      <div className="text-xs text-white font-semibold">
                        {STUDY_DURATIONS.find((d) => d.value === data.studyDuration)?.hours || "2 - 4 hrs"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                        Shield Integrity Analysis
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="size-3" /> Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-white/30 block text-[9px] uppercase">
                          Distraction Status
                        </span>
                        <span className="font-semibold text-white">
                          {DISTRACT_LEVELS.find((l) => l.value === data.distractibility)?.level || "Laser Shielded"}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/30 block text-[9px] uppercase">
                          Call Protocol
                        </span>
                        <span className="font-semibold text-white">
                          {CALL_DISTRACTIONS.find((c) => c.value === data.callDistraction)?.label || "Zen Detachment"}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] leading-relaxed text-white/50 italic border-t border-white/5 pt-2">
                      💡 {data.callDistraction === "another_room"
                        ? "Zen Master protocol confirmed. Phone is docked in outer orbit. You gain the pristine +1.5x cosmic multiplier!"
                        : data.callDistraction === "decline"
                        ? "Pristine armor plate configured. The world will wait until your study flight lands."
                        : "Heads up: Your current call protocols expose you to focus turbulence. Try putting your phone in another room to unlock full multipliers!"}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="h-10 w-full bg-white bg-[linear-gradient(90deg,#000_2px,transparent_2px,#000_5px,transparent_5px,#000_1px,transparent_3px,#000_8px,transparent_1px,#000_2px)] opacity-85 rounded" />
                    <span className="text-[9px] tracking-[0.3em] font-mono text-white/30 uppercase mt-1">
                      VIQ-PASS-{data.name ? data.name.substring(0,3).toUpperCase() : "ALE"}-{data.age}
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border-t border-white/5 px-8 py-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-gradient-to-r from-electric-500 to-neon-500 hover:shadow-glow-electric text-white font-bold py-6 text-base"
                  >
                    Launch First Flight ✈️
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer Info */}
      <footer className="relative z-10 mx-auto w-full max-w-4xl text-center text-[10px] text-white/20">
        FlightEdu Pilot Registration Terminal • Cruising altitude powered by Next.js 16 & React 19 • Local coords saved safely in sandbox.
      </footer>
    </main>
  );
}
