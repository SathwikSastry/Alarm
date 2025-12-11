/**
 * AwakenX Sleep Tracking Screen
 * Dashboard for sleep tracking and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts';
import { StorageService } from '../services';
import { SleepData, WeeklyStats } from '../models';
import { Card, Button } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SleepTrackingScreen() {
  const { theme } = useTheme();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.getSleepData();
      setSleepData(data);
      
      // Calculate weekly stats
      if (data.length > 0) {
        const stats = calculateWeeklyStats(data);
        setWeeklyStats(stats);
      }
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWeeklyStats = (data: SleepData[]): WeeklyStats | null => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const weekData = data.filter(d => d.date >= weekStart);
    
    if (weekData.length === 0) return null;
    
    const avgDuration = weekData.reduce((sum, d) => sum + d.sleepDuration, 0) / weekData.length;
    const avgQuality = weekData.reduce((sum, d) => sum + d.sleepQuality, 0) / weekData.length;
    
    return {
      weekStart,
      weekEnd: now,
      totalAlarms: weekData.length,
      successfulWakeUps: weekData.filter(d => d.sleepQuality >= 60).length,
      averageTimeToDismiss: 0,
      averageSnoozeCount: 0,
      mostUsedChallenge: 'math',
      averageSleepDuration: avgDuration,
      sleepQualityTrend: avgQuality >= 70 ? 'improving' : avgQuality >= 50 ? 'stable' : 'declining',
    };
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>😴</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Sleep Data Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Sleep tracking data will appear here after you use your alarms regularly.
      </Text>
    </View>
  );

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 80) return Colors.success;
    if (quality >= 60) return Colors.warning;
    return Colors.error;
  };

  const getTrendEmoji = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  // Sample data for visualization (since we don't have real data yet)
  const sampleBarData = [
    { day: 'Mon', hours: 7.2 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 6.2 },
    { day: 'Fri', hours: 7.8 },
    { day: 'Sat', hours: 8.5 },
    { day: 'Sun', hours: 8.0 },
  ];

  const maxHours = Math.max(...sampleBarData.map(d => d.hours));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Sleep Tracking
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Monitor your sleep patterns
          </Text>
        </View>

        {sleepData.length === 0 && !isLoading ? (
          renderEmptyState()
        ) : (
          <>
            {/* Weekly Overview */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                This Week
              </Text>
              
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                  <Text style={styles.statIcon}>🛏️</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {weeklyStats ? formatDuration(weeklyStats.averageSleepDuration) : '7h 15m'}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Avg. Sleep
                  </Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                  <Text style={styles.statIcon}>⭐</Text>
                  <Text style={[styles.statValue, { color: getQualityColor(75) }]}>
                    75%
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Sleep Score
                  </Text>
                </View>
                
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                  <Text style={styles.statIcon}>
                    {getTrendEmoji(weeklyStats?.sleepQualityTrend || 'stable')}
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {weeklyStats?.sleepQualityTrend || 'Stable'}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Trend
                  </Text>
                </View>
              </View>
            </Card>

            {/* Sleep Duration Chart */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Sleep Duration
              </Text>
              
              <View style={styles.chartContainer}>
                {sampleBarData.map((item, index) => (
                  <View key={item.day} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.hours / maxHours) * 120,
                          backgroundColor: item.hours >= 7 ? Colors.success : item.hours >= 6 ? Colors.warning : Colors.error,
                        },
                      ]}
                    />
                    <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                      {item.day}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>7+ hours</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>6-7 hours</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>&lt;6 hours</Text>
                </View>
              </View>
            </Card>

            {/* Tips */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                💡 Sleep Tips
              </Text>
              
              <View style={[styles.tipBox, { backgroundColor: `${Colors.info}15` }]}>
                <Text style={[styles.tipText, { color: theme.text }]}>
                  Maintain a consistent sleep schedule, even on weekends. Try going to bed and waking up at the same time every day.
                </Text>
              </View>
            </Card>

            {/* Premium Upsell */}
            <Card style={[styles.section, { backgroundColor: `${Colors.primary}10` }]}>
              <View style={styles.premiumContent}>
                <Text style={[styles.premiumTitle, { color: theme.text }]}>
                  ⭐ Unlock Advanced Sleep Analytics
                </Text>
                <Text style={[styles.premiumDescription, { color: theme.textSecondary }]}>
                  Get detailed sleep stage analysis, smart wake-up suggestions, and personalized sleep coaching.
                </Text>
                <Button
                  title="Get Premium"
                  variant="primary"
                  size="medium"
                  onPress={() => {}}
                />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headlineMedium,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.headlineSmall,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.titleMedium,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.labelSmall,
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: Spacing.md,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 28,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    ...Typography.labelSmall,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...Typography.labelSmall,
  },
  tipBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tipText: {
    ...Typography.bodyMedium,
    lineHeight: 22,
  },
  premiumContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  premiumTitle: {
    ...Typography.titleMedium,
    textAlign: 'center',
  },
  premiumDescription: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});

export default SleepTrackingScreen;
