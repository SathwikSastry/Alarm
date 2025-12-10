/**
 * AwakenX AlarmCard Component
 * Displays alarm information in a card format
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Alarm } from '../models';
import { Card } from './Card';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, ChallengeDisplayNames } from '../constants';
import { formatDays, getTimeUntilAlarm } from '../utils';

interface AlarmCardProps {
  alarm: Alarm;
  onPress: () => void;
  onToggle: () => void;
}

export function AlarmCard({ alarm, onPress, onToggle }: AlarmCardProps) {
  const { theme } = useTheme();

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const timeUntil = alarm.isEnabled ? getTimeUntilAlarm(alarm.time, alarm.days) : '';

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text
            style={[
              styles.time,
              { color: alarm.isEnabled ? theme.text : theme.textSecondary },
            ]}
          >
            {alarm.time}
          </Text>
          {alarm.label ? (
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              {alarm.label}
            </Text>
          ) : null}
          <Text style={[styles.days, { color: theme.textSecondary }]}>
            {formatDays(alarm.days)}
          </Text>
        </View>
        
        <View style={styles.rightSection}>
          <Switch
            value={alarm.isEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: Colors.gray400, true: Colors.primary }}
            thumbColor={Colors.white}
          />
          {alarm.isEnabled && timeUntil && (
            <Text style={[styles.timeUntil, { color: Colors.primary }]}>
              In {timeUntil}
            </Text>
          )}
        </View>
      </View>
      
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.challengeBadge}>
          <Text style={styles.challengeText}>
            🎯 {ChallengeDisplayNames[alarm.challenge.type]}
          </Text>
        </View>
        {alarm.vibration && (
          <Text style={styles.featureText}>📳</Text>
        )}
        {alarm.snoozeEnabled && (
          <Text style={styles.featureText}>💤</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  time: {
    ...Typography.displaySmall,
    fontWeight: '600',
  },
  label: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
  },
  days: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  timeUntil: {
    ...Typography.labelSmall,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  challengeBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  challengeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  featureText: {
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
});

export default AlarmCard;
