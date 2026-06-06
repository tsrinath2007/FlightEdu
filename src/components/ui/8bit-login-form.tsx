"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// --- Retro Font Injection Helper ---
const injectRetroFont = () => {
  if (typeof document === "undefined") return;
  
  // Force dark mode
  try {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("vite-ui-theme", "dark");
  } catch (e) {}
  
  const __forceDark = () => {
    const de = document.documentElement;
    de.classList.remove("light");
    de.classList.add("dark");
    de.style.colorScheme = "dark";
  };
  __forceDark();
  
  let __n = 0;
  const __iv = setInterval(() => {
    __forceDark();
    if (++__n >= 30) clearInterval(__iv);
  }, 100);
  
  try {
    new MutationObserver(() => {
      if (!document.documentElement.classList.contains("dark")) __forceDark();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  } catch (e) {}

  // Inject Google Press Start 2P font stylesheet
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

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("password");

  useEffect(() => {
    injectRetroFont();
    
    // Check for query parameters for errors
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get("error");
      if (urlError) {
        // Humanize common errors
        if (urlError === "otp_expired" || urlError.toLowerCase().includes("expired") || urlError.toLowerCase().includes("invalid")) {
          setError("Email link is invalid or has expired. Please request a new link.");
        } else {
          setError(urlError);
        }
      }
    }
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setMagicSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto retro-theme select-none px-4">
      {/* Outer Card Container */}
      <div className="bg-[#141414] border-2 border-[#2d2d30] rounded-3xl p-8 shadow-2xl flex flex-col gap-6 w-full">
        
        {/* Header Block */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-wider text-left">Login</h2>
          <p className="text-[9px] text-[#86868d] leading-relaxed text-left uppercase">
            {magicSent ? "Transponder link transmitted to inbox" : "Enter your email below to login to your account"}
          </p>
        </div>

        {magicSent ? (
          <div className="text-center space-y-5 py-4 animate-pulse">
            <div className="text-4xl">✉️</div>
            <h3 className="text-[10px] font-bold text-white uppercase">Check Inbox</h3>
            <p className="text-[8px] text-[#86868d] leading-relaxed uppercase">
              Cockpit access keys transmitted to <span className="text-white font-bold">{email}</span>
            </p>
            <button
              onClick={() => setMagicSent(false)}
              className="text-[9px] text-white underline underline-offset-4 hover:text-[#e4e4e7] uppercase bg-transparent border-none cursor-pointer outline-none"
              type="button"
            >
              Change Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="text-[9px] font-bold text-white block text-left uppercase">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="w-full bg-[#1c1c1e] border border-[#2d2d30] focus:border-zinc-500 rounded-xl px-4 py-3.5 text-[9px] text-white outline-none font-mono transition-colors"
              />
            </div>

            {/* Password Field */}
            {mode === "password" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[9px] font-bold text-white uppercase block">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[9px] text-[#86868d] hover:text-white underline underline-offset-2 uppercase transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1e] border border-[#2d2d30] focus:border-zinc-500 rounded-xl px-4 py-3.5 text-[9px] text-white outline-none font-mono transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 text-[7.5px] text-red-400 leading-normal uppercase">
                ⚠️ turbulence: {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#e4e4e7] hover:bg-[#d4d4d8] text-black font-bold text-[9px] uppercase rounded-full shadow-md transition-all tracking-wider text-center cursor-pointer border-none outline-none select-none active:translate-y-[1px]"
              >
                {loading ? "Processing..." : mode === "magic" ? "Transmit Link" : "Login"}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-4 bg-transparent hover:bg-white/5 text-white border border-[#2d2d30] hover:border-zinc-500 font-bold text-[9px] uppercase rounded-full transition-all tracking-wider text-center cursor-pointer outline-none select-none active:translate-y-[1px]"
              >
                {googleLoading ? "Processing..." : "Login with Google"}
              </button>
            </div>

            {/* Redirection Links */}
            <div className="space-y-4 border-t border-dashed border-[#2d2d30] pt-4 text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(""); }}
                className="text-[8px] text-sky-400 hover:text-sky-300 transition-colors uppercase block w-full outline-none bg-transparent border-none cursor-pointer"
              >
                {mode === "magic" ? "Use password access" : "Use magic transponder link"}
              </button>

              <p className="text-[9px] text-[#86868d] uppercase">
                Don't have an account?{" "}
                <Link href="/register" className="text-white hover:text-[#e4e4e7] underline underline-offset-4 font-bold ml-1 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
