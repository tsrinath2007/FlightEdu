"use client";

export const dynamic = "force-dynamic";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import LoginForm from "@/components/ui/8bit-login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 select-none">
      {/* Dynamic Starfield & Nebula Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900/30 via-navy-950 to-black z-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:32px_32px] opacity-40 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Retro Logo Link */}
        <Link href="/" className="mb-2 block transition-all hover:scale-105 hover:filter hover:drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
          <Logo layout="vertical" size="lg" />
        </Link>

        {/* 8-bit LoginForm wrapper */}
        <LoginForm />
      </motion.div>
    </main>
  );
}
