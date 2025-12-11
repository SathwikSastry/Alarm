/**
 * AwakenX Home Screen
 * Main screen showing list of alarms
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp, useAlarms, useTheme } from '../contexts';
import { AlarmCard } from '../components';
import { Alarm, RootStackParamList } from '../models';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, isDark } = useTheme();
  const { alarms, toggleAlarm } = useAlarms();
  const { state } = useApp();

  // Sort alarms by time
  const sortedAlarms = [...alarms].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  const enabledAlarms = sortedAlarms.filter(a => a.isEnabled);
  const disabledAlarms = sortedAlarms.filter(a => !a.isEnabled);

  const handleAlarmPress = (alarm: Alarm) => {
    navigation.navigate('CreateAlarm', { alarmId: alarm.id });
  };

  const handleToggleAlarm = (alarmId: string) => {
    toggleAlarm(alarmId);
  };

  const handleAddAlarm = () => {
    navigation.navigate('CreateAlarm', {});
  };

  const renderAlarm = ({ item }: { item: Alarm }) => (
    <AlarmCard
      alarm={item}
      onPress={() => handleAlarmPress(item)}
      onToggle={() => handleToggleAlarm(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⏰</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Alarms Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Tap the + button to create your first alarm
      </Text>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Good {getTimeOfDay()}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            AwakenX
          </Text>
        </View>
        {state.user?.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>⭐ Premium</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      {alarms.length > 0 && (
        <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.primary }]}>
              {enabledAlarms.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {alarms.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {getNextAlarmTime(enabledAlarms)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Next
            </Text>
          </View>
        </View>
      )}

      {/* Alarm List */}
      {alarms.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sortedAlarms}
          renderItem={renderAlarm}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            enabledAlarms.length > 0 ? (
              renderSectionHeader(`${enabledAlarms.length} Active Alarm${enabledAlarms.length > 1 ? 's' : ''}`)
            ) : null
          }
        />
      )}

      {/* Add Alarm FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.primary }]}
        onPress={handleAddAlarm}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getNextAlarmTime(alarms: Alarm[]): string {
  if (alarms.length === 0) return '--:--';
  
  // Simple next alarm - just return the earliest enabled alarm
  const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));
  return sorted[0]?.time || '--:--';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    ...Typography.bodySmall,
  },
  title: {
    ...Typography.headlineLarge,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  premiumText: {
    ...Typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.titleLarge,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.labelSmall,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    ...Typography.labelMedium,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.headlineSmall,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: Colors.white,
    fontWeight: '400',
    marginTop: -2,
  },
});

export default HomeScreen;
