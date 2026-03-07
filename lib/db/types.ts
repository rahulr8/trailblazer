export interface HealthConnection {
  isAuthorized: boolean;
  connectedAt: string;
  lastSyncAt: string | null;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  membershipTier: "free" | "platinum";
  totalKm: number;
  totalMinutes: number;
  totalSteps: number;
  currentStreak: number;
  lastActivityDate: string | null;
  upgradedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalKm: number;
  totalMinutes: number;
  totalSteps: number;
  currentStreak: number;
}

export type ActivitySource = "manual" | "apple_health";

export interface Activity {
  id: number;
  source: ActivitySource;
  externalId: string | null;
  type: string;
  duration: number;
  distance: number;
  location: string | null;
  date: Date;
  elapsedTime?: number;
  elevationGain?: number;
  name?: string;
  sportType?: string;
}

export interface LogActivityInput {
  type: string;
  duration: number;
  distance: number;
  location: string | null;
}

export interface StatDeltas {
  km?: number;
  minutes?: number;
  steps?: number;
}

export interface QueryOptions {
  limit?: number;
  orderByDate?: "asc" | "desc";
}

export interface Conversation {
  id: string;
  userId: string | null;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface LogMessageInput {
  userId: string | null;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
}
