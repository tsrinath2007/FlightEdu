"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pilotId, setPilotId] = useState("");
  const [pilotIdStatus, setPilotIdStatus] = useState<"idle" | "error" | "taken" | "valid">("idle");
  const [pilotIdMessage, setPilotIdMessage] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handlePilotIdChange(val: string) {
    const cleanVal = val.toLowerCase().replace(/[^a-z0-9_]/g, ""); // Allow only lowercase alphanumeric and underscores
    setPilotId(cleanVal);
    
    if (cleanVal.length === 0) {
      setPilotIdStatus("idle");
      setPilotIdMessage("");
      return;
    }

    if (cleanVal.length < 6) {
      setPilotIdStatus("error");
      setPilotIdMessage("⚠️ Minimum 6 characters required.");
      return;
    }

    const TAKEN_IDS = [
      "captain_emily", "cadet_liam", "copilot_sophia", "cadet_aarav", 
      "cadet_chloe", "cadet_hiroshi", "cadet_elena", "admin_pilot", 
      "flightedu_host", "voyageiq_admin"
    ];

    const localTaken = localStorage.getItem("taken_pilot_ids");
    let takenList = TAKEN_IDS;
    if (localTaken) {
      try {
        takenList = [...TAKEN_IDS, ...JSON.parse(localTaken)];
      } catch (e) {}
    }

    if (takenList.includes(cleanVal)) {
      setPilotIdStatus("taken");
      setPilotIdMessage("❌ Pilot ID is already taken by another cadet.");
    } else {
      setPilotIdStatus("valid");
      setPilotIdMessage("✅ Pilot ID is available!");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (pilotIdStatus !== "valid") {
      setError("Please choose a valid and available Pilot ID first.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Satellite frequency (Phone number) is required.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const fullPhone = `${countryCode}${phoneNumber}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, pilotId, phone: fullPhone, gender },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      // Persist details locally for offline-first profile synchronization
      const localTaken = localStorage.getItem("taken_pilot_ids");
      let takenList: string[] = [];
      if (localTaken) {
        try {
          takenList = JSON.parse(localTaken);
        } catch (e) {}
      }
      if (!takenList.includes(pilotId)) {
        takenList.push(pilotId);
        localStorage.setItem("taken_pilot_ids", JSON.stringify(takenList));
      }
      localStorage.setItem(`flight_pilot_id_${email}`, pilotId);
      localStorage.setItem("flight_active_pilot_id", pilotId);
      localStorage.setItem(`flight_gender_${email}`, gender);
      localStorage.setItem(`flight_phone_${email}`, fullPhone);
      setDone(true);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[15%] size-[500px] rounded-full bg-neon-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[10%] size-[400px] rounded-full bg-electric-500/8 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="text-3xl">🌍</span>
          <span className="font-display text-2xl font-bold text-white">FlightEdu</span>
        </Link>

        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl p-8">
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-4 text-5xl">🛫</div>
              <h2 className="font-display text-xl font-bold text-white">Boarding pass sent!</h2>
              <p className="mt-2 text-sm text-white/50">
                Check <span className="text-white">{email}</span> to confirm your account.
              </p>
              <Link href="/login" className="mt-6 inline-block text-sm text-electric-400 hover:underline">
                Back to sign in
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white">Start your journey</h1>
              <p className="mt-1 text-sm text-white/50">Create your free account</p>

              <Button
                variant="ghost"
                size="lg"
                className="mt-6 w-full"
                loading={googleLoading}
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-xs text-white/30">or</span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Display name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nikhil"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Custom Pilot ID (Username)</label>
                  <input
                    type="text"
                    required
                    value={pilotId}
                    onChange={(e) => handlePilotIdChange(e.target.value)}
                    placeholder="e.g. captain_tom"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:ring-1 ${
                      pilotIdStatus === "valid"
                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/30"
                        : pilotIdStatus === "taken" || pilotIdStatus === "error"
                        ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30"
                        : "border-white/10 focus:border-electric-500/50 focus:ring-electric-500/30"
                    } bg-white/5`}
                  />
                  {pilotIdMessage && (
                    <p className={`mt-1.5 text-[10px] font-semibold ${
                      pilotIdStatus === "valid"
                        ? "text-emerald-400 animate-pulse"
                        : "text-rose-400"
                    }`}>
                      {pilotIdMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                  >
                    <option value="male" className="bg-navy-900 text-white">Male 👨</option>
                    <option value="female" className="bg-navy-900 text-white">Female 👩</option>
                    <option value="prefer_not_to_say" className="bg-navy-900 text-white">Prefer not to say 👤</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Satellite Dial-in Link (Phone)</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="rounded-xl border border-white/10 bg-navy-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30 shrink-0"
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
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/30"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg bg-coral-500/10 border border-coral-500/20 px-3 py-2 text-xs text-coral-400"
                  >
                    ⚡ {error}
                  </motion.p>
                )}

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  Create account 🛫
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-white/40">
                Already have an account?{" "}
                <Link href="/login" className="text-electric-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
