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
  if (totalHours >= 1000) {
    return {
      name: "Commander",
      icon: "🚀",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      desc: "Top-tier space-grade pilot of the focus fleet. Ultimate study legend.",
      reqText: "1000+ Focus Hours completed",
      progressPercent: 100,
    };
  }
  
  if (completedCount >= 300 || totalHours >= 400 || uniqueAirportsCount >= 25) {
    return {
      name: "Ace Pilot",
      icon: "🌏",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      desc: "Master of global travel. Studied in every hemisphere.",
      reqText: "300+ flights or 400+ focus hours or 25+ unique airports",
      nextRank: "Commander",
      nextRankReq: `${Math.round(totalHours)}/1000 hours`,
      progressPercent: Math.min(100, Math.round((totalHours / 1000) * 100)),
    };
  }
  
  if (completedCount >= 150 && totalHours >= 150) {
    return {
      name: "Captain",
      icon: "👨‍✈️",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      desc: "A highly disciplined pilot. Trusted with large passenger crews.",
      reqText: "150+ flights done and 150+ focus hours completed",
      nextRank: "Ace Pilot",
      nextRankReq: `${completedCount}/300 flights or ${Math.round(totalHours)}/400 hrs`,
      progressPercent: Math.min(100, Math.round(((completedCount / 300) * 50 + (totalHours / 400) * 50))),
    };
  }
  
  if (completedCount >= 30 || totalHours >= 45) {
    return {
      name: "Co-Pilot",
      icon: "🚀",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      desc: "An experienced flyer. Capable of handling active study cruise runs.",
      reqText: "30+ flights or 45+ focus hours completed",
      nextRank: "Captain",
      nextRankReq: `${completedCount}/150 flights & ${Math.round(totalHours)}/150 hrs`,
      progressPercent: Math.min(100, Math.round(((completedCount / 150) * 50 + (totalHours / 150) * 50))),
    };
  }
  
  if (completedCount >= 3 || totalHours >= 5) {
    return {
      name: "Cadet",
      icon: "✈️",
      color: "text-electric-400 bg-electric-500/10 border-electric-500/20",
      desc: "Fresh recruit of the focus flight deck. Ready for takeoff.",
      reqText: "3+ flights or 5+ focus hours completed",
      nextRank: "Co-Pilot",
      nextRankReq: `${completedCount}/30 flights or ${Math.round(totalHours)}/45 hrs`,
      progressPercent: Math.min(100, Math.round(((completedCount / 30) * 50 + (totalHours / 45) * 50))),
    };
  }
  
  return {
    name: "Student Pilot",
    icon: "🛩️",
    color: "text-white/40 bg-white/5 border-white/10",
    desc: "Unlicensed trainee. Complete focus flights to begin your pilot journey!",
    reqText: "0 flights completed",
    nextRank: "Cadet",
    nextRankReq: `${completedCount}/3 flights or ${Math.round(totalHours)}/5 hrs`,
    progressPercent: 0,
  };
}
