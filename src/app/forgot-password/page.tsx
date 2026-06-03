"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/brand/Logo";

// --- Retro Font Injection Helper ---
const injectRetroFont = () => {
  if (typeof document === "undefined") return;
  if (!document.getElementById("__8bit_retro_font_css__")) {
    const s = document.createElement("style");
    s.id = "__8bit_retro_font_css__";
    s.textContent = `
      @import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
      .retro-theme {
        font-family: "Press Start 2P", system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        letter-spacing: 0.2px;
      }
      .retro-theme input::placeholder {
        color: #52525b !important;
      }
    `;
    document.head.appendChild(s);
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    injectRetroFont();
  }, []);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (!supabase) {
      setError("Database connection offline.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 select-none">
      {/* Background Starfield */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900/30 via-navy-950 to-black z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-40 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6"
      >
        <Link href="/" className="mb-2 block transition-all hover:scale-105 hover:filter hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
          <Logo layout="vertical" size="lg" />
        </Link>

        <div className="w-full retro-theme px-4">
          <div className="bg-[#141414] border-2 border-[#2d2d30] rounded-3xl p-8 shadow-2xl flex flex-col gap-6 w-full">
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white tracking-wider text-left uppercase">Recovery</h2>
              <p className="text-[7.5px] text-[#86868d] leading-relaxed text-left uppercase">
                {success ? "Instructions Transmitted" : "Transmit transponder key to reset password"}
              </p>
            </div>

            {success ? (
              <div className="text-center space-y-5 py-4 animate-pulse">
                <div className="text-4xl">✉️</div>
                <h3 className="text-[9px] font-bold text-white uppercase">Link Transmitted</h3>
                <p className="text-[8px] text-[#86868d] leading-relaxed uppercase">
                  Check <span className="text-white font-bold">{email}</span> to reset your cockpit access credentials.
                </p>
                <Link
                  href="/login"
                  className="text-[8px] text-sky-400 hover:text-sky-300 underline underline-offset-4 uppercase block"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-[8px] font-bold text-white block text-left uppercase">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1c1c1e] border border-[#2d2d30] focus:border-zinc-500 rounded-xl px-4 py-3.5 text-[8px] text-white outline-none font-mono transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 text-[7.5px] text-red-400 leading-normal uppercase">
                    ⚠️ warning: {error}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#e4e4e7] hover:bg-[#d4d4d8] text-black font-bold text-[8px] uppercase rounded-full shadow-md transition-all tracking-wider text-center cursor-pointer border-none outline-none select-none active:translate-y-[1px]"
                  >
                    {loading ? "Transmitting..." : "Reset Password"}
                  </button>
                  <Link
                    href="/login"
                    className="text-[8px] text-center text-[#86868d] hover:text-white transition-colors uppercase block w-full outline-none"
                  >
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
