/**
 * AwakenX Typing Challenge Component
 * User must type a phrase correctly to dismiss alarm
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DifficultyLevel, ChallengeResult } from '../models';
import { Button } from '../components';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius, ChallengeConfig } from '../constants';
import { getRandomTypingPhrase } from '../utils';

interface TypingChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: (result: ChallengeResult) => void;
}

export function TypingChallenge({ difficulty, onComplete }: TypingChallengeProps) {
  const { theme } = useTheme();
  const config = ChallengeConfig.typing[difficulty];
  
  const [targetPhrase, setTargetPhrase] = useState('');
  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Generate phrase
  useEffect(() => {
    setTargetPhrase(getRandomTypingPhrase(config.wordCount));
  }, [config.wordCount]);

  const normalizeText = (text: string): string => {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  };

  const checkMatch = () => {
    const normalizedTarget = normalizeText(targetPhrase);
    const normalizedInput = normalizeText(userInput);
    
    if (normalizedTarget === normalizedInput) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      
      const result: ChallengeResult = {
        type: 'typing',
        difficulty,
        success: true,
        timeTaken: Math.round((Date.now() - startTime) / 1000),
        attempts: attempts + 1,
        completedAt: new Date(),
      };
      onComplete(result);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowError(true);
      setAttempts((prev) => prev + 1);
      
      setTimeout(() => {
        setShowError(false);
        setUserInput('');
        inputRef.current?.focus();
      }, 1500);
    }
  };

  // Calculate typing accuracy
  const calculateAccuracy = (): number => {
    if (userInput.length === 0) return 100;
    
    const target = normalizeText(targetPhrase);
    const input = normalizeText(userInput);
    
    let matches = 0;
    for (let i = 0; i < Math.min(target.length, input.length); i++) {
      if (target[i] === input[i]) matches++;
    }
    
    return Math.round((matches / Math.max(target.length, input.length)) * 100);
  };

  // Render character-by-character comparison
  const renderPhraseWithHighlights = () => {
    const normalizedTarget = normalizeText(targetPhrase).split('');
    const normalizedInput = normalizeText(userInput).split('');
    
    return (
      <View style={styles.phraseContainer}>
        {targetPhrase.split('').map((char, index) => {
          let color = theme.text;
          
          if (index < userInput.length) {
            const normalizedIndex = normalizeText(targetPhrase.substring(0, index + 1)).length - 1;
            const inputChar = normalizedInput[normalizedIndex];
            const targetChar = normalizedTarget[normalizedIndex];
            
            if (inputChar !== undefined) {
              color = inputChar === targetChar ? Colors.success : Colors.error;
            }
          }
          
          return (
            <Text
              key={index}
              style={[
                styles.phraseChar,
                {
                  color,
                  backgroundColor: index === userInput.length ? `${Colors.primary}30` : 'transparent',
                },
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    );
  };

  const accuracy = calculateAccuracy();
  const progress = Math.min(100, Math.round((userInput.length / targetPhrase.length) * 100));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>⌨️ Typing Challenge</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Type the phrase exactly as shown
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Progress</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{progress}%</Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Accuracy</Text>
          <Text style={[
            styles.statValue,
            { color: accuracy >= 80 ? Colors.success : accuracy >= 50 ? Colors.warning : Colors.error }
          ]}>
            {accuracy}%
          </Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Attempts</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{attempts}</Text>
        </View>
      </View>

      {/* Target Phrase */}
      <View style={[styles.targetBox, { backgroundColor: theme.surface }]}>
        <Text style={[styles.targetLabel, { color: theme.textSecondary }]}>
          Type this:
        </Text>
        {renderPhraseWithHighlights()}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: showError ? Colors.error : theme.border,
            },
          ]}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Start typing..."
          placeholderTextColor={theme.textSecondary}
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus
          multiline
        />
        
        {showError && (
          <Text style={styles.errorText}>
            ✗ That doesn't match. Try again!
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: Colors.primary,
            },
          ]}
        />
      </View>

      {/* Submit Button */}
      <Button
        title="Verify & Dismiss"
        onPress={checkMatch}
        variant="primary"
        size="large"
        fullWidth
        disabled={userInput.length < targetPhrase.length * 0.8}
      />

      {/* Hint */}
      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        💡 Tip: Focus on accuracy, not speed. Small typos will be rejected.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  targetBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  targetLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.sm,
  },
  phraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  phraseChar: {
    ...Typography.titleMedium,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Typography.bodyLarge,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...Typography.labelMedium,
    color: Colors.error,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  hint: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default TypingChallenge;
