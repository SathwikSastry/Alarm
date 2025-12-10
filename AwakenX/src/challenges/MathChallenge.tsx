/**
 * AwakenX Math Challenge Component
 * Presents math problems that must be solved to dismiss alarm
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MathProblem, DifficultyLevel, ChallengeResult } from '../models';
import { Button } from '../components';
import { useTheme } from '../contexts';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  ChallengeConfig,
} from '../constants';
import { generateMathProblem, getOperationSymbol, formatDuration } from '../utils';

interface MathChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: (result: ChallengeResult) => void;
  onCancel?: () => void;
}

export function MathChallenge({ difficulty, onComplete, onCancel }: MathChallengeProps) {
  const { theme } = useTheme();
  const config = ChallengeConfig.math;
  
  const problemCount = config.problemCount;
  const timeLimit = config.defaultTimeLimit;
  
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now());

  // Generate initial problem
  useEffect(() => {
    setCurrentProblem(generateMathProblem(difficulty));
  }, [difficulty]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - generate new problem
          handleTimeout();
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [problemIndex]);

  const handleTimeout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setAttempts((prev) => prev + 1);
    setAnswer('');
    setCurrentProblem(generateMathProblem(difficulty));
    setTimeRemaining(timeLimit);
  };

  const checkAnswer = useCallback(() => {
    if (!currentProblem) return;

    const userAnswer = parseInt(answer, 10);
    const correct = userAnswer === currentProblem.correctAnswer;
    
    setIsCorrect(correct);
    setAttempts((prev) => prev + 1);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (problemIndex + 1 >= problemCount) {
        // All problems solved!
        const result: ChallengeResult = {
          type: 'math',
          difficulty,
          success: true,
          timeTaken: Math.round((Date.now() - startTime) / 1000),
          attempts,
          completedAt: new Date(),
        };
        onComplete(result);
      } else {
        // Next problem
        setTimeout(() => {
          setProblemIndex((prev) => prev + 1);
          setCurrentProblem(generateMathProblem(difficulty));
          setAnswer('');
          setIsCorrect(null);
          setTimeRemaining(timeLimit);
        }, 500);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Clear answer for retry
      setTimeout(() => {
        setAnswer('');
        setIsCorrect(null);
      }, 1000);
    }
  }, [answer, currentProblem, problemIndex, problemCount, difficulty, startTime, attempts, onComplete]);

  if (!currentProblem) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🧮 Math Challenge</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Problem {problemIndex + 1} of {problemCount}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <View
          style={[
            styles.timerBar,
            {
              backgroundColor: theme.surface,
            },
          ]}
        >
          <View
            style={[
              styles.timerProgress,
              {
                width: `${(timeRemaining / timeLimit) * 100}%`,
                backgroundColor:
                  timeRemaining > 10 ? Colors.success : timeRemaining > 5 ? Colors.warning : Colors.error,
              },
            ]}
          />
        </View>
        <Text style={[styles.timerText, { color: theme.textSecondary }]}>
          {formatDuration(timeRemaining)}
        </Text>
      </View>

      {/* Problem Display */}
      <View style={[styles.problemContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.problemText, { color: theme.text }]}>
          {currentProblem.operand1} {getOperationSymbol(currentProblem.operation)}{' '}
          {currentProblem.operand2} = ?
        </Text>
      </View>

      {/* Answer Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor:
                isCorrect === null
                  ? theme.border
                  : isCorrect
                  ? Colors.success
                  : Colors.error,
            },
          ]}
          value={answer}
          onChangeText={setAnswer}
          keyboardType="number-pad"
          placeholder="Enter answer"
          placeholderTextColor={theme.textSecondary}
          autoFocus
          onSubmitEditing={checkAnswer}
        />
        
        {isCorrect !== null && (
          <Text
            style={[
              styles.feedback,
              { color: isCorrect ? Colors.success : Colors.error },
            ]}
          >
            {isCorrect ? '✓ Correct!' : '✗ Wrong, try again!'}
          </Text>
        )}
      </View>

      {/* Submit Button */}
      <Button
        title="Submit Answer"
        onPress={checkAnswer}
        variant="primary"
        size="large"
        fullWidth
        disabled={answer.length === 0}
      />

      {/* Progress Dots */}
      <View style={styles.progressDots}>
        {Array.from({ length: problemCount }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index < problemIndex
                    ? Colors.success
                    : index === problemIndex
                    ? Colors.primary
                    : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.titleLarge,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
  },
  timerContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  timerBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    ...Typography.labelSmall,
    marginTop: Spacing.xs,
  },
  problemContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  problemText: {
    ...Typography.displayMedium,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 64,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedback: {
    ...Typography.labelLarge,
    marginTop: Spacing.sm,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default MathChallenge;
