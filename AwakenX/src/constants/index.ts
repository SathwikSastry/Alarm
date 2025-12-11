/**
 * AwakenX Constants
 * App-wide constants including colors, theme, and configuration
 */

// Primary colors from the design spec
export const Colors = {
  primary: '#4C6FFF',
  secondary: '#FF5A5F',
  accent: '#D7263D',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F7F8FA',
  gray200: '#E8EBEF',
  gray300: '#C9CED6',
  gray400: '#9DA4AE',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Challenge colors
  challengeMath: '#8B5CF6',
  challengeShake: '#F97316',
  challengeMemory: '#06B6D4',
  challengeQR: '#84CC16',
  challengeTyping: '#EC4899',
  challengeSteps: '#14B8A6',
};

// Theme configurations
export const LightTheme = {
  background: Colors.white,
  surface: Colors.gray100,
  card: Colors.white,
  text: Colors.gray900,
  textSecondary: Colors.gray500,
  border: Colors.gray200,
  primary: Colors.primary,
  statusBar: 'dark' as 'dark' | 'light',
};

export const DarkTheme = {
  background: Colors.gray900,
  surface: Colors.gray800,
  card: Colors.gray800,
  text: Colors.white,
  textSecondary: Colors.gray400,
  border: Colors.gray700,
  primary: Colors.primary,
  statusBar: 'light' as 'dark' | 'light',
};

// Typography scale
export const Typography = {
  displayLarge: {
    fontSize: 57,
    fontWeight: '400' as const,
    letterSpacing: -0.25,
    lineHeight: 64,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
};

// Spacing scale (8px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Animation durations
export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Challenge configurations
export const ChallengeConfig = {
  math: {
    easy: { operandRange: [1, 10], operations: ['addition', 'subtraction'] },
    medium: { operandRange: [10, 50], operations: ['addition', 'subtraction', 'multiplication'] },
    hard: { operandRange: [10, 100], operations: ['addition', 'subtraction', 'multiplication', 'division'] },
    insane: { operandRange: [50, 200], operations: ['addition', 'subtraction', 'multiplication', 'division'] },
    defaultTimeLimit: 30,
    problemCount: 3,
  },
  shake: {
    easy: { count: 20 },
    medium: { count: 50 },
    hard: { count: 100 },
    insane: { count: 200 },
  },
  memory: {
    easy: { cards: 4 },
    medium: { cards: 8 },
    hard: { cards: 12 },
    insane: { cards: 16 },
    defaultTimeLimit: 60,
  },
  steps: {
    easy: { count: 15 },
    medium: { count: 30 },
    hard: { count: 50 },
    insane: { count: 100 },
  },
  typing: {
    easy: { wordCount: 3 },
    medium: { wordCount: 6 },
    hard: { wordCount: 10 },
    insane: { wordCount: 15 },
  },
  colorSequence: {
    easy: { length: 4 },
    medium: { length: 6 },
    hard: { length: 8 },
    insane: { length: 12 },
  },
};

// Default alarm settings
export const DefaultAlarmSettings = {
  snoozeEnabled: true,
  snoozeDuration: 5, // minutes
  volumeRampUp: true,
  vibration: true,
  vibrationPattern: 'mild' as const,
  volume: 0.8,
};

// Sleep tracking settings
export const SleepTrackingConfig = {
  smartWakeupWindowMinutes: 15,
  minimumSleepDurationMinutes: 30,
  samplingIntervalMs: 60000, // 1 minute
};

// Memory game emojis
export const MemoryGameEmojis = ['🌟', '🌙', '⭐', '🔔', '⏰', '☀️', '🌈', '💫', '🎵', '❤️', '🎯', '🌸'];

// Shake detection constants
export const ShakeDetectionConfig = {
  threshold: 1.5,
  cooldownMs: 100,
  historyLength: 100,
  minDataPoints: 10,
  varianceThreshold: 0.5,
};

// Notification configuration
export const NotificationProjectId = 'awakenx-smart-alarm';

// Premium features
export const PremiumFeatures = {
  advancedChallenges: ['colorSequence', 'reading', 'steps'],
  smartWakeupAI: true,
  unlimitedAlarmTones: true,
  premiumThemes: true,
  sleepAnalytics: true,
  noAds: true,
};

// Subscription pricing
export const SubscriptionPricing = {
  monthly: {
    amount: 149,
    currency: 'INR',
    displayPrice: '₹149/month',
  },
  yearly: {
    amount: 999,
    currency: 'INR',
    displayPrice: '₹999/year',
  },
};

// Days of week
export const DaysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

// Challenge display names
export const ChallengeDisplayNames: Record<string, string> = {
  math: 'Math Problems',
  shake: 'Shake Phone',
  qr: 'Scan QR Code',
  memory: 'Memory Game',
  steps: 'Walk Steps',
  typing: 'Typing Challenge',
  reading: 'Read Aloud',
  colorSequence: 'Color Sequence',
  random: 'Random',
};

// Typing challenge phrases
export const TypingPhrases = [
  "The early bird catches the worm",
  "Today is a new beginning",
  "Rise and shine, champion",
  "Every morning brings new potential",
  "Make today count",
  "Success starts with waking up on time",
  "Your future self will thank you",
  "Embrace the day with energy",
  "Good morning, the world awaits",
  "Time to conquer the day",
  "Great things await those who wake early",
  "The morning sun brings fresh opportunities",
];

// Reading challenge quotes
export const ReadingQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal. It is the courage to continue that counts. - Winston Churchill",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
];
