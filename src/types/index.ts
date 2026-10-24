export type MissionStatus = 'bloqueada' | 'pendiente' | 'completada';

export interface MissionProgressItem {
  id: number;
  completed: boolean;
  evidence?: string;
  completedAt?: string;
}

export interface UserProgressData {
  points: number;
  missions: MissionProgressItem[];
}

export interface MissionDefinition {
  id: number;
  title: string;
  tagline: string;
  description: string;
  points: number;
  sensor: string;
  requirement: string;
  status: MissionStatus;
  evidence?: string;
  completedAt?: string;
}

export interface LeaderboardUser {
  uid: string;
  displayName: string;
  email: string;
  points: number;
  completedCount: number;
  rank?: number;
  isCurrentUser?: boolean;
}

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
}
