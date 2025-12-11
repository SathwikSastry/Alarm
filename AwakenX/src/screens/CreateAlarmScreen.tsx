/**
 * AwakenX Create/Edit Alarm Screen
 * Screen for creating or editing an alarm
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useApp, useAlarms, useTheme } from '../contexts';
import { Button, TimePicker, DaySelector, ChallengeSelector, Card } from '../components';
import { Alarm, DayOfWeek, ChallengeConfig, RootStackParamList } from '../models';
import { Colors, Typography, Spacing, BorderRadius, DefaultAlarmSettings } from '../constants';
import { formatTime } from '../utils';

type CreateAlarmRouteProp = RouteProp<RootStackParamList, 'CreateAlarm'>;
type CreateAlarmNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateAlarm'>;

export function CreateAlarmScreen() {
  const navigation = useNavigation<CreateAlarmNavigationProp>();
  const route = useRoute<CreateAlarmRouteProp>();
  const { theme } = useTheme();
  const { createAlarm, updateAlarm, deleteAlarm, getAlarm } = useAlarms();
  const { state } = useApp();
  
  const alarmId = route.params?.alarmId;
  const isEditing = !!alarmId;
  const existingAlarm = alarmId ? getAlarm(alarmId) : null;

  // Form state
  const [time, setTime] = useState(existingAlarm?.time || formatTime(new Date()));
  const [label, setLabel] = useState(existingAlarm?.label || '');
  const [days, setDays] = useState<DayOfWeek[]>(existingAlarm?.days || []);
  const [challengeConfig, setChallengeConfig] = useState<ChallengeConfig>(
    existingAlarm?.challenge || { type: 'math', difficulty: 'medium' }
  );
  const [vibration, setVibration] = useState(existingAlarm?.vibration ?? DefaultAlarmSettings.vibration);
  const [snoozeEnabled, setSnoozeEnabled] = useState(existingAlarm?.snoozeEnabled ?? DefaultAlarmSettings.snoozeEnabled);
  const [volumeRampUp, setVolumeRampUp] = useState(existingAlarm?.volumeRampUp ?? DefaultAlarmSettings.volumeRampUp);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isEditing && existingAlarm) {
        const updatedAlarm: Alarm = {
          ...existingAlarm,
          time,
          label,
          days,
          challenge: challengeConfig,
          vibration,
          snoozeEnabled,
          volumeRampUp,
          updatedAt: new Date(),
        };
        await updateAlarm(updatedAlarm);
      } else {
        await createAlarm({
          time,
          label,
          days,
          challengeType: challengeConfig.type,
          challengeDifficulty: challengeConfig.difficulty,
        });
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving alarm:', error);
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!alarmId) return;

    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAlarm(alarmId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isEditing ? 'Edit Alarm' : 'New Alarm'}
          </Text>
        </View>

        {/* Time Picker */}
        <Card style={styles.section}>
          <TimePicker value={time} onChange={setTime} />
        </Card>

        {/* Label */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Label</Text>
          <TextInput
            style={[
              styles.labelInput,
              { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border },
            ]}
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Wake up for work"
            placeholderTextColor={theme.textSecondary}
            maxLength={50}
          />
        </Card>

        {/* Repeat Days */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Repeat</Text>
          <DaySelector selectedDays={days} onChange={setDays} />
        </Card>

        {/* Challenge */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Wake-up Challenge
          </Text>
          <ChallengeSelector
            config={challengeConfig}
            onChange={setChallengeConfig}
            isPremium={state.user?.isPremium}
          />
        </Card>

        {/* Additional Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                📳 Vibration
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Vibrate when alarm rings
              </Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: Colors.gray400, true: Colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                💤 Snooze
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Allow 5-minute snooze (max 3 times)
              </Text>
            </View>
            <Switch
              value={snoozeEnabled}
              onValueChange={setSnoozeEnabled}
              trackColor={{ false: Colors.gray400, true: Colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                🔊 Volume Ramp-up
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Gradually increase alarm volume
              </Text>
            </View>
            <Switch
              value={volumeRampUp}
              onValueChange={setVolumeRampUp}
              trackColor={{ false: Colors.gray400, true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={isEditing ? 'Save Changes' : 'Create Alarm'}
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            loading={isSaving}
          />

          {isEditing && (
            <Button
              title="Delete Alarm"
              onPress={handleDelete}
              variant="danger"
              size="medium"
              fullWidth
              style={styles.deleteButton}
            />
          )}

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="medium"
            fullWidth
          />
        </View>
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
  labelInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.bodyLarge,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  settingDescription: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  deleteButton: {
    marginTop: Spacing.sm,
  },
});

export default CreateAlarmScreen;
