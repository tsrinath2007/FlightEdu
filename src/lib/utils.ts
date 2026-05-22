import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatCoins(coins: number): string {
  if (Math.abs(coins) >= 1000) {
    return `${(coins / 1000).toFixed(1)}k`;
  }
  return coins.toString();
}

export function getTransportEmoji(mode: string): string {
  const map: Record<string, string> = {
    FLIGHT: "✈️",
    BUS: "🚌",
    TRAIN: "🚂",
    CAR: "🚗",
  };
  return map[mode] ?? "✈️";
}

export function getTransportLabel(mode: string): string {
  const map: Record<string, string> = {
    FLIGHT: "Flight",
    BUS: "Bus",
    TRAIN: "Train",
    CAR: "Car",
  };
  return map[mode] ?? "Flight";
}
