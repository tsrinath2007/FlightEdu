"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smartphone, Apple, CheckCircle2, Sparkles, Send, ShieldCheck, Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import PricingSurveySection from "./PricingSurveySection";

interface AppWaitlistSectionProps {
  isStandalone?: boolean;
}

export default function AppWaitlistSection({ isStandalone = false }: AppWaitlistSectionProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<"all" | "ios" | "android">("all");
  const [count, setCount] = useState<number>(124);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch live count on mount & check if returned from Google OAuth
  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data?.count) {
          setCount(data.count);
        }
      })
      .catch(() => {});

    // Check if returned from Google waitlist signup or if already logged in
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const joinedFromGoogle = urlParams.get("joined") === "google";
      const platformFromUrl = urlParams.get("platform") as "all" | "ios" | "android" | null;
      if (platformFromUrl) setPlatform(platformFromUrl);

      const supabase = createClient();
      if (supabase) {
        supabase.auth.getUser().then((res: any) => {
          const user = res?.data?.user;
          if (user) {
            const userEmail = user.email || "";
            const userName = user.user_metadata?.name || user.user_metadata?.full_name || null;
            const userAvatar = user.user_metadata?.avatar_url || null;

            if (userEmail) setEmail(userEmail);
            if (userName) setName(userName);
            if (userAvatar) setAvatarUrl(userAvatar);

            if (joinedFromGoogle) {
              setSubmitted(true);
              setPosition(count);
            }
          }
        });
      }
    }
  }, [count]);

  // Handle Google OAuth Waitlist Registration
  async function handleGoogleWaitlist() {
    setGoogleLoading(true);
    setError(null);
    const supabase = createClient();
    if (!supabase) {
      setGoogleLoading(false);
      setError("Takeoff failed: Supabase client not configured.");
      return;
    }

    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://gofocusgen.vercel.app";
    const nextPath = isStandalone ? "/app" : "/";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${currentOrigin}/auth/callback?next=${encodeURIComponent(`${nextPath}?joined=google&platform=${platform}`)}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setGoogleLoading(false);
      setError(error.message);
    }
  }

  // Handle Manual Email Waitlist Registration
  async function handleJoinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, platform, name, avatarUrl, provider: "email" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setPosition(data.position || count + 1);
        setCount((prev) => prev + 1);
      } else {
        setError(data.error || "Unable to join waitlist. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="waitlist" className={`relative z-10 mx-auto max-w-6xl px-4 scroll-mt-20 ${isStandalone ? "py-12" : "py-16 md:py-24"}`}>
      {/* Background ambient radar glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="size-[500px] rounded-full bg-electric-500/10 blur-[130px]" />
        <div className="size-[350px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      {/* Header Badge & Title */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-electric-400 mb-4 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        >
          <Smartphone className="size-3.5 animate-pulse" />
          <span>Mobile Cockpit In Flight</span>
          <span className="size-1.5 rounded-full bg-electric-400 animate-ping" />
        </motion.div>

        <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white mb-4">
          GoFocusGen for <span className="text-gradient-electric">iOS & Android</span>
        </h2>
        <p className="mx-auto max-w-2xl text-sm md:text-base text-white/60 leading-relaxed font-body">
          We&apos;re bringing your focus flights into your pocket. Lock distractions on your phone, track air miles on the go, and fly with co-pilots anywhere in the world.
        </p>

        {/* Live Registrations Counter */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-xs font-mono">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-block size-6 rounded-full bg-amber-500/30 border border-amber-400/50 text-center leading-5 text-[10px]">✈️</span>
            <span className="inline-block size-6 rounded-full bg-electric-500/30 border border-electric-400/50 text-center leading-5 text-[10px]">👨‍✈️</span>
            <span className="inline-block size-6 rounded-full bg-purple-500/30 border border-purple-400/50 text-center leading-5 text-[10px]">👩‍✈️</span>
          </div>
          <span className="text-white/80">
            <strong className="text-amber-400 text-sm font-sans font-bold">{count}+</strong> Pilots registered on the flight manifest
          </span>
        </div>
      </div>

      {/* Main Waitlist Card & Screenshot Preview */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Waitlist Signup Form Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#0d1426]/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Compass className="size-36 text-electric-400" />
          </div>

          <h3 className="text-xl font-display font-bold text-white mb-2 flex items-center gap-2">
            <span>🎟️</span> Claim Early Boarding Pass
          </h3>
          <p className="text-xs text-white/50 mb-6">
            Get instant notification when Beta builds launch on Apple TestFlight & Google Play.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || "Pilot"}
                  className="size-14 mx-auto rounded-full border-2 border-emerald-400/60 shadow-lg"
                />
              ) : (
                <div className="size-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                  ✈️
                </div>
              )}
              <h4 className="text-base font-display font-bold text-emerald-400">
                {name ? `Welcome Aboard, Captain ${name}!` : "You're On The Manifest!"}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Position <strong className="text-white">#{position || count}</strong> reserved for early departure. We will mail you at <strong className="text-electric-300">{email}</strong> as soon as the app drops.
              </p>
              <div className="pt-2 text-[11px] text-white/40 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>Founder Pilot Wings & 500 Welcome Coins Locked In</span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Device Preference Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Device Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform("ios")}
                    className={`rounded-xl border py-2 px-2 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      platform === "ios"
                        ? "border-electric-400 bg-electric-500/20 text-electric-300 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <Apple className="size-3.5" />
                    <span>iOS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform("android")}
                    className={`rounded-xl border py-2 px-2 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      platform === "android"
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <Smartphone className="size-3.5" />
                    <span>Android</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform("all")}
                    className={`rounded-xl border py-2 px-2 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                      platform === "all"
                        ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    <span>Both</span>
                  </button>
                </div>
              </div>

              {/* 1-Click Continue with Google Button */}
              <Button
                type="button"
                variant="ghost"
                loading={googleLoading}
                onClick={handleGoogleWaitlist}
                className="w-full bg-white text-navy-950 hover:bg-white/90 font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </Button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-mono">or email</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Manual Email Form */}
              <form onSubmit={handleJoinWaitlist} className="space-y-3">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30"
                  />
                </div>

                {error && (
                  <p className="text-xs text-rose-400 font-medium">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-electric-500 to-indigo-600 hover:from-electric-400 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-electric-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="size-3.5" />
                  <span>Join Priority Waitlist</span>
                </Button>
              </form>

              <div className="pt-2 text-[10px] text-white/40 flex items-center justify-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>Zero spam. Only 1 notification when the flight gates open.</span>
              </div>
            </div>
          )}

          {/* Perks list */}
          <div className="mt-6 pt-6 border-t border-white/5 space-y-2.5 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">✨</span>
              <span><strong>500 Bonus Focus Coins</strong> on day 1 activation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-electric-400">🏅</span>
              <span><strong>&quot;Founder Pilot&quot;</strong> Call-Sign badge for early waitlisters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">🎟️</span>
              <span>Exclusive access to the First-Class annual discount</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: App UI Showcase & Smartphone Mockup Frames */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Screen Mockup 1: In-Flight Cockpit Deck */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-md relative overflow-hidden group hover:border-electric-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-xs text-white/40 mb-3 font-mono">
                <span className="flex items-center gap-1 text-electric-400">
                  <span className="size-1.5 rounded-full bg-electric-400 animate-pulse" />
                  COCKPIT HUD
                </span>
                <span>iOS / Android</span>
              </div>

              {/* Smartphone Frame Look */}
              <div className="rounded-2xl border border-white/10 bg-navy-950 p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-white">SFO ➔ NRT</div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">CRUISING</span>
                </div>
                <div className="py-2 text-center">
                  <span className="text-3xl font-display font-black text-amber-400 tracking-wider">01:45:20</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Study Altimeter: 38,000 FT</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-electric-500 to-amber-400 h-full w-[65%]" />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 pt-1 font-mono">
                  <span>Engine: 200 Coins/hr</span>
                  <span>Distractions: 0</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-white/80">Flight Deck Focus Timer</p>
              <p className="text-[11px] text-white/40">Immersive altimeters, real-time cabin audio & lock-in mode.</p>
            </div>

            {/* Phone Screen Mockup 2: Radar Navigation */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="flex items-center justify-between text-xs text-white/40 mb-3 font-mono">
                <span className="flex items-center gap-1 text-amber-400">
                  <MapPin className="size-3" />
                  RADAR MAP
                </span>
                <span>TELEMETRY</span>
              </div>

              {/* Smartphone Frame Look */}
              <div className="rounded-2xl border border-white/10 bg-navy-950 p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-white">Global Territory</div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">14 VISITED</span>
                </div>
                <div className="h-20 rounded-xl bg-gradient-to-br from-navy-900 to-[#0c1833] border border-white/5 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                  <div className="relative text-center">
                    <span className="text-xl">🗺️</span>
                    <p className="text-[10px] text-electric-300 font-mono font-bold mt-1">LHR ✈️ HND [9h 30m]</p>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>Current Air Miles: 18,420</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-white/80">Live Pocket Radar Navigation</p>
              <p className="text-[11px] text-white/40">Pin unlocked world airports and track real flight paths.</p>
            </div>
          </div>

          {/* Bottom Banner: App Store Badges Preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-xs font-semibold text-white">Public UI Screenshots Coming Soon</p>
                <p className="text-[11px] text-white/40">Real app store test builds rolling out to the first 250 waitlisted pilots.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white/10 text-[10px] font-mono text-white/70 border border-white/10">
                 iOS App Store
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/10 text-[10px] font-mono text-white/70 border border-white/10">
                ▶ Google Play
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Community Pricing Survey */}
      <PricingSurveySection userEmail={email} />
    </section>
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
