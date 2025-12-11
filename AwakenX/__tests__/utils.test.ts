/**
 * AwakenX Unit Tests
 * Tests for utility functions
 */

import {
  generateMathProblem,
  getOperationSymbol,
  generateMemoryCards,
  generateColorSequence,
  formatTime,
  parseTime,
  formatDuration,
  formatDays,
  calculateSleepQuality,
  randomInt,
  shuffleArray,
  validateShakePattern,
  generateIdSync,
} from '../src/utils';

describe('Math Problem Generation', () => {
  it('should generate a valid easy math problem', () => {
    const problem = generateMathProblem('easy');
    
    expect(problem).toBeDefined();
    expect(typeof problem.operand1).toBe('number');
    expect(typeof problem.operand2).toBe('number');
    expect(['addition', 'subtraction']).toContain(problem.operation);
    expect(typeof problem.correctAnswer).toBe('number');
  });

  it('should generate correct answer for addition', () => {
    const problem = generateMathProblem('easy');
    
    if (problem.operation === 'addition') {
      expect(problem.correctAnswer).toBe(problem.operand1 + problem.operand2);
    }
  });

  it('should generate correct answer for subtraction', () => {
    const problem = generateMathProblem('easy');
    
    if (problem.operation === 'subtraction') {
      expect(problem.correctAnswer).toBe(problem.operand1 - problem.operand2);
    }
  });

  it('should generate harder problems for insane difficulty', () => {
    const problem = generateMathProblem('insane');
    
    expect(problem.operand1).toBeGreaterThanOrEqual(50);
    expect(problem.operand1).toBeLessThanOrEqual(200);
  });
});

describe('Operation Symbol', () => {
  it('should return correct symbols', () => {
    expect(getOperationSymbol('addition')).toBe('+');
    expect(getOperationSymbol('subtraction')).toBe('−');
    expect(getOperationSymbol('multiplication')).toBe('×');
    expect(getOperationSymbol('division')).toBe('÷');
  });
});

describe('Memory Cards Generation', () => {
  it('should generate correct number of cards', () => {
    const cards = generateMemoryCards(4);
    expect(cards.length).toBe(8); // 4 pairs = 8 cards
  });

  it('should have matching pairs', () => {
    const cards = generateMemoryCards(3);
    const values = cards.map(c => c.value);
    
    // Each value should appear exactly twice
    const valueCounts: Record<string, number> = {};
    values.forEach(v => {
      valueCounts[String(v)] = (valueCounts[String(v)] || 0) + 1;
    });
    
    Object.values(valueCounts).forEach(count => {
      expect(count).toBe(2);
    });
  });

  it('should initialize cards as not flipped and not matched', () => {
    const cards = generateMemoryCards(2);
    
    cards.forEach(card => {
      expect(card.isFlipped).toBe(false);
      expect(card.isMatched).toBe(false);
    });
  });
});

describe('Color Sequence Generation', () => {
  it('should generate correct length sequence', () => {
    const sequence = generateColorSequence(6);
    expect(sequence.length).toBe(6);
  });

  it('should only use valid colors', () => {
    const validColors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
    const sequence = generateColorSequence(10);
    
    sequence.forEach(color => {
      expect(validColors).toContain(color);
    });
  });
});

describe('Time Formatting', () => {
  it('should format date to HH:MM string', () => {
    const date = new Date(2024, 0, 1, 9, 30);
    expect(formatTime(date)).toBe('09:30');
  });

  it('should pad single digit hours and minutes', () => {
    const date = new Date(2024, 0, 1, 5, 5);
    expect(formatTime(date)).toBe('05:05');
  });

  it('should parse time string correctly', () => {
    const { hours, minutes } = parseTime('14:45');
    expect(hours).toBe(14);
    expect(minutes).toBe(45);
  });
});

describe('Duration Formatting', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatDuration(90)).toBe('01:30');
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(3661)).toBe('61:01');
  });
});

describe('Days Formatting', () => {
  it('should return "Once" for empty array', () => {
    expect(formatDays([])).toBe('Once');
  });

  it('should return "Every day" for all days', () => {
    expect(formatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).toBe('Every day');
  });

  it('should return "Weekdays" for Mon-Fri', () => {
    expect(formatDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])).toBe('Weekdays');
  });

  it('should return "Weekends" for Sat-Sun', () => {
    expect(formatDays(['Sat', 'Sun'])).toBe('Weekends');
  });

  it('should return comma-separated days for custom selection', () => {
    expect(formatDays(['Mon', 'Wed', 'Fri'])).toBe('Mon, Wed, Fri');
  });
});

describe('Sleep Quality Calculation', () => {
  it('should return 100 for ideal sleep', () => {
    const score = calculateSleepQuality(480, 0, 0); // 8 hours, no wakes, no snoozes
    expect(score).toBeGreaterThanOrEqual(95);
  });

  it('should penalize short sleep', () => {
    const shortSleep = calculateSleepQuality(300, 0, 0); // 5 hours
    const goodSleep = calculateSleepQuality(480, 0, 0); // 8 hours
    expect(shortSleep).toBeLessThan(goodSleep);
  });

  it('should penalize snoozing', () => {
    const noSnooze = calculateSleepQuality(480, 0, 0);
    const withSnooze = calculateSleepQuality(480, 0, 2);
    expect(withSnooze).toBeLessThan(noSnooze);
  });

  it('should clamp score between 0 and 100', () => {
    const veryBad = calculateSleepQuality(60, 10, 10);
    const excellent = calculateSleepQuality(480, 0, 0);
    
    expect(veryBad).toBeGreaterThanOrEqual(0);
    expect(excellent).toBeLessThanOrEqual(100);
  });
});

describe('Random Integer', () => {
  it('should generate numbers within range', () => {
    for (let i = 0; i < 100; i++) {
      const num = randomInt(5, 10);
      expect(num).toBeGreaterThanOrEqual(5);
      expect(num).toBeLessThanOrEqual(10);
    }
  });

  it('should return exact number when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });
});

describe('Shuffle Array', () => {
  it('should maintain array length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(original.length);
  });

  it('should contain same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    
    original.forEach(item => {
      expect(shuffled).toContain(item);
    });
  });

  it('should not modify original array', () => {
    const original = [1, 2, 3];
    shuffleArray(original);
    expect(original).toEqual([1, 2, 3]);
  });
});

describe('Shake Pattern Validation', () => {
  it('should reject short data', () => {
    const shortData = Array(5).fill({ x: 1, y: 0, z: 0 });
    expect(validateShakePattern(shortData)).toBe(false);
  });

  it('should accept valid shake pattern with variance', () => {
    // Create data with high variance (simulating real shakes)
    const validData = Array(20).fill(null).map((_, i) => ({
      x: Math.sin(i * 0.5) * 3 + (Math.random() - 0.5) * 4,
      y: Math.cos(i * 0.5) * 3 + (Math.random() - 0.5) * 4,
      z: Math.sin(i * 0.3) * 2 + (Math.random() - 0.5) * 4,
    }));
    expect(validateShakePattern(validData)).toBe(true);
  });
});

describe('ID Generation', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateIdSync());
    }
    expect(ids.size).toBe(100);
  });

  it('should match UUID format', () => {
    const id = generateIdSync();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(id).toMatch(uuidRegex);
  });
});
