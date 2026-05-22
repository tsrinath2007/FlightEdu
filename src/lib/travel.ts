import type { TransportMode, TravelOption } from "@/types";

// Average speeds in km/h per transport mode
const SPEEDS: Record<TransportMode, number> = {
  FLIGHT: 870,
  TRAIN: 180,
  CAR: 90,
  BUS: 70,
};

// Extra overhead in minutes (boarding, taxi, etc.)
const OVERHEAD: Record<TransportMode, number> = {
  FLIGHT: 120,
  TRAIN: 30,
  CAR: 10,
  BUS: 20,
};

// Minimum durations in minutes
const MIN_DURATION: Record<TransportMode, number> = {
  FLIGHT: 60,
  TRAIN: 30,
  CAR: 15,
  BUS: 30,
};

export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function calcTravelOptions(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): TravelOption[] {
  const distKm = haversineKm(lat1, lng1, lat2, lng2);
  const modes: TransportMode[] = ["FLIGHT", "TRAIN", "CAR", "BUS"];

  return modes
    .map((mode) => {
      const travelMins = (distKm / SPEEDS[mode]) * 60;
      const totalMins = Math.max(
        MIN_DURATION[mode],
        Math.round(travelMins + OVERHEAD[mode])
      );
      const totalSecs = totalMins * 60;

      return {
        mode,
        duration: totalSecs,
        durationText: formatMins(totalMins),
        distance: Math.round(distKm),
        distanceText: distKm >= 1000
          ? `${(distKm / 1000).toFixed(1)}k km`
          : `${Math.round(distKm)} km`,
      } satisfies TravelOption;
    })
    .filter((opt) => {
      // Don't show flight for short distances, don't show bus for very long
      if (opt.mode === "FLIGHT" && opt.distance! < 100) return false;
      if (opt.mode === "BUS" && opt.distance! > 1500) return false;
      if (opt.mode === "TRAIN" && opt.distance! > 3000) return false;
      return true;
    });
}

function formatMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcArrivalTime(durationSecs: number): string {
  const arrival = new Date(Date.now() + durationSecs * 1000);
  return arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
}
