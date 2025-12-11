/**
 * AwakenX Challenge Selector Component
 * Allows selecting challenge type and difficulty
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChallengeType, DifficultyLevel, ChallengeConfig } from '../models';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius, ChallengeDisplayNames } from '../constants';

interface ChallengeSelectorProps {
  config: ChallengeConfig;
  onChange: (config: ChallengeConfig) => void;
  isPremium?: boolean;
}

const challengeIcons: Record<ChallengeType, string> = {
  math: '🧮',
  shake: '📱',
  qr: '📷',
  memory: '🧠',
  steps: '🚶',
  typing: '⌨️',
  reading: '📖',
  colorSequence: '🎨',
  random: '🎲',
};

const difficultyColors: Record<DifficultyLevel, string> = {
  easy: Colors.success,
  medium: Colors.warning,
  hard: Colors.error,
  insane: Colors.accent,
};

const premiumChallenges: ChallengeType[] = ['colorSequence', 'reading', 'steps'];

export function ChallengeSelector({ config, onChange, isPremium = false }: ChallengeSelectorProps) {
  const { theme } = useTheme();

  const handleTypeChange = (type: ChallengeType) => {
    if (premiumChallenges.includes(type) && !isPremium) {
      // Show premium modal - for now just return
      return;
    }
    
    Haptics.selectionAsync();
    onChange({ ...config, type });
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    Haptics.selectionAsync();
    onChange({ ...config, difficulty });
  };

  const challenges: ChallengeType[] = [
    'math', 'shake', 'qr', 'memory', 'typing', 'colorSequence', 'steps', 'reading', 'random'
  ];

  const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'insane'];

  return (
    <View style={styles.container}>
      {/* Challenge Type Selection */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Challenge Type
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.challengeScroll}
      >
        {challenges.map((type) => {
          const isSelected = config.type === type;
          const isLocked = premiumChallenges.includes(type) && !isPremium;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.challengeCard,
                {
                  backgroundColor: isSelected ? Colors.primary : theme.surface,
                  borderColor: isSelected ? Colors.primary : theme.border,
                  opacity: isLocked ? 0.5 : 1,
                },
              ]}
              onPress={() => handleTypeChange(type)}
            >
              <Text style={styles.challengeIcon}>
                {challengeIcons[type]}
                {isLocked && ' 🔒'}
              </Text>
              <Text
                style={[
                  styles.challengeName,
                  { color: isSelected ? Colors.white : theme.text },
                ]}
                numberOfLines={2}
              >
                {ChallengeDisplayNames[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Difficulty Selection */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>
        Difficulty
      </Text>
      
      <View style={styles.difficultyRow}>
        {difficulties.map((difficulty) => {
          const isSelected = config.difficulty === difficulty;
          
          return (
            <TouchableOpacity
              key={difficulty}
              style={[
                styles.difficultyButton,
                {
                  backgroundColor: isSelected ? difficultyColors[difficulty] : theme.surface,
                  borderColor: difficultyColors[difficulty],
                },
              ]}
              onPress={() => handleDifficultyChange(difficulty)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  { color: isSelected ? Colors.white : difficultyColors[difficulty] },
                ]}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Challenge description */}
      <View style={[styles.descriptionBox, { backgroundColor: theme.surface }]}>
        <Text style={[styles.descriptionTitle, { color: theme.text }]}>
          {challengeIcons[config.type]} {ChallengeDisplayNames[config.type]}
        </Text>
        <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
          {getChallengeDescription(config.type, config.difficulty)}
        </Text>
      </View>
    </View>
  );
}

function getChallengeDescription(type: ChallengeType, difficulty: DifficultyLevel): string {
  switch (type) {
    case 'math':
      return `Solve ${difficulty === 'easy' ? '3 simple' : difficulty === 'medium' ? '3 moderate' : difficulty === 'hard' ? '5 complex' : '5 very complex'} math problems to dismiss the alarm.`;
    case 'shake':
      return `Shake your phone ${difficulty === 'easy' ? '20' : difficulty === 'medium' ? '50' : difficulty === 'hard' ? '100' : '200'} times to dismiss the alarm.`;
    case 'qr':
      return 'Scan a registered QR code in another room to dismiss the alarm.';
    case 'memory':
      return `Match ${difficulty === 'easy' ? '2' : difficulty === 'medium' ? '4' : difficulty === 'hard' ? '6' : '8'} pairs of cards to dismiss the alarm.`;
    case 'typing':
      return `Type a ${difficulty === 'easy' ? 'short' : difficulty === 'medium' ? 'medium' : 'long'} phrase correctly to dismiss the alarm.`;
    case 'steps':
      return `Walk ${difficulty === 'easy' ? '15' : difficulty === 'medium' ? '30' : difficulty === 'hard' ? '50' : '100'} steps to dismiss the alarm.`;
    case 'colorSequence':
      return `Repeat a ${difficulty === 'easy' ? '4' : difficulty === 'medium' ? '6' : difficulty === 'hard' ? '8' : '12'}-color sequence to dismiss the alarm.`;
    case 'reading':
      return 'Read a quote aloud using speech recognition to dismiss the alarm.';
    case 'random':
      return 'A random challenge will be selected each time the alarm rings.';
    default:
      return 'Complete the challenge to dismiss the alarm.';
  }
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.xs,
  },
  challengeScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  challengeCard: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  challengeIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  challengeName: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyText: {
    ...Typography.labelMedium,
  },
  descriptionBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  descriptionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.xs,
  },
  descriptionText: {
    ...Typography.bodySmall,
  },
});

export default ChallengeSelector;
