"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Session Error Boundary]", error?.message, error?.digest);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050a17] text-white px-4">
      {/* Subtle background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-white/4 border border-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="size-8 text-red-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-['Space_Grotesk',system-ui,sans-serif] text-2xl font-bold tracking-tight text-white">
            Cockpit Systems Fault
          </h1>
          <p className="text-sm text-white/60 font-mono">
            An unexpected error interrupted your flight session. Your progress is safe.
          </p>
        </div>

        <div className="h-px bg-white/10" />

        {error?.message && (
          <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-4">
            <p className="text-xs font-mono text-red-400/80 text-left break-words">
              {error.message.slice(0, 200)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0ea5e9] hover:bg-[#38bdf8] active:scale-[0.98] font-bold text-sm tracking-wider transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)] cursor-pointer"
          >
            <RotateCcw className="size-4" />
            Restart Cockpit Systems
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/6 hover:bg-white/10 border border-white/10 font-semibold text-sm text-white/70 transition cursor-pointer"
          >
            <Home className="size-4" />
            Return to Flight Command
          </button>
        </div>
      </div>
    </main>
  );
}
