/**
 * AwakenX Shake Challenge Component
 * User must shake their phone a certain number of times
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { DifficultyLevel, ChallengeResult } from '../models';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius, ChallengeConfig, ShakeDetectionConfig } from '../constants';
import { validateShakePattern } from '../utils';

interface ShakeChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: (result: ChallengeResult) => void;
}

export function ShakeChallenge({ difficulty, onComplete }: ShakeChallengeProps) {
  const { theme } = useTheme();
  const config = ChallengeConfig.shake[difficulty];
  
  const targetShakes = config.count;
  const [shakeCount, setShakeCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const accelerometerHistory = useRef<{ x: number; y: number; z: number }[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  const lastShakeTime = useRef(0);

  useEffect(() => {
    // Subscribe to accelerometer
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      
      // Store history for anti-cheat validation
      accelerometerHistory.current.push({ x, y, z });
      if (accelerometerHistory.current.length > ShakeDetectionConfig.historyLength) {
        accelerometerHistory.current.shift();
      }
      
      // Calculate acceleration change
      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);
      
      const totalDelta = deltaX + deltaY + deltaZ;
      
      // Detect shake using configurable thresholds
      const now = Date.now();
      if (totalDelta > ShakeDetectionConfig.threshold && now - lastShakeTime.current > ShakeDetectionConfig.cooldownMs) {
        lastShakeTime.current = now;
        
        setShakeCount((prev) => {
          const newCount = prev + 1;
          
          // Haptic feedback
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          
          // Animate shake
          Animated.sequence([
            Animated.timing(shakeAnimation, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
              toValue: -1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ]).start();
          
          // Update progress animation
          Animated.timing(progressAnimation, {
            toValue: newCount / targetShakes,
            duration: 100,
            useNativeDriver: false,
            easing: Easing.out(Easing.quad),
          }).start();
          
          // Check completion
          if (newCount >= targetShakes) {
            // Validate shake pattern (anti-cheat)
            const isValid = validateShakePattern(accelerometerHistory.current);
            
            if (isValid) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              const result: ChallengeResult = {
                type: 'shake',
                difficulty,
                success: true,
                timeTaken: Math.round((Date.now() - startTime) / 1000),
                attempts: attempts + 1,
                completedAt: new Date(),
              };
              onComplete(result);
            } else {
              // Reset if cheat detected
              setAttempts((prev) => prev + 1);
              return 0;
            }
          }
          
          return newCount;
        });
      }
      
      lastAcceleration.current = { x, y, z };
    });

    return () => {
      subscription.remove();
    };
  }, [difficulty, targetShakes, startTime, attempts, onComplete]);

  const progress = shakeCount / targetShakes;
  const shakeRotation = shakeAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>📱 Shake Challenge</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Shake your phone vigorously!
        </Text>
      </View>

      {/* Shake Counter */}
      <Animated.View
        style={[
          styles.shakeCounter,
          { backgroundColor: theme.surface, transform: [{ rotate: shakeRotation }] },
        ]}
      >
        <Text style={[styles.countText, { color: Colors.primary }]}>
          {shakeCount}
        </Text>
        <Text style={[styles.targetText, { color: theme.textSecondary }]}>
          / {targetShakes}
        </Text>
      </Animated.View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.surface }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor:
                progress < 0.33 ? Colors.error : progress < 0.66 ? Colors.warning : Colors.success,
            },
          ]}
        />
      </View>

      {/* Progress Percentage */}
      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
        {Math.round(progress * 100)}% complete
      </Text>

      {/* Instruction */}
      <View style={[styles.instructionBox, { backgroundColor: theme.surface }]}>
        <Text style={[styles.instructionIcon]}>💡</Text>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          Keep shaking! Your progress is being tracked by the accelerometer.
          {difficulty === 'insane' && '\n\nThis is Insane mode - you got this! 💪'}
        </Text>
      </View>

      {/* Difficulty Badge */}
      <View style={styles.difficultyBadge}>
        <Text style={[styles.difficultyText, { color: theme.textSecondary }]}>
          Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
  shakeCounter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  countText: {
    ...Typography.displayLarge,
    fontWeight: '700',
  },
  targetText: {
    ...Typography.titleLarge,
  },
  progressContainer: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 8,
  },
  progressText: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xl,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  instructionText: {
    ...Typography.bodySmall,
    flex: 1,
  },
  difficultyBadge: {
    marginTop: Spacing.lg,
  },
  difficultyText: {
    ...Typography.labelSmall,
  },
});

export default ShakeChallenge;
