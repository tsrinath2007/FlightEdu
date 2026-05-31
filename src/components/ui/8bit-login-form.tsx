"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// --- Retro CSS & Font Injection Helper ---
const injectRetroStyles = () => {
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

  // Inject 8bit retro style sheet with the embedded base64 retro game font!
  if (!document.getElementById("__8bit_retro_css__")) {
    const s = document.createElement("style");
    s.id = "__8bit_retro_css__";
    s.textContent = `
      @font-face {
        font-family: "Press Start 2P";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url("data:font/woff2;base64,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") format("woff2");
      }
      .retro {
        font-family: "Press Start 2P", system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        letter-spacing: 0.5px;
      }
      .pixelated {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      html.light, html:not(.dark) {
        --background: oklch(0.145 0 0);
        --foreground: oklch(0.985 0 0);
        --card: oklch(0.205 0 0);
        --card-foreground: oklch(0.985 0 0);
        --muted-foreground: oklch(0.708 0 0);
        --border: oklch(0.985 0 0);
        --ring: oklch(0.556 0 0);
        color-scheme: dark;
      }
    `;
    document.head.appendChild(s);
  }
};

// --- CUSTOM 8-BIT RETRO DESIGN COMPONENTS ---

export function Button2({
  children,
  className,
  variant = "default",
  size = "default",
  font = "retro",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  font?: "normal" | "retro";
}) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-none font-bold text-center active:translate-y-0.5 transition-all relative inline-flex items-center justify-center gap-1.5 border-none cursor-pointer outline-none select-none select-none",
        size === "default" && "h-11 px-5 py-3 text-[10px]",
        size === "sm" && "h-8 px-3 text-[8px]",
        size === "lg" && "h-12 px-6 text-[12px]",
        size === "icon" && "size-9 mx-1 text-[10px]",
        font === "retro" && "retro tracking-wider",
        variant === "default" && "bg-white text-black hover:bg-white/90",
        variant === "outline" && "border border-white bg-transparent text-white hover:bg-white/10",
        variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
        variant === "link" && "bg-transparent text-electric-400 underline underline-offset-4 hover:text-electric-300",
        className
      )}
    >
      <span className="relative inline-flex items-center justify-center gap-1.5 w-full h-full">
        {children}

        {variant !== "ghost" && variant !== "link" && size !== "icon" && (
          <>
            {/* Pixelated borders */}
            <div className="absolute -top-1 w-[calc(100%-8px)] left-1 h-1 bg-inherit dark:bg-white" />
            <div className="absolute -bottom-1 w-[calc(100%-8px)] left-1 h-1 bg-inherit dark:bg-white" />
            <div className="absolute top-0 left-0 size-1 bg-inherit dark:bg-white" />
            <div className="absolute top-0 right-0 size-1 bg-inherit dark:bg-white" />
            <div className="absolute bottom-0 left-0 size-1 bg-inherit dark:bg-white" />
            <div className="absolute bottom-0 right-0 size-1 bg-inherit dark:bg-white" />
            <div className="absolute top-1 -left-1 h-[calc(100%-8px)] w-1 bg-inherit dark:bg-white" />
            <div className="absolute top-1 -right-1 h-[calc(100%-8px)] w-1 bg-inherit dark:bg-white" />
            
            {variant !== "outline" && (
              <>
                {/* Internal button shadow layers */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/25 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-black/25 pointer-events-none" />
              </>
            )}
          </>
        )}
      </span>
    </button>
  );
}

export function Card2({ className, font = "retro", ...props }: React.HTMLAttributes<HTMLDivElement> & { font?: "normal" | "retro" }) {
  return (
    <div
      className={cn(
        "relative bg-navy-950/80 border-y-4 border-white p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-5",
        font === "retro" && "retro",
        className
      )}
      {...props}
    >
      {props.children}
      {/* Dynamic Pixelated vertical borders */}
      <div className="absolute inset-y-0 border-x-4 -mx-1 border-white pointer-events-none" aria-hidden="true" />
    </div>
  );
}

export function Input2({ className, font = "retro", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { font?: "normal" | "retro" }) {
  return (
    <div className={cn("relative border-y-4 border-white/60 focus-within:border-white p-0 flex items-center bg-black/40")}>
      <input
        {...props}
        className={cn(
          "w-full bg-transparent px-4 py-3 text-[10px] text-white placeholder-white/20 outline-none border-none ring-0 focus:ring-0",
          font === "retro" && "retro tracking-wide",
          className
        )}
      />
      {/* Side pixel caps */}
      <div className="absolute inset-y-0 border-x-4 -mx-1 border-white/60 focus-within:border-white pointer-events-none" aria-hidden="true" />
    </div>
  );
}

export function Label4({ className, font = "retro", ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { font?: "normal" | "retro" }) {
  return (
    <label
      className={cn(
        "text-[9px] font-bold text-white/70 tracking-wider select-none",
        font === "retro" && "retro block",
        className
      )}
      {...props}
    />
  );
}

// --- MAIN LOGIN FORM COMPONENT ---

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
    injectRetroStyles();
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
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto retro select-none">
      <Card2>
        <div className="space-y-2 text-center pb-4 border-b-4 border-dashed border-white/10">
          <h2 className="text-xl font-extrabold text-white tracking-widest uppercase">Login</h2>
          <p className="text-[7.5px] text-white/40 leading-relaxed uppercase">
            Enter transponder email keys to access your cockpit base
          </p>
        </div>

        {magicSent ? (
          <div className="text-center space-y-4 py-4 animate-pulse">
            <div className="text-4xl">✉️</div>
            <h3 className="text-xs font-bold text-white uppercase">Check Inbox</h3>
            <p className="text-[8px] text-white/50 leading-relaxed uppercase">
              Transponder login link transmitted successfully to <span className="text-white font-bold">{email}</span>
            </p>
            <Button2
              variant="link"
              onClick={() => setMagicSent(false)}
              className="text-[9px] mt-2 block mx-auto uppercase"
            >
              Change Email Address
            </Button2>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label4 htmlFor="email">Email</Label4>
              <Input2
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
              />
            </div>

            {mode === "password" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label4 htmlFor="password">Password</Label4>
                  <a
                    href="#"
                    onClick={() => alert("Autopilot Override: Please use Magic Link login to recover your account!")}
                    className="text-[7px] text-white/40 hover:text-white/70 underline underline-offset-2 uppercase"
                  >
                    Forgot?
                  </a>
                </div>
                <Input2
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500/30 p-3 rounded-none text-[7px] text-red-400 leading-relaxed uppercase">
                ⚠️ turbulence: {error}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button2 type="submit" className="w-full bg-white text-black hover:bg-white/90">
                {loading ? "PROCESSING..." : mode === "magic" ? "TRANSMIT LINK" : "ENGAGE LOGIN"}
              </Button2>

              <Button2
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                {googleLoading ? "PROCESSING..." : "LOGIN WITH GOOGLE"}
              </Button2>
            </div>

            <div className="space-y-3 border-t-4 border-dashed border-white/10 pt-4 text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(""); }}
                className="text-[7px] text-electric-400 hover:text-electric-300 transition uppercase block w-full outline-none"
              >
                {mode === "magic" ? "Use password access" : "Use magic transponder link"}
              </button>

              <p className="text-[7.5px] text-white/40 uppercase">
                No cadet profile?{" "}
                <Link href="/register" className="text-electric-400 hover:text-electric-300 underline underline-offset-2 font-bold ml-1">
                  Join Academy
                </Link>
              </p>
            </div>
          </form>
        )}
      </Card2>
    </div>
  );
}
