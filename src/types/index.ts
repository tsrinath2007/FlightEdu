export type TransportMode = "FLIGHT" | "BUS" | "TRAIN" | "CAR";
export type SessionMode = "CHILL" | "HARDCORE";
export type SessionStatus = "WAITING" | "BOARDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  coins: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date | null;
  unlockedMaps: string[];
}

export interface Session {
  id: string;
  hostId: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  transportMode: TransportMode;
  duration: number;
  mode: SessionMode;
  status: SessionStatus;
  inviteCode: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  participants?: SessionParticipant[];
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date | null;
  hoursCompleted: number;
  completed: boolean;
  user?: Pick<User, "id" | "name" | "avatarUrl">;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: Badge;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name?: string | null;
  avatarUrl?: string | null;
  totalHours: number;
  totalCoins: number;
  streakDays: number;
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  iataCode?: string;
}

export interface TravelOption {
  mode: TransportMode;
  duration: number;
  durationText: string;
  distance?: number;
  distanceText?: string;
}

export interface StudyPlan {
  title: string;
  totalDuration: number;
  blocks: StudyBlock[];
  goals: string[];
}

export interface StudyBlock {
  type: "study" | "break" | "snack" | "lunch";
  title: string;
  duration: number;
  startOffset: number;
  description?: string;
}
