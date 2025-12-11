/**
 * AwakenX Challenge Screen
 * Full-screen challenge that must be completed to dismiss alarm
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useApp, useTheme } from '../contexts';
import { StorageService } from '../services';
import { ChallengeResult, RootStackParamList, ChallengeType, AnalyticsEvent } from '../models';
import { MathChallenge, ShakeChallenge, MemoryChallenge, TypingChallenge } from '../challenges';
import { Colors, Typography, Spacing, ChallengeDisplayNames } from '../constants';
import { generateIdSync } from '../utils';

type ChallengeRouteProp = RouteProp<RootStackParamList, 'Challenge'>;
type ChallengeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Challenge'>;

export function ChallengeScreen() {
  const navigation = useNavigation<ChallengeNavigationProp>();
  const route = useRoute<ChallengeRouteProp>();
  const { theme } = useTheme();
  const { setActiveAlarm, state } = useApp();
  
  const { alarmId, challengeConfig } = route.params;
  const [challengeType, setChallengeType] = useState<ChallengeType>(challengeConfig.type);
  const [startTime] = useState(new Date());

  // Handle random challenge selection
  useEffect(() => {
    if (challengeConfig.type === 'random') {
      const availableChallenges: ChallengeType[] = ['math', 'shake', 'memory', 'typing'];
      const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
      setChallengeType(randomChallenge);
    }
  }, [challengeConfig.type]);

  // Prevent back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Prevent going back without completing challenge
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleChallengeComplete = async (result: ChallengeResult) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Save analytics
    const analyticsEvent: AnalyticsEvent = {
      id: generateIdSync(),
      userId: state.user?.uid || 'local',
      alarmId,
      date: new Date(),
      scheduledTime: '', // Would be set from alarm
      actualDismissTime: new Date(),
      timeTakenToDismiss: result.timeTaken,
      snoozeCount: 0,
      challengeUsed: result.type,
      challengeDifficulty: result.difficulty,
      successChallenge: result.success,
      attemptCount: result.attempts,
    };
    
    await StorageService.saveAnalyticsEvent(analyticsEvent);
    
    // Clear active alarm
    setActiveAlarm(null);
    
    // Navigate back to home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderChallenge = () => {
    const difficulty = challengeConfig.difficulty;

    switch (challengeType) {
      case 'math':
        return (
          <MathChallenge
            difficulty={difficulty}
            onComplete={handleChallengeComplete}
          />
        );
      case 'shake':
        return (
          <ShakeChallenge
            difficulty={difficulty}
            onComplete={handleChallengeComplete}
          />
        );
      case 'memory':
        return (
          <MemoryChallenge
            difficulty={difficulty}
            onComplete={handleChallengeComplete}
          />
        );
      case 'typing':
        return (
          <TypingChallenge
            difficulty={difficulty}
            onComplete={handleChallengeComplete}
          />
        );
      default:
        // Fallback to math
        return (
          <MathChallenge
            difficulty={difficulty}
            onComplete={handleChallengeComplete}
          />
        );
    }
  };

  // If still selecting random challenge
  if (challengeConfig.type === 'random' && challengeType === 'random') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style={theme.statusBar} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🎲</Text>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Selecting random challenge...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBar} />
      
      {/* Warning Banner */}
      <View style={[styles.warningBanner, { backgroundColor: Colors.error }]}>
        <Text style={styles.warningText}>
          ⚠️ Complete the challenge to dismiss the alarm
        </Text>
      </View>

      {/* Challenge Content */}
      <View style={styles.challengeContainer}>
        {renderChallenge()}
      </View>

      {/* Info Footer */}
      <View style={[styles.footer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          🔒 {ChallengeDisplayNames[challengeType]} • {challengeConfig.difficulty.toUpperCase()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...Typography.titleLarge,
  },
  warningBanner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  warningText: {
    ...Typography.labelMedium,
    color: Colors.white,
    fontWeight: '600',
  },
  challengeContainer: {
    flex: 1,
  },
  footer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.labelSmall,
  },
});

export default ChallengeScreen;
