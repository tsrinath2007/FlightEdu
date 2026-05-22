export const COIN_REWARDS = {
  HOUR_STUDY: 200,
  DAILY_STREAK: 1000,
  JOURNEY_COMPLETE_BASE: 100,
} as const;

export const COIN_PENALTIES = {
  STREAK_BROKEN: -3000,
  HARDCORE_EARLY_LEAVE: -500,
} as const;

export const COIN_FLOOR = -10_000;
export const MAP_UNLOCK_COST = 5_000;

export function calcJourneyBonus(distanceKm: number): number {
  return Math.floor(distanceKm / 100) * 10;
}

export function isInRecoveryMode(coins: number): boolean {
  return coins <= COIN_FLOOR;
}

export function clampCoins(coins: number): number {
  return Math.max(COIN_FLOOR, coins);
}
