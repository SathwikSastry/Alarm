/**
 * AwakenX Data Models
 * Based on the database schema and feature requirements
 */

// Challenge types supported by the app
export type ChallengeType = 
  | 'math'
  | 'shake'
  | 'qr'
  | 'memory'
  | 'steps'
  | 'typing'
  | 'reading'
  | 'colorSequence'
  | 'random';

// Difficulty levels for challenges
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'insane';

// Math operations for math challenges
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division';

// Vibration patterns
export type VibrationPattern = 'mild' | 'strong' | 'pulse';

// Days of the week
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// Theme options
export type ThemeType = 'light' | 'dark';

// User settings interface
export interface UserSettings {
  theme: ThemeType;
  defaultChallengeLevel: DifficultyLevel;
  defaultVibration: VibrationPattern;
  hapticFeedback: boolean;
  bedtimeReminder: boolean;
  bedtimeReminderTime?: string; // HH:MM format
}

// User model
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  settings: UserSettings;
  isPremium: boolean;
  premiumExpiresAt?: Date;
}

// Challenge configuration
export interface ChallengeConfig {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  timeLimit?: number; // in seconds
  // Math-specific
  operations?: MathOperation[];
  problemCount?: number;
  // Shake-specific
  shakeCount?: number;
  // Memory-specific
  cardCount?: number;
  // Steps-specific
  stepsRequired?: number;
  // Typing-specific
  textLength?: number;
  // Color sequence specific
  sequenceLength?: number;
  // QR-specific
  registeredQrCodes?: string[];
}

// Alarm model
export interface Alarm {
  id: string;
  userId: string;
  label: string;
  time: string; // HH:MM format
  days: DayOfWeek[];
  isEnabled: boolean;
  challenge: ChallengeConfig;
  tone: string; // URL or asset name
  volume: number; // 0.0 to 1.0
  vibration: boolean;
  vibrationPattern: VibrationPattern;
  volumeRampUp: boolean;
  snoozeEnabled: boolean;
  snoozeDuration: number; // in minutes
  isBackupAlarm: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics event model
export interface AnalyticsEvent {
  id: string;
  userId: string;
  alarmId: string;
  date: Date;
  scheduledTime: string;
  actualDismissTime: Date;
  timeTakenToDismiss: number; // in seconds
  snoozeCount: number;
  challengeUsed: ChallengeType;
  challengeDifficulty: DifficultyLevel;
  successChallenge: boolean;
  attemptCount: number;
}

// Sleep tracking data model
export interface SleepData {
  id: string;
  userId: string;
  date: Date;
  bedTime: Date;
  wakeTime: Date;
  sleepDuration: number; // in minutes
  sleepQuality: number; // 0-100 score
  sleepStages?: SleepStage[];
  motionData?: MotionReading[];
  noiseData?: NoiseReading[];
}

// Sleep stage model
export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
}

// Motion reading for sleep tracking
export interface MotionReading {
  timestamp: Date;
  intensity: number; // 0-1
}

// Noise reading for sleep tracking
export interface NoiseReading {
  timestamp: Date;
  decibels: number;
}

// Challenge result
export interface ChallengeResult {
  type: ChallengeType;
  difficulty: DifficultyLevel;
  success: boolean;
  timeTaken: number; // in seconds
  attempts: number;
  completedAt: Date;
}

// Math problem for challenges
export interface MathProblem {
  operand1: number;
  operand2: number;
  operation: MathOperation;
  correctAnswer: number;
}

// Memory card for memory game
export interface MemoryCard {
  id: string;
  value: string | number;
  isFlipped: boolean;
  isMatched: boolean;
}

// Color sequence item
export interface ColorSequenceItem {
  color: string;
  index: number;
}

// QR Code registration
export interface RegisteredQRCode {
  id: string;
  userId: string;
  label: string;
  codeData: string;
  location: string;
  createdAt: Date;
}

// Notification payload
export interface AlarmNotification {
  alarmId: string;
  time: string;
  label: string;
  challengeType: ChallengeType;
}

// App navigation params
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  CreateAlarm: { alarmId?: string };
  EditAlarm: { alarmId: string };
  Challenge: { alarmId: string; challengeConfig: ChallengeConfig };
  SleepTracking: undefined;
  Profile: undefined;
  Settings: undefined;
  Store: undefined;
  QRCodeScanner: { purpose: 'register' | 'challenge' };
};

// Tab navigation params
export type TabParamList = {
  Alarms: undefined;
  Sleep: undefined;
  Profile: undefined;
};

// Personalization recommendation
export interface WakeupRecommendation {
  suggestedTime: string;
  reason: string;
  basedOn: string[];
  confidence: number;
}

// Weekly stats
export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalAlarms: number;
  successfulWakeUps: number;
  averageTimeToDismiss: number;
  averageSnoozeCount: number;
  mostUsedChallenge: ChallengeType;
  averageSleepDuration: number;
  sleepQualityTrend: 'improving' | 'declining' | 'stable';
}
