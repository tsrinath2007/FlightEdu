"use client";

import React from "react";
import { motion } from "framer-motion";

export type HairStyle = "spiky" | "bob" | "curls" | "pilot";
export type ClothingStyle = "tanktop" | "hoodie" | "uniform" | "rose_tee";
export type EyesStyle = "glossy" | "visor" | "glasses";
export type ActivityType = "LAPTOP" | "BOOK" | "WRITING" | "CHILL";

interface CadetAvatarProps {
  hairStyle?: HairStyle;
  hairColor?: string; // "black" | "brown" | "blonde" | "purple" | "blue"
  clothing?: ClothingStyle;
  eyesStyle?: EyesStyle;
  activity?: ActivityType;
  isActive?: boolean; // Autopilot focus active vs idle
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const HAIR_COLORS: Record<string, string> = {
  black: "from-neutral-800 to-neutral-950",
  brown: "from-amber-700 to-amber-900",
  blonde: "from-amber-300 to-yellow-500",
  purple: "from-purple-600 to-indigo-850",
  blue: "from-sky-600 to-blue-900",
};

export function CadetAvatar({
  hairStyle = "spiky",
  hairColor = "black",
  clothing = "tanktop",
  eyesStyle = "glossy",
  activity = "LAPTOP",
  isActive = false,
  size = "md",
  className = "",
}: CadetAvatarProps) {
  // Dimensions mapping
  const sizeClasses = {
    sm: "w-20 h-20 text-[6px]",
    md: "w-32 h-32 text-[9px]",
    lg: "w-44 h-44 text-xs",
    xl: "w-56 h-56 text-sm",
  };

  const hairColorGrad = HAIR_COLORS[hairColor] || HAIR_COLORS.black;

  // Eyes blink animation keyframes can be handled by standard tailwind/CSS
  const blinkStyles = `
    @keyframes avatar-blink {
      0%, 90%, 100% { transform: scaleY(1); }
      95% { transform: scaleY(0.1); }
    }
    @keyframes steam-rise {
      0% { transform: translateY(0) scale(0.8); opacity: 0; }
      50% { opacity: 0.5; }
      100% { transform: translateY(-16px) scale(1.2); opacity: 0; }
    }
  `;

  return (
    <div className={`relative flex flex-col items-center justify-end select-none overflow-visible ${sizeClasses[size]} ${className}`}>
      <style>{blinkStyles}</style>

      {/* Breathing container */}
      <motion.div
        animate={{
          y: isActive ? [0, -3, 0] : [0, -1.5, 0],
        }}
        transition={{
          duration: isActive ? 2.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-full h-full flex flex-col items-center justify-end overflow-visible"
      >
        {/* Background Seat/Chair (Only visible for higher dimensions) */}
        {size !== "sm" && (
          <div className="absolute inset-x-4 top-10 bottom-2 bg-gradient-to-b from-navy-900/90 to-navy-950 border border-white/5 rounded-2xl -z-10 shadow-[inset_0_0_12px_rgba(255,255,255,0.03)]" />
        )}

        {/* Torso & Clothing Layer */}
        <div className="relative w-2/3 h-1/3 flex justify-center items-end overflow-visible z-10">
          {/* Base Torso Body */}
          <div className="absolute bottom-0 w-4/5 h-full rounded-t-3xl bg-orange-100 border border-amber-900/10 shadow-[inset_0_-8px_10px_rgba(0,0,0,0.05)] overflow-visible">
            
            {/* Black Tank Top */}
            {clothing === "tanktop" && (
              <div className="absolute inset-x-2 bottom-0 h-4/5 bg-neutral-900 rounded-t-2xl border-t border-white/10 flex justify-center">
                {/* Armhole cutouts */}
                <div className="absolute left-[-2px] top-0 w-2 h-4 bg-orange-100 rounded-r-full" />
                <div className="absolute right-[-2px] top-0 w-2 h-4 bg-orange-100 rounded-l-full" />
                {/* Scoop neck */}
                <div className="absolute top-0 w-2/3 h-2 bg-orange-100 rounded-b-full" />
              </div>
            )}

            {/* Blue Hoodie */}
            {clothing === "hoodie" && (
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-sky-600 to-indigo-800 rounded-t-3xl border border-sky-400/20">
                {/* Hoodie Hood back */}
                <div className="absolute -top-1 inset-x-4 h-3 bg-indigo-900/60 rounded-full border border-sky-500/20" />
                {/* Drawstrings */}
                <div className="absolute left-1/3 top-3 w-0.5 h-6 bg-white/70 rounded-full" />
                <div className="absolute right-1/3 top-3 w-0.5 h-5 bg-white/70 rounded-full" />
              </div>
            )}

            {/* Pilot Uniform */}
            {clothing === "uniform" && (
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl border border-slate-700/30">
                {/* Gold Epaulets on shoulders */}
                <div className="absolute left-0 top-0.5 w-3 h-1 bg-amber-500 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                <div className="absolute right-0 top-0.5 w-3 h-1 bg-amber-500 rounded-full shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                {/* White Shirt Collar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-2.5 bg-white rounded-b-lg border-x border-b border-slate-200" />
                {/* Gold Tie */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-b" />
              </div>
            )}

            {/* Rose Tee */}
            {clothing === "rose_tee" && (
              <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-rose-500 to-rose-700 rounded-t-3xl border border-rose-400/20">
                {/* White crewneck collar strip */}
                <div className="absolute top-0 inset-x-4 h-1.5 bg-rose-200/90 rounded-b-full" />
              </div>
            )}

          </div>
        </div>

        {/* Head Section */}
        <motion.div
          animate={{
            y: activity === "BOOK" || activity === "WRITING" ? (isActive ? 4 : 2) : 0,
            rotate: activity === "WRITING" ? -1.5 : 0,
          }}
          className="relative w-1/2 h-1/2 flex items-center justify-center overflow-visible z-20"
        >
          {/* Base Face structure */}
          <div className="relative w-4/5 h-4/5 bg-orange-100 rounded-full border border-amber-900/10 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.06)] flex flex-col justify-center items-center overflow-visible">
            
            {/* Blushing cheeks */}
            <div className="absolute bottom-1/4 left-1.5 w-3 h-1.5 bg-rose-400/30 rounded-full blur-[0.5px]" />
            <div className="absolute bottom-1/4 right-1.5 w-3 h-1.5 bg-rose-400/30 rounded-full blur-[0.5px]" />

            {/* Nose */}
            <div className="absolute bottom-[35%] w-1.5 h-1.5 bg-amber-900/15 rounded-full" />

            {/* Mouth */}
            <div className="absolute bottom-[20%]">
              {activity === "CHILL" ? (
                <div className="w-1.5 h-1.5 rounded-full border-b-2 border-amber-900/60" /> // Sip puckering
              ) : isActive ? (
                <div className="w-2.5 h-1.5 bg-amber-900/70 rounded-b-full border border-transparent" /> // Focused open mouth/concentration
              ) : (
                <div className="w-3 h-1.5 border-b-2 border-amber-900/60 rounded-full" /> // Simple cozy smile
              )}
            </div>

            {/* Eyes Section */}
            <div className="absolute bottom-[40%] inset-x-2.5 flex justify-between items-center z-10">
              
              {/* Left Eye */}
              <div 
                className="size-4 relative overflow-hidden"
                style={{ animation: "avatar-blink 4.5s infinite" }}
              >
                {eyesStyle === "glossy" && (
                  <div className="absolute inset-0 bg-neutral-900 rounded-full flex justify-start items-start p-0.5">
                    {/* Gloss reflections */}
                    <div className="size-1.5 bg-white rounded-full translate-x-0.5 translate-y-0.5 shadow-md" />
                    <div className="size-0.5 bg-white rounded-full translate-x-1.5 translate-y-1.5 opacity-80" />
                  </div>
                )}
                {eyesStyle === "visor" && (
                  <div className="absolute inset-x-0 inset-y-0.5 bg-cyan-400 rounded border border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                )}
                {eyesStyle === "glasses" && (
                  <div className="absolute inset-0 bg-neutral-900 rounded-full flex justify-start items-start p-0.5 ring-2 ring-amber-500/80 ring-offset-1 ring-offset-orange-100">
                    <div className="size-1.5 bg-white rounded-full translate-x-0.5 translate-y-0.5" />
                  </div>
                )}
              </div>

              {/* Right Eye */}
              <div 
                className="size-4 relative overflow-hidden"
                style={{ animation: "avatar-blink 4.5s infinite" }}
              >
                {eyesStyle === "glossy" && (
                  <div className="absolute inset-0 bg-neutral-900 rounded-full flex justify-start items-start p-0.5">
                    <div className="size-1.5 bg-white rounded-full translate-x-0.5 translate-y-0.5 shadow-md" />
                    <div className="size-0.5 bg-white rounded-full translate-x-1.5 translate-y-1.5 opacity-80" />
                  </div>
                )}
                {eyesStyle === "visor" && (
                  <div className="absolute inset-x-0 inset-y-0.5 bg-cyan-400 rounded border border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
                )}
                {eyesStyle === "glasses" && (
                  <div className="absolute inset-0 bg-neutral-900 rounded-full flex justify-start items-start p-0.5 ring-2 ring-amber-500/80 ring-offset-1 ring-offset-orange-100">
                    <div className="size-1.5 bg-white rounded-full translate-x-0.5 translate-y-0.5" />
                  </div>
                )}
              </div>

            </div>

            {/* Screen Glow Overlay (For Laptop Activity only) */}
            {activity === "LAPTOP" && isActive && (
              <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-[3px] pointer-events-none animate-pulse" />
            )}

            {/* Hair Styles */}
            <div className="absolute inset-0 pointer-events-none z-25 overflow-visible">
              {/* Spiky Black */}
              {hairStyle === "spiky" && (
                <div className="absolute inset-0 overflow-visible">
                  {/* Top Spike crest */}
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-4/5 h-6 bg-gradient-to-b ${hairColorGrad} rounded-t-full rounded-b-xl clip-spikes`} style={{ clipPath: "polygon(0% 100%, 15% 30%, 30% 60%, 50% 0%, 70% 60%, 85% 30%, 100% 100%)" }} />
                  {/* Forehead fringe bangs */}
                  <div className={`absolute -top-1.5 inset-x-2 h-4 bg-gradient-to-b ${hairColorGrad} rounded-b-xl clip-bangs`} style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 70%, 75% 40%, 60% 90%, 50% 50%, 40% 90%, 25% 40%, 10% 70%)" }} />
                  {/* Sideburns */}
                  <div className={`absolute top-2 -left-1 w-2.5 h-6 bg-gradient-to-br ${hairColorGrad} rounded-r-xl`} style={{ clipPath: "polygon(0% 0%, 100% 30%, 50% 100%, 0% 80%)" }} />
                  <div className={`absolute top-2 -right-1 w-2.5 h-6 bg-gradient-to-bl ${hairColorGrad} rounded-l-xl`} style={{ clipPath: "polygon(100% 0%, 0% 30%, 50% 100%, 100% 80%)" }} />
                </div>
              )}

              {/* Bob Cut */}
              {hairStyle === "bob" && (
                <div className="absolute inset-0 overflow-visible">
                  {/* Rounded helmet bob */}
                  <div className={`absolute -top-2.5 -inset-x-1.5 h-5/6 bg-gradient-to-b ${hairColorGrad} rounded-t-[32px] rounded-b-3xl shadow-[0_4px_6px_rgba(0,0,0,0.15)]`} />
                  {/* Direct clean round bangs */}
                  <div className={`absolute -top-0.5 inset-x-2.5 h-4.5 bg-gradient-to-b ${hairColorGrad} rounded-b-lg`} style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 70% 70%, 50% 90%, 30% 70%, 10% 100%)" }} />
                </div>
              )}

              {/* Sleek Curls */}
              {hairStyle === "curls" && (
                <div className="absolute inset-0 overflow-visible">
                  {/* Left curl bun */}
                  <div className={`absolute -top-3.5 -left-3 size-7 bg-gradient-to-br ${hairColorGrad} rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-pulse`} />
                  {/* Right curl bun */}
                  <div className={`absolute -top-3.5 -right-3 size-7 bg-gradient-to-bl ${hairColorGrad} rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] animate-pulse`} />
                  {/* Soft fluffy crown */}
                  <div className={`absolute -top-2.5 inset-x-1 h-3/5 bg-gradient-to-b ${hairColorGrad} rounded-t-full rounded-b-xl`} />
                  {/* Curly forehead wisps */}
                  <div className={`absolute -top-0.5 inset-x-2 h-4 bg-gradient-to-b ${hairColorGrad} rounded-b-lg`} style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 80%, 80% 50%, 65% 90%, 50% 60%, 35% 90%, 20% 50%, 5% 80%)" }} />
                </div>
              )}

              {/* Pilot Cap */}
              {hairStyle === "pilot" && (
                <div className="absolute inset-x-[-4px] top-[-14px] h-12 overflow-visible">
                  {/* Hair under cap */}
                  <div className="absolute bottom-0 inset-x-3 h-5 bg-neutral-900 rounded-b" />
                  {/* Visor shield */}
                  <div className="absolute bottom-1 inset-x-1.5 h-3.5 bg-neutral-950 rounded-b-md border-b-2 border-amber-500" />
                  {/* Cap crown */}
                  <div className="absolute -top-1.5 inset-x-1 h-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-[18px] border-t border-slate-600/30 flex items-center justify-center">
                    {/* Golden Emblem badge */}
                    <div className="size-2.5 bg-amber-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                      <span className="text-[4px] text-black">✈️</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>

        {/* ========================================================
            ACTIVITY PROP OVERLAYS (Laptop, Book, Writing, Coffee)
           ======================================================== */}
        <div className="absolute inset-x-0 bottom-0 top-[45%] flex flex-col justify-end items-center pointer-events-none z-30 overflow-visible">
          
          {/* LAPTOP ACTIVITY */}
          {activity === "LAPTOP" && (
            <div className="w-full flex flex-col items-center justify-end overflow-visible">
              
              {/* Alternating Typing Arms */}
              <div className="w-2/3 h-5 relative flex justify-between translate-y-[-1px]">
                {/* Left typing hand */}
                <motion.div
                  animate={isActive ? {
                    y: [0, -4, 0],
                  } : { y: 0 }}
                  transition={{ duration: 0.15, repeat: Infinity, ease: "linear" }}
                  className="w-3.5 h-3.5 bg-orange-100 rounded-full border border-amber-900/10 shadow flex justify-center items-end"
                >
                  <div className="w-2.5 h-1.5 bg-neutral-800 rounded-t-full" />
                </motion.div>
                
                {/* Right typing hand */}
                <motion.div
                  animate={isActive ? {
                    y: [-4, 0, -4],
                  } : { y: 0 }}
                  transition={{ duration: 0.18, repeat: Infinity, ease: "linear" }}
                  className="w-3.5 h-3.5 bg-orange-100 rounded-full border border-amber-900/10 shadow flex justify-center items-end"
                >
                  <div className="w-2.5 h-1.5 bg-neutral-800 rounded-t-full" />
                </motion.div>
              </div>

              {/* Wooden Desk */}
              <div className="w-full h-2.5 bg-gradient-to-r from-amber-700 to-amber-800 border-t border-amber-600 rounded-t shadow-md relative flex justify-center items-end">
                {/* Laptop container */}
                <div className="absolute bottom-[2px] w-3/5 h-5 flex flex-col justify-end items-center overflow-visible">
                  {/* Glowing Laptop screen */}
                  <div 
                    className={`w-[90%] h-4 bg-slate-800 rounded-t-md border-x border-t border-slate-700 p-0.5 flex flex-col justify-between overflow-hidden shadow-lg transition ${
                      isActive ? "bg-cyan-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]" : ""
                    }`}
                  >
                    {/* Glowing mock lines of code/interface */}
                    <div className="flex flex-col gap-0.5">
                      <div className={`h-0.5 w-[75%] rounded-full ${isActive ? "bg-cyan-400/70" : "bg-white/10"}`} />
                      <div className={`h-0.5 w-[50%] rounded-full ${isActive ? "bg-emerald-400/70 animate-pulse" : "bg-white/10"}`} />
                      <div className={`h-0.5 w-[90%] rounded-full ${isActive ? "bg-cyan-400/70" : "bg-white/10"}`} />
                    </div>
                    {/* Glowing widget badge */}
                    <div className="flex justify-end">
                      <div className={`size-1 rounded-full ${isActive ? "bg-cyan-400 animate-ping" : "bg-white/20"}`} />
                    </div>
                  </div>
                  {/* Laptop base keyboard */}
                  <div className="w-full h-1 bg-gradient-to-r from-slate-700 to-slate-800 rounded-b shadow" />
                </div>
              </div>
            </div>
          )}

          {/* BOOK ACTIVITY */}
          {activity === "BOOK" && (
            <div className="w-full flex flex-col items-center justify-end overflow-visible translate-y-[-2px]">
              
              {/* Open Book and Hands swaying */}
              <motion.div
                animate={isActive ? {
                  y: [0, -2, 0],
                } : { y: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-2/3 flex flex-col items-center overflow-visible"
              >
                {/* Book */}
                <div className="w-full h-7 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-b-md border border-emerald-400/30 flex shadow-lg relative justify-center overflow-visible">
                  {/* Left Page */}
                  <div className="w-[47%] h-[92%] bg-amber-50 rounded-tl-sm rounded-bl-md border-r border-amber-200/50 p-1 flex flex-col gap-0.5">
                    <div className="h-0.5 w-4/5 bg-slate-400/30 rounded-full" />
                    <div className="h-0.5 w-[70%] bg-slate-400/30 rounded-full" />
                    <div className="h-0.5 w-4/5 bg-slate-400/30 rounded-full" />
                  </div>
                  {/* Right Page */}
                  <div className="w-[47%] h-[92%] bg-amber-50 rounded-tr-sm rounded-br-md p-1 flex flex-col gap-0.5">
                    <div className="h-0.5 w-[90%] bg-slate-400/30 rounded-full" />
                    <div className="h-0.5 w-[60%] bg-slate-400/30 rounded-full" />
                    <div className="h-0.5 w-4/5 bg-slate-400/30 rounded-full" />
                  </div>
                  
                  {/* Chibi hands holding the book corners */}
                  <div className="absolute left-[-2px] bottom-0.5 size-2.5 bg-orange-100 rounded-full border border-amber-900/10 shadow" />
                  <div className="absolute right-[-2px] bottom-0.5 size-2.5 bg-orange-100 rounded-full border border-amber-900/10 shadow" />
                </div>
              </motion.div>

              {/* Wooden Desk trim */}
              <div className="w-full h-1.5 bg-gradient-to-r from-amber-700 to-amber-800 border-t border-amber-600 rounded-t shadow-md" />
            </div>
          )}

          {/* WRITING ACTIVITY */}
          {activity === "WRITING" && (
            <div className="w-full flex flex-col items-center justify-end overflow-visible">
              
              {/* Paper Pad & Scribbling Hands */}
              <div className="w-[85%] flex items-center justify-center overflow-visible relative">
                {/* Paper Notepad on desk */}
                <div className="w-3/5 h-5 bg-slate-100 border border-slate-300 rounded shadow p-1 flex flex-col gap-0.5 translate-y-[2px] -rotate-3">
                  <div className="h-0.5 w-4/5 bg-blue-300/40 rounded-full" />
                  <div className="h-0.5 w-[70%] bg-blue-300/40 rounded-full" />
                  <div className="h-0.5 w-[90%] bg-blue-300/40 rounded-full" />
                </div>

                {/* Left resting arm */}
                <div className="absolute left-3 bottom-0 size-3 bg-orange-100 rounded-full border border-amber-900/10 shadow" />

                {/* Right scribbling arm */}
                <motion.div
                  animate={isActive ? {
                    x: [0, 4, 0],
                    y: [0, -1, 0],
                  } : { x: 0, y: 0 }}
                  transition={{ duration: 0.12, repeat: Infinity, ease: "linear" }}
                  className="absolute right-4 bottom-0 w-4 h-4 bg-orange-100 rounded-full border border-amber-900/10 shadow flex justify-center items-center overflow-visible"
                >
                  {/* Chibi Pencil */}
                  <div className="w-1 h-3.5 bg-gradient-to-b from-yellow-400 to-amber-600 rounded shadow-sm rotate-45 translate-x-1.5 translate-y-[-2px] border border-amber-700/20" />
                </motion.div>
              </div>

              {/* Wooden Desk */}
              <div className="w-full h-2.5 bg-gradient-to-r from-amber-700 to-amber-800 border-t border-amber-600 rounded-t shadow-md" />
            </div>
          )}

          {/* CHILL ACTIVITY */}
          {activity === "CHILL" && (
            <div className="w-full flex flex-col items-center justify-end overflow-visible">
              
              {/* Steam Particles */}
              {isActive && (
                <div className="w-6 h-6 absolute left-[60%] top-[-8px] pointer-events-none z-45">
                  <div className="absolute left-1 bottom-0 w-1.5 h-1.5 bg-white/25 rounded-full blur-[0.5px]" style={{ animation: "steam-rise 2s infinite" }} />
                  <div className="absolute left-3 bottom-1.5 w-1 h-1 bg-white/20 rounded-full blur-[0.5px]" style={{ animation: "steam-rise 2.4s infinite 0.5s" }} />
                </div>
              )}

              {/* Mug & Hands */}
              <div className="w-3/5 h-6 relative flex items-end justify-center z-10 overflow-visible">
                {/* Left hand resting */}
                <div className="absolute left-[-2px] bottom-0 size-3 bg-orange-100 rounded-full border border-amber-900/10 shadow" />

                {/* Right Mug holding hand */}
                <motion.div
                  animate={isActive ? {
                    y: [0, -10, 0], // Sipping pattern loop
                  } : { y: 0 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-2 bottom-0 w-5 h-5 overflow-visible flex items-center justify-end"
                >
                  {/* Chibi Ceramic Mug */}
                  <div className="w-4.5 h-5 bg-gradient-to-br from-rose-500 to-rose-600 border border-rose-400/30 rounded-t-md rounded-b shadow-md flex items-center justify-center relative">
                    {/* Handle */}
                    <div className="absolute right-[-2.5px] top-1 w-1.5 h-3 border-y border-r border-rose-500 rounded-r bg-transparent" />
                    {/* Hot label logo */}
                    <span className="text-[5px] text-white">❤️</span>
                  </div>
                  
                  {/* Cozy Hand overlapping mug */}
                  <div className="absolute right-0.5 bottom-0 size-3 bg-orange-100 rounded-full border border-amber-900/10 shadow-sm" />
                </motion.div>
              </div>

              {/* Coffee table trim */}
              <div className="w-full h-2 bg-gradient-to-r from-amber-700 to-amber-800 border-t border-amber-600 rounded-t shadow-md" />
            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
}
