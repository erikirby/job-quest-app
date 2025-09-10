// Fix: Removed self-import which caused declaration conflicts.

export enum Tab {
  Dashboard = 'Dashboard',
  // Fix: Add missing QuestBoard to the Tab enum.
  QuestBoard = 'Quest Board',
  QuestLog = 'Quest Log',
  DailyMissions = 'Daily Missions',
  BadgeGallery = 'Badge Gallery',
  Settings = 'Settings',
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  description: string;
  remote: boolean;
  rarity: number;
  emoji?: string;
  type?: string; // e.g., 'fire', 'water', 'grass'
  source?: string;
}

// Fix: Add JobRating type for AI-based job fit analysis.
export interface JobRating {
  rating: number;
  reasoning: string;
}

export enum ApplicationStatus {
  Submitted = 'Submitted',
  InReview = 'In Review',
  Interview = 'Interview',
  Offer = 'Offer',
  Hired = 'Hired',
  Rejected = 'Rejected',
  NoResponse = 'No Response',
}

export interface FollowUp {
  id: string;
  dueDate: string;
  completed: boolean;
  snoozedUntil?: string;
}

export interface Application {
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  submittedAt: string;
  followUps: FollowUp[];
}

export interface ProfilePreferences {
  remoteOnly: boolean;
  keywords: string[];
  preferredRoles: string[];
}

export interface Profile {
  id: string;
  name: string;
  preferences: ProfilePreferences;
}

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  dailyMissions: Record<string, boolean>; // missionId: completed
  lastMissionReset: string | null;
  unlockedBadges: string[]; // badgeId[]
  applications: Record<string, Application>; // jobId is key
  savedJobs: string[]; // jobId[]
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  criteria: (state: GameState, jobs: Record<string, Job>) => boolean;
}

export interface Mission {
  id: string;
  name: string;
  xp: number;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning';
}