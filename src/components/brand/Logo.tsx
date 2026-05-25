import React from "react";

interface LogoProps {
  layout?: "vertical" | "horizontal" | "mark-only";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ layout = "horizontal", className = "", size = "md" }: LogoProps) {
  // Dimension mappings based on size
  const markDimensions = {
    sm: { width: 24, height: 18 },
    md: { width: 44, height: 32 },
    lg: { width: 88, height: 64 },
  };

  const currentMark = markDimensions[size];

  const graphicMark = (
    <svg 
      width={currentMark.width} 
      height={currentMark.height} 
      viewBox="-80 0 160 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <g>
        {/* Concentric Signal Arcs */}
        <path d="M -70 30 A 76 76 0 0 1 70 30" fill="none" stroke="#00c8a0" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />
        <path d="M -48 18 A 52 52 0 0 1 48 18" fill="none" stroke="#00c8a0" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
        <path d="M -26 6 A 28 28 0 0 1 26 6" fill="none" stroke="#00c8a0" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
        
        {/* Location pin center dot */}
        <circle cx="0" cy="20" r="8.5" fill="#00c8a0" />
        <circle cx="0" cy="20" r="15" fill="#00c8a0" opacity="0.2" className="animate-pulse" />
        
        {/* Pin stand */}
        <line x1="0" y1="20" x2="0" y2="55" stroke="#00c8a0" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="-15" y1="55" x2="15" y2="55" stroke="#00c8a0" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
  );

  if (layout === "mark-only") {
    return graphicMark;
  }

  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Concentric Signal Mark */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-[#00c8a0]/15 blur-xl rounded-full scale-125 pointer-events-none" />
          <div className="relative">
            {graphicMark}
          </div>
        </div>
        {/* Wordmark */}
        <h1 className="font-display font-extrabold text-white tracking-tight leading-none text-3xl sm:text-4xl">
          GoFocus<span className="text-[#00c8a0]">Gen</span>
        </h1>
        {/* Subtitle */}
        <span className="mt-2.5 text-[10px] sm:text-[11px] font-mono font-semibold text-[#4a7fa8] tracking-[0.25em] uppercase">
          STUDY · ANYWHERE · ANYTIME
        </span>
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Graphic */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#00c8a0]/10 blur-md rounded-full scale-110 pointer-events-none" />
        <div className="relative">
          {graphicMark}
        </div>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <span className="font-display font-bold text-white tracking-tight text-xl sm:text-2xl">
          GoFocus<span className="text-[#00c8a0]">Gen</span>
        </span>
      </div>
    </div>
  );
}
