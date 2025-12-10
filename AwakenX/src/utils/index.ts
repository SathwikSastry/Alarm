/**
 * AwakenX Utility Functions
 * Common helper functions used throughout the app
 */

import { MathProblem, MathOperation, DifficultyLevel, MemoryCard } from '../models';
import { ChallengeConfig, TypingPhrases, ReadingQuotes } from '../constants';
import * as Crypto from 'expo-crypto';

/**
 * Generate a random math problem based on difficulty
 */
export function generateMathProblem(difficulty: DifficultyLevel): MathProblem {
  const config = ChallengeConfig.math[difficulty];
  const operations = config.operations as MathOperation[];
  const [min, max] = config.operandRange;
  
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let operand1 = randomInt(min, max);
  let operand2 = randomInt(min, max);
  
  // For division, ensure clean division
  if (operation === 'division') {
    operand1 = randomInt(min, max);
    const divisors = getDivisors(operand1).filter(d => d > 1 && d <= max);
    operand2 = divisors.length > 0 ? divisors[Math.floor(Math.random() * divisors.length)] : 1;
  }
  
  // For subtraction at easy level, ensure positive result
  if (operation === 'subtraction' && difficulty === 'easy') {
    if (operand1 < operand2) {
      [operand1, operand2] = [operand2, operand1];
    }
  }
  
  const correctAnswer = calculateAnswer(operand1, operand2, operation);
  
  return { operand1, operand2, operation, correctAnswer };
}

/**
 * Calculate the answer for a math problem
 */
function calculateAnswer(a: number, b: number, operation: MathOperation): number {
  switch (operation) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return Math.floor(a / b);
  }
}

/**
 * Get operation symbol for display
 */
export function getOperationSymbol(operation: MathOperation): string {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '−';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
  }
}

/**
 * Get all divisors of a number
 */
function getDivisors(n: number): number[] {
  const divisors: number[] = [];
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      divisors.push(i);
      if (i !== n / i) {
        divisors.push(n / i);
      }
    }
  }
  return divisors.sort((a, b) => a - b);
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate memory game cards
 */
export function generateMemoryCards(pairCount: number): MemoryCard[] {
  const values = ['🌟', '🌙', '⭐', '🔔', '⏰', '☀️', '🌈', '💫', '🎵', '❤️', '🎯', '🌸'];
  const selectedValues = values.slice(0, pairCount);
  
  const cards: MemoryCard[] = [];
  selectedValues.forEach((value, index) => {
    // Create pairs
    cards.push({
      id: `card-${index}-a`,
      value,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `card-${index}-b`,
      value,
      isFlipped: false,
      isMatched: false,
    });
  });
  
  return shuffleArray(cards);
}

/**
 * Generate a color sequence for Simon Says game
 */
export function generateColorSequence(length: number): string[] {
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // red, blue, green, yellow
  const sequence: string[] = [];
  
  for (let i = 0; i < length; i++) {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
  }
  
  return sequence;
}

/**
 * Get a random typing phrase
 */
export function getRandomTypingPhrase(wordCount: number): string {
  const phrases = TypingPhrases.filter(p => p.split(' ').length <= wordCount * 1.5);
  if (phrases.length === 0) {
    return TypingPhrases[Math.floor(Math.random() * TypingPhrases.length)];
  }
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get a random reading quote
 */
export function getRandomReadingQuote(): string {
  return ReadingQuotes[Math.floor(Math.random() * ReadingQuotes.length)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time from Date to HH:MM string
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse HH:MM string to { hours, minutes }
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate time until alarm rings
 */
export function getTimeUntilAlarm(alarmTime: string, days: string[]): string {
  const now = new Date();
  const { hours, minutes } = parseTime(alarmTime);
  
  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };
  
  let targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);
  
  // If no specific days, assume daily
  if (days.length === 0) {
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  } else {
    // Find the next occurrence
    const dayNumbers = days.map(d => dayMap[d]);
    let daysUntil = 0;
    let found = false;
    
    for (let i = 0; i < 7 && !found; i++) {
      const checkDay = (now.getDay() + i) % 7;
      if (dayNumbers.includes(checkDay)) {
        daysUntil = i;
        if (i === 0 && targetDate <= now) {
          continue;
        }
        found = true;
      }
    }
    
    if (!found) {
      daysUntil = 7 + dayNumbers[0] - now.getDay();
    }
    
    targetDate.setDate(targetDate.getDate() + daysUntil);
  }
  
  const diffMs = targetDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours >= 24) {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m`;
  }
  
  return `${diffMins}m`;
}

/**
 * Generate a unique ID
 */
export async function generateId(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const hexString = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hexString;
}

/**
 * Generate a synchronous unique ID (fallback)
 */
export function generateIdSync(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate shake intensity pattern to prevent cheating
 */
export function validateShakePattern(accelerometerData: { x: number; y: number; z: number }[]): boolean {
  if (accelerometerData.length < 10) return false;
  
  // Check for variance in acceleration (real shakes have varied patterns)
  const magnitudes = accelerometerData.map(d => 
    Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
  );
  
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const variance = magnitudes.reduce((acc, m) => acc + Math.pow(m - mean, 2), 0) / magnitudes.length;
  
  // Real shakes should have significant variance
  return variance > 0.5;
}

/**
 * Format day abbreviations for display
 */
export function formatDays(days: string[]): string {
  if (days.length === 0) return 'Once';
  if (days.length === 7) return 'Every day';
  
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weekend = ['Sat', 'Sun'];
  
  if (days.length === 5 && weekdays.every(d => days.includes(d))) {
    return 'Weekdays';
  }
  if (days.length === 2 && weekend.every(d => days.includes(d))) {
    return 'Weekends';
  }
  
  return days.join(', ');
}

/**
 * Calculate sleep quality score based on duration and wake pattern
 */
export function calculateSleepQuality(
  durationMinutes: number,
  wakeCount: number,
  snoozeCount: number
): number {
  // Ideal sleep is 7-9 hours (420-540 minutes)
  let score = 100;
  
  // Duration scoring
  if (durationMinutes < 360) {
    score -= (360 - durationMinutes) * 0.2; // Penalty for < 6 hours
  } else if (durationMinutes > 540) {
    score -= (durationMinutes - 540) * 0.1; // Small penalty for oversleeping
  }
  
  // Wake count penalty
  score -= wakeCount * 5;
  
  // Snooze penalty
  score -= snoozeCount * 10;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
