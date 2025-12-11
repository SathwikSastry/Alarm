/**
 * AwakenX Profile Screen
 * User profile, settings, and statistics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp, useTheme, useSettings } from '../contexts';
import { StorageService } from '../services';
import { Card, Button } from '../components';
import { AnalyticsEvent } from '../models';
import { Colors, Typography, Spacing, BorderRadius, SubscriptionPricing, ChallengeDisplayNames } from '../constants';

export function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const { state } = useApp();
  const { settings, updateSettings } = useSettings();
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeToggle = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const handleHapticToggle = () => {
    updateSettings({ hapticFeedback: !settings.hapticFeedback });
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your alarms, sleep data, and analytics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAll();
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  // Calculate stats
  const totalAlarms = analytics.length;
  const successfulWakeUps = analytics.filter(a => a.successChallenge).length;
  const avgTimeToDismiss = totalAlarms > 0
    ? Math.round(analytics.reduce((sum, a) => sum + a.timeTakenToDismiss, 0) / totalAlarms)
    : 0;
  
  // Most used challenge
  const challengeCounts: Record<string, number> = {};
  analytics.forEach(a => {
    challengeCounts[a.challengeUsed] = (challengeCounts[a.challengeUsed] || 0) + 1;
  });
  const mostUsedChallenge = Object.entries(challengeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'math';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Profile
          </Text>
        </View>

        {/* User Info */}
        <Card style={styles.section}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>
                {state.user?.displayName?.charAt(0)?.toUpperCase() || '👤'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {state.user?.displayName || 'AwakenX User'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {state.user?.email || 'local@device'}
              </Text>
              {state.user?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📊 Your Statistics
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {totalAlarms}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Alarms
              </Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {totalAlarms > 0 ? Math.round((successfulWakeUps / totalAlarms) * 100) : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Success Rate
              </Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {avgTimeToDismiss}s
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Avg. Dismiss
              </Text>
            </View>
          </View>

          <View style={[styles.favoriteChallengeBox, { backgroundColor: theme.surface }]}>
            <Text style={[styles.favoriteLabel, { color: theme.textSecondary }]}>
              Most Used Challenge
            </Text>
            <Text style={[styles.favoriteValue, { color: theme.text }]}>
              🎯 {ChallengeDisplayNames[mostUsedChallenge]}
            </Text>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ⚙️ Settings
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                🌙 Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: Colors.gray400, true: Colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                📳 Haptic Feedback
              </Text>
            </View>
            <Switch
              value={settings.hapticFeedback}
              onValueChange={handleHapticToggle}
              trackColor={{ false: Colors.gray400, true: Colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              🔔 Notification Settings
            </Text>
            <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              🔊 Default Alarm Sound
            </Text>
            <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Premium */}
        {!state.user?.isPremium && (
          <Card style={[styles.section, styles.premiumCard]}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <Text style={[styles.premiumTitle, { color: Colors.white }]}>
                Upgrade to Premium
              </Text>
              <Text style={[styles.premiumDescription, { color: 'rgba(255,255,255,0.8)' }]}>
                Unlock advanced challenges, smart wake-up AI, sleep analytics, and more!
              </Text>
              <View style={styles.pricingRow}>
                <View style={styles.priceOption}>
                  <Text style={styles.priceValue}>{SubscriptionPricing.monthly.displayPrice}</Text>
                  <Text style={styles.pricePeriod}>Monthly</Text>
                </View>
                <View style={[styles.priceOption, styles.priceOptionHighlight]}>
                  <Text style={[styles.priceValue, { color: Colors.primary }]}>
                    {SubscriptionPricing.yearly.displayPrice}
                  </Text>
                  <Text style={[styles.pricePeriod, { color: Colors.primary }]}>Yearly</Text>
                  <Text style={styles.saveBadge}>Save 44%</Text>
                </View>
              </View>
              <Button
                title="Get Premium"
                variant="outline"
                size="large"
                fullWidth
                onPress={() => {}}
                style={{ borderColor: Colors.white }}
                textStyle={{ color: Colors.white }}
              />
            </View>
          </Card>
        )}

        {/* About & Support */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ℹ️ About
          </Text>

          <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              📖 Terms of Service
            </Text>
            <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              🔒 Privacy Policy
            </Text>
            <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              💬 Contact Support
            </Text>
            <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>
            ⚠️ Danger Zone
          </Text>
          
          <Button
            title="Clear All Data"
            variant="danger"
            size="medium"
            fullWidth
            onPress={handleClearData}
          />
        </Card>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          AwakenX v1.0.0
        </Text>
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
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '600',
  },
  userDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  userName: {
    ...Typography.titleLarge,
    marginBottom: 2,
  },
  userEmail: {
    ...Typography.bodySmall,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  premiumBadgeText: {
    ...Typography.labelSmall,
    color: Colors.white,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.titleLarge,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.labelSmall,
    marginTop: 2,
    textAlign: 'center',
  },
  favoriteChallengeBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  favoriteLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.xs,
  },
  favoriteValue: {
    ...Typography.titleMedium,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyLarge,
  },
  settingArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  divider: {
    height: 1,
  },
  premiumCard: {
    backgroundColor: Colors.primary,
  },
  premiumContent: {
    alignItems: 'center',
  },
  premiumIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  premiumTitle: {
    ...Typography.headlineSmall,
    marginBottom: Spacing.xs,
  },
  premiumDescription: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 100,
  },
  priceOptionHighlight: {
    backgroundColor: Colors.white,
  },
  priceValue: {
    ...Typography.titleMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  pricePeriod: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.8)',
  },
  saveBadge: {
    ...Typography.labelSmall,
    color: Colors.success,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  versionText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

export default ProfileScreen;
