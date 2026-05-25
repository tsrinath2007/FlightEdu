export interface PilotRank {
  name: string;
  icon: string;
  color: string;
  desc: string;
  reqText: string;
  nextRank?: string;
  nextRankReq?: string;
  progressPercent: number;
}

export function computePilotRank(completedCount: number, totalHours: number, uniqueAirportsCount: number = 0): PilotRank {
  if (totalHours >= 500) {
    return {
      name: "Commander",
      icon: "🚀",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      desc: "Top-tier space-grade pilot of the focus fleet. Study legend.",
      reqText: "500+ Focus Hours completed",
      progressPercent: 100,
    };
  }
  
  if (completedCount >= 100 || uniqueAirportsCount >= 15) {
    return {
      name: "Ace Pilot",
      icon: "🌏",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      desc: "Master of global travel. Studied in every hemisphere.",
      reqText: "100+ flights or 15+ unique airports visited",
      nextRank: "Commander",
      nextRankReq: `${Math.round(totalHours)}/500 hours`,
      progressPercent: Math.min(100, Math.round((totalHours / 500) * 100)),
    };
  }
  
  if (completedCount >= 50 && totalHours >= 100) {
    return {
      name: "Captain",
      icon: "👨‍✈️",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      desc: "A highly disciplined pilot. Trusted with large passenger crews.",
      reqText: "50+ flights done and 100+ hours completed",
      nextRank: "Ace Pilot",
      nextRankReq: `${completedCount}/100 flights`,
      progressPercent: Math.min(100, Math.round((completedCount / 100) * 100)),
    };
  }
  
  if (completedCount >= 10) {
    return {
      name: "Co-Pilot",
      icon: "🚀",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "An experienced flyer. Capable of handling active study cruise runs.",
      reqText: "10+ completed study flights done",
      nextRank: "Captain",
      nextRankReq: `${completedCount}/50 flights & ${Math.round(totalHours)}/100 hrs`,
      progressPercent: Math.min(100, Math.round(((completedCount + (totalHours / 100) * 50) / 100) * 100)),
    };
  }
  
  if (completedCount >= 1) {
    return {
      name: "Cadet",
      icon: "✈️",
      color: "text-electric-400 bg-electric-500/10 border-electric-500/20",
      desc: "Fresh recruit of the focus flight deck. Ready for takeoff.",
      reqText: "First flight completed successfully",
      nextRank: "Co-Pilot",
      nextRankReq: `${completedCount}/10 flights`,
      progressPercent: Math.min(100, Math.round((completedCount / 10) * 100)),
    };
  }
  
  return {
    name: "Student Pilot",
    icon: "🛩️",
    color: "text-white/40 bg-white/5 border-white/10",
    desc: "Unlicensed trainee. Declare a manifest to complete your first flight!",
    reqText: "0 flights completed",
    nextRank: "Cadet",
    nextRankReq: `${completedCount}/1 flight`,
    progressPercent: 0,
  };
}
