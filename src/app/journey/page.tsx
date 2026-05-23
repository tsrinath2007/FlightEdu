"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { PlaceSearch } from "@/components/journey/PlaceSearch";
import { calcTravelOptions, calcArrivalTime } from "@/lib/travel";
import { getTransportEmoji, getTransportLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PlaceResult } from "@/app/api/places/search/route";
import type { TravelOption } from "@/types";

type SessionMode = "CHILL" | "HARDCORE";

export default function JourneyPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState<PlaceResult | null>(null);
  const [destination, setDestination] = useState<PlaceResult | null>(null);
  const [options, setOptions] = useState<TravelOption[]>([]);
  const [selected, setSelected] = useState<TravelOption | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>("CHILL");
  const [isPrivate, setIsPrivate] = useState(false);
  const [userCoins, setUserCoins] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<"pick" | "mode">("pick");
  const [errorText, setErrorText] = useState<string | null>(null);

  // Fetch fresh coins from backend on mount
  useEffect(() => {
    fetch("/api/user/onboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("fail");
      })
      .then((data) => {
        if (data.user && typeof data.user.coins === "number") {
          setUserCoins(data.user.coins);
        }
      })
      .catch(() => {
        // Fallback to local storage if API fails or offline
        const cached = localStorage.getItem("flightedu_onboarding");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (typeof parsed.coins === "number") {
              setUserCoins(parsed.coins);
            }
          } catch {}
        }
      });
  }, []);

  function handleOrigin(place: PlaceResult) {
    setOrigin(place);
    setOptions([]);
    setSelected(null);
    if (destination) computeOptions(place, destination);
  }

  function handleDestination(place: PlaceResult) {
    setDestination(place);
    setOptions([]);
    setSelected(null);
    if (origin) computeOptions(origin, place);
  }

  function computeOptions(from: PlaceResult, to: PlaceResult) {
    const opts = calcTravelOptions(from.lat, from.lng, to.lat, to.lng);
    setOptions(opts);
    setStep("pick");
  }

  function handleSelectOption(opt: TravelOption) {
    setSelected(opt);
    setStep("mode");
  }

  async function handleCreate() {
    if (!origin || !destination || !selected) return;

    const cannotAfford = isPrivate && userCoins !== null && userCoins < 300;
    if (cannotAfford) {
      setErrorText(`Insufficient coins: You need at least 300 focus coins to charter a private flight.`);
      return;
    }

    setCreating(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin.name,
          originCode: origin.iata ?? origin.id,
          destination: destination.name,
          destinationCode: destination.iata ?? destination.id,
          transportMode: selected.mode,
          duration: selected.duration,
          mode: sessionMode,
          isPrivate: isPrivate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json() as { error?: string };
        throw new Error(errData.error || "Server responded with error status");
      }

      const data = await res.json() as { session: { id: string } };

      // Deduct coins locally in cache for instant updates
      if (isPrivate && userCoins !== null) {
        const cached = localStorage.getItem("flightedu_onboarding");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.coins = Math.max(0, userCoins - 300);
            localStorage.setItem("flightedu_onboarding", JSON.stringify(parsed));
          } catch {}
        }
      }

      router.push(`/session/${data.session.id}/boarding`);
    } catch (err: any) {
      console.warn("⚠️ Database connection issues detected, launching Client-Side Offline Takeoff:", err);
      
      // Generate a highly stable client-side mock session
      const mockSessionId = `mock-${Math.random().toString(36).substring(2, 11)}`;
      const mockSession = {
        id: mockSessionId,
        origin: origin.name,
        originCode: origin.iata ?? origin.id,
        destination: destination.name,
        destinationCode: destination.iata ?? destination.id,
        transportMode: selected.mode,
        duration: selected.duration,
        mode: sessionMode,
        isPrivate: isPrivate,
        createdAt: new Date().toISOString(),
      };
      
      // Persist in localStorage so subsequent offline pages can render it
      localStorage.setItem(`flight_session_${mockSessionId}`, JSON.stringify(mockSession));
      
      // Clear for instant takeoff!
      router.push(`/session/${mockSessionId}/boarding`);
    }
  }

  const cannotAffordPrivate = isPrivate && userCoins !== null && userCoins < 300;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0f1e] text-white">
      {/* Globe Background overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0d1a35] to-[#0a1628]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 size-[110vw] max-w-3xl rounded-full opacity-60"
          style={{
            background: "radial-gradient(ellipse at 35% 35%, #1e4d8c 0%, #0e2d5e 40%, #071428 75%, #040b1a 100%)",
            boxShadow: "0 0 80px 20px rgba(14,80,180,0.12)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 36px,rgba(100,180,255,0.12) 36px,rgba(100,180,255,0.12) 37px),repeating-linear-gradient(90deg,transparent,transparent 36px,rgba(100,180,255,0.12) 36px,rgba(100,180,255,0.12) 37px)" }}
          />
        </motion.div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-5 pt-5 pb-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-xl p-2 text-white/50 hover:bg-white/8 hover:text-white transition"
        >
          ←
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-white">Plan your journey</h1>
          <p className="text-xs text-white/40">Real distance = your study time</p>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-2 space-y-4">

        {/* Search panel */}
        <div className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur-xl p-5 space-y-4">
          <PlaceSearch
            label="From"
            placeholder="Origin city or airport (e.g. DXB)"
            value={origin ? (origin.iata ? `${origin.name} (${origin.iata})` : origin.name) : ""}
            onSelect={handleOrigin}
          />
          <div className="flex justify-center">
            <button
              onClick={() => {
                const tmp = origin;
                setOrigin(destination);
                setDestination(tmp);
                if (origin && destination) computeOptions(destination, origin);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50 hover:bg-white/10 hover:text-white transition"
            >
              ↑↓ swap
            </button>
          </div>
          <PlaceSearch
            label="To"
            placeholder="Destination city or airport (e.g. HYD)"
            value={destination ? (destination.iata ? `${destination.name} (${destination.iata})` : destination.name) : ""}
            onSelect={handleDestination}
          />
        </div>

        {/* Transport options */}
        <AnimatePresence>
          {options.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-white/30 px-1">
                Choose transport
              </p>
              {options.map((opt) => {
                const isSelected = selected?.mode === opt.mode;
                const isDisabled = opt.mode === "TRAIN" || opt.mode === "CAR";
                return (
                  <div key={opt.mode} className="relative">
                    <motion.button
                      whileTap={isDisabled ? {} : { scale: 0.98 }}
                      onClick={() => !isDisabled && handleSelectOption(opt)}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all ${
                        isDisabled
                          ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                          : isSelected
                          ? "border-electric-500/60 bg-electric-500/10 shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                          : "border-white/8 bg-white/5 hover:border-white/16 hover:bg-white/8"
                      }`}
                    >
                      <span className="text-2xl">{getTransportEmoji(opt.mode)}</span>
                      <div className="flex-1">
                        <p className={`font-display font-semibold ${isDisabled ? "text-white/40" : "text-white"}`}>{getTransportLabel(opt.mode)}</p>
                        <p className="text-xs text-white/30">{opt.distanceText}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-lg font-bold ${isDisabled ? "text-white/30" : isSelected ? "text-electric-400" : "text-white"}`}>
                          {opt.durationText}
                        </p>
                        {isSelected && !isDisabled && (
                          <p className="text-xs text-white/40">
                            ~{calcArrivalTime(opt.duration)}
                          </p>
                        )}
                      </div>
                      {isSelected && !isDisabled && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-electric-500 flex-shrink-0">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </motion.button>
                    {isDisabled && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                        <span>🚧</span> Under development
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flight mode and Privacy selection */}
        <AnimatePresence>
          {step === "mode" && selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Flight Mode */}
              <div className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                  Flight mode
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["CHILL", "HARDCORE"] as SessionMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSessionMode(m)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        sessionMode === m
                          ? m === "HARDCORE"
                            ? "border-coral-500/50 bg-coral-500/10"
                            : "border-neon-500/50 bg-neon-500/10"
                          : "border-white/8 bg-white/5 hover:bg-white/8"
                      }`}
                    >
                      <p className="text-xl mb-1">{m === "CHILL" ? "😌" : "😈"}</p>
                      <p className="font-display font-semibold text-white text-sm">
                        {m === "CHILL" ? "Chill" : "Hardcore"}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {m === "CHILL" ? "Leave freely, no penalty" : "Leave early = −500 coins all"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy settings */}
              <div className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/30">
                    Flight Privacy
                  </p>
                  {userCoins !== null && (
                    <span className="text-xs text-yellow-400 font-semibold">
                      Balance: 🪙 {userCoins}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsPrivate(false);
                      setErrorText(null);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      !isPrivate
                        ? "border-electric-500/50 bg-electric-500/10 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
                        : "border-white/8 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <p className="text-xl mb-1">🌍</p>
                    <p className="font-display font-semibold text-white text-sm">
                      Public Flight
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Free takeoff. Anyone can join from the radar lobby.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setIsPrivate(true);
                      if (userCoins !== null && userCoins < 300) {
                        setErrorText(`Insufficient coins: You need at least 300 focus coins to book a private flight (Current Balance: 🪙 ${userCoins}).`);
                      } else {
                        setErrorText(null);
                      }
                    }}
                    className={`relative rounded-2xl border p-4 text-left transition-all ${
                      isPrivate
                        ? cannotAffordPrivate
                          ? "border-red-500/50 bg-red-500/10"
                          : "border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                        : "border-white/8 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <p className="text-xl mb-1">🔒</p>
                    <p className="font-display font-semibold text-white text-sm flex items-center gap-1.5">
                      Private Charter
                    </p>
                    <p className="text-[10px] text-yellow-400 font-bold uppercase mt-0.5">
                      Costs 🪙 300
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">
                      Invite code only. Perfect for studying with selected wingmen.
                    </p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary + Board button */}
        <AnimatePresence>
          {step === "mode" && selected && origin && destination && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-electric-500/20 bg-gradient-to-br from-electric-500/10 to-neon-500/5 p-5 space-y-4"
            >
              {/* Route summary */}
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-white">
                    {origin.iata ?? origin.name.slice(0, 3).toUpperCase()}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{origin.name}</p>
                </div>
                <div className="flex flex-col items-center flex-1 mx-4 gap-1">
                  <span className="text-xl">{getTransportEmoji(selected.mode)}</span>
                  <div className="flex items-center gap-2 w-full">
                    <div className="h-px flex-1 bg-white/20" />
                    <span className="text-xs font-bold text-electric-400">{selected.durationText}</span>
                    <div className="h-px flex-1 bg-white/20" />
                  </div>
                  <p className="text-xs text-white/30">~{calcArrivalTime(selected.duration)}</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-white">
                    {destination.iata ?? destination.name.slice(0, 3).toUpperCase()}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">{destination.name}</p>
                </div>
              </div>

              {/* Error box */}
              {errorText && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 leading-relaxed"
                >
                  ⚡ {errorText}
                </motion.div>
              )}

              <Button
                size="lg"
                className="w-full"
                loading={creating}
                disabled={cannotAffordPrivate}
                onClick={handleCreate}
              >
                {cannotAffordPrivate
                  ? "🔒 Insufficient Charter Coins"
                  : isPrivate
                  ? "💸 Charter Private · 🪙 300 coins"
                  : `${sessionMode === "CHILL" ? "😌" : "😈"} Board · ${selected.durationText} session ✈️`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
