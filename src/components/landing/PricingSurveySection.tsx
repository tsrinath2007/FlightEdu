"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Share2, Sparkles, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingSurveySectionProps {
  userEmail?: string;
}

const PLAN_OPTIONS = [
  {
    id: "1_month",
    label: "1 Month",
    tagline: "Short-Haul Sprint",
    prices: [70, 80, 90],
    defaultPrice: 80,
    perPeriod: "/ month",
  },
  {
    id: "6_months",
    label: "6 Months",
    tagline: "Semester Flight Pass",
    prices: [300, 400, 500],
    defaultPrice: 400,
    perPeriod: "for 6 months",
  },
  {
    id: "1_year",
    label: "1 Year",
    tagline: "Captain's Annual Pass",
    prices: [700, 800, 900, 1000],
    defaultPrice: 800,
    perPeriod: "for 1 year",
  },
];

export default function PricingSurveySection({ userEmail }: PricingSurveySectionProps) {
  const [selectedDuration, setSelectedDuration] = useState<"1_month" | "6_months" | "1_year">("1_month");
  const [selectedPrice, setSelectedPrice] = useState<number>(80);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePlan = PLAN_OPTIONS.find((p) => p.id === selectedDuration)!;

  function handleSelectDuration(dur: "1_month" | "6_months" | "1_year") {
    setSelectedDuration(dur);
    const plan = PLAN_OPTIONS.find((p) => p.id === dur)!;
    setSelectedPrice(plan.defaultPrice);
  }

  async function handleVote() {
    setLoading(true);
    try {
      await fetch("/api/waitlist/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: selectedDuration,
          price: selectedPrice,
          email: userEmail || undefined,
        }),
      });
      setVoted(true);
    } catch (e) {
      // vote silently recorded or proceed
      setVoted(true);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyShareLink() {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://gofocusgen.vercel.app";
    const shareUrl = `${origin}/app#waitlist`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  function handleWhatsAppShare() {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://gofocusgen.vercel.app";
    const shareUrl = `${origin}/app#waitlist`;
    const message = encodeURIComponent(`Hey! Check out GoFocusGen — study sessions turned into real flight journeys! Vote in their student pricing poll and join the mobile app waitlist here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  }

  return (
    <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0d1426]/90 to-[#070b18]/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Glow accent */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[150px] bg-amber-500/10 blur-[80px]" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono uppercase tracking-widest text-amber-400 mb-3">
          <Sparkles className="size-3" />
          Student Community Pricing Survey
        </span>

        <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white">
          What is a fair price for <span className="text-gradient-gold">First Class?</span>
        </h3>
        <p className="text-xs md:text-sm text-white/60 mt-1.5">
          Pick your preferred duration and vote on what you&apos;d comfortably pay. We will set the final launch prices directly based on your responses!
        </p>

        {/* Plan Duration Selector (1 Month | 6 Months | 1 Year) */}
        <div className="mt-6 inline-flex rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
          {PLAN_OPTIONS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelectDuration(plan.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedDuration === plan.id
                  ? "bg-amber-400 text-navy-950 shadow-md font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-[11px] font-mono text-amber-300/80 mt-2">
          {activePlan.tagline}
        </p>

        {/* Scrollable Price Options Carousel */}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {activePlan.prices.map((p) => {
            const isSelected = selectedPrice === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPrice(p)}
                className={`relative px-6 py-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left min-w-[110px] ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/20 text-white shadow-[0_0_20px_rgba(251,191,36,0.25)] scale-105"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2 -right-1 size-5 rounded-full bg-amber-400 text-navy-950 flex items-center justify-center text-[10px] font-bold shadow">
                    ✓
                  </span>
                )}
                <div className="text-2xl font-display font-black text-white">
                  ₹{p}
                </div>
                <div className="text-[10px] text-white/50 font-mono mt-0.5">
                  {activePlan.perPeriod}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cast Vote Button */}
        <div className="mt-6">
          {voted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-5 py-2.5 text-xs font-semibold text-emerald-300"
            >
              <Check className="size-4 text-emerald-400" />
              <span>Vote submitted for ₹{selectedPrice} ({activePlan.label})! Thank you!</span>
            </motion.div>
          ) : (
            <Button
              onClick={handleVote}
              loading={loading}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-navy-950 font-bold px-8 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              Cast My Vote for ₹{selectedPrice} 🗳️
            </Button>
          )}
        </div>

        {/* Friendly Developer Note */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
          <div className="flex items-start gap-3">
            <span className="text-xl">💬</span>
            <div className="text-xs leading-relaxed text-white/80">
              <strong className="text-amber-300 block mb-0.5 font-sans font-semibold">
                A quick note from the developer:
              </strong>
              <p className="text-white/70 text-[11px]">
                &quot;Devs also need to live, eat, and pay for the AI Co-Pilot & flight cloud servers! 🙏 This is a real community survey to set honest, student-budget-friendly pricing before our public app release. Please vote and share this with your fellow study partners!&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Share Section: Generates Direct Waitlist Link */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-semibold text-white">Help shape GoFocusGen</p>
            <p className="text-[11px] text-white/40">Share this survey & waitlist pass with your study circle.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={handleCopyShareLink}
              className="flex-1 sm:flex-none border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied! 📋</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-white/70" />
                  <span>Copy Waitlist Link</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleWhatsAppShare}
              className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs py-2 px-3.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="size-3.5" />
              <span>Share WhatsApp</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
