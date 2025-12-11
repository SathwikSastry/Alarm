/**
 * AwakenX Memory Challenge Component
 * Classic memory matching game to dismiss alarm
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DifficultyLevel, ChallengeResult, MemoryCard } from '../models';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius, ChallengeConfig } from '../constants';
import { generateMemoryCards, formatDuration } from '../utils';

interface MemoryChallengeProps {
  difficulty: DifficultyLevel;
  onComplete: (result: ChallengeResult) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function MemoryChallenge({ difficulty, onComplete }: MemoryChallengeProps) {
  const { theme } = useTheme();
  const config = ChallengeConfig.memory;
  
  const pairCount = config[difficulty].cards / 2;
  const timeLimit = config.defaultTimeLimit;
  
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize cards
  useEffect(() => {
    setCards(generateMemoryCards(pairCount));
  }, [pairCount]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - reset the game
          handleTimeout();
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempts]);

  const handleTimeout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setAttempts((prev) => prev + 1);
    setCards(generateMemoryCards(pairCount));
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeRemaining(timeLimit);
  };

  const handleCardPress = useCallback((index: number) => {
    if (isProcessing) return;
    if (flippedIndices.includes(index)) return;
    if (cards[index].isMatched) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Mark card as flipped
    setCards((prev) => 
      prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    );

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves((prev) => prev + 1);

      const [first, second] = newFlipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.value === secondCard.value) {
        // Match found!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setCards((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, isMatched: true } : card
          )
        );
        
        const newMatchedPairs = matchedPairs + 1;
        setMatchedPairs(newMatchedPairs);
        setFlippedIndices([]);
        setIsProcessing(false);

        // Check if all pairs matched
        if (newMatchedPairs === pairCount) {
          const result: ChallengeResult = {
            type: 'memory',
            difficulty,
            success: true,
            timeTaken: Math.round((Date.now() - startTime) / 1000),
            attempts: attempts + 1,
            completedAt: new Date(),
          };
          onComplete(result);
        }
      } else {
        // No match - flip back after delay
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 800);
      }
    }
  }, [cards, flippedIndices, isProcessing, matchedPairs, pairCount, difficulty, startTime, attempts, onComplete]);

  // Calculate card dimensions based on grid
  const totalCards = pairCount * 2;
  const columns = totalCards <= 8 ? 4 : 4;
  const cardSize = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * (columns - 1)) / columns;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🧠 Memory Game</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Match all pairs to dismiss
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Time</Text>
          <Text style={[
            styles.statValue,
            { color: timeRemaining <= 10 ? Colors.error : theme.text }
          ]}>
            {formatDuration(timeRemaining)}
          </Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pairs</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {matchedPairs}/{pairCount}
          </Text>
        </View>
        
        <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Moves</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>{moves}</Text>
        </View>
      </View>

      {/* Card Grid */}
      <View style={styles.cardGrid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              {
                width: cardSize,
                height: cardSize,
                backgroundColor: card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? Colors.success
                    : Colors.primary
                  : theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => handleCardPress(index)}
            disabled={card.isFlipped || card.isMatched || isProcessing}
            activeOpacity={0.7}
          >
            {(card.isFlipped || card.isMatched) ? (
              <Text style={styles.cardEmoji}>{card.value}</Text>
            ) : (
              <Text style={[styles.cardBack, { color: theme.textSecondary }]}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={[styles.instructionBox, { backgroundColor: theme.surface }]}>
        <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
          Tap cards to flip them. Find matching pairs before time runs out!
        </Text>
      </View>
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
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.titleLarge,
    fontWeight: '700',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardBack: {
    fontSize: 32,
    fontWeight: '700',
  },
  instructionBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  instructionText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});

export default MemoryChallenge;
