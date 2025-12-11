/**
 * AwakenX Day Selector Component
 * Allows selecting days of the week for repeating alarms
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DayOfWeek } from '../models';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius, DaysOfWeek } from '../constants';

interface DaySelectorProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const { theme } = useTheme();

  const toggleDay = (day: DayOfWeek) => {
    Haptics.selectionAsync();
    
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const selectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([...DaysOfWeek] as DayOfWeek[]);
  };

  const selectWeekdays = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  const selectWeekends = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(['Sat', 'Sun']);
  };

  const clearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {DaysOfWeek.map((day: typeof DaysOfWeek[number]) => {
          const isSelected = selectedDays.includes(day as DayOfWeek);
          
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected ? Colors.primary : theme.surface,
                  borderColor: isSelected ? Colors.primary : theme.border,
                },
              ]}
              onPress={() => toggleDay(day as DayOfWeek)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? Colors.white : theme.text },
                ]}
              >
                {day.charAt(0)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.quickSelectRow}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.surface }]}
          onPress={selectWeekdays}
        >
          <Text style={[styles.quickButtonText, { color: theme.text }]}>
            Weekdays
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.surface }]}
          onPress={selectWeekends}
        >
          <Text style={[styles.quickButtonText, { color: theme.text }]}>
            Weekends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.surface }]}
          onPress={selectAll}
        >
          <Text style={[styles.quickButtonText, { color: theme.text }]}>
            Every day
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.surface }]}
          onPress={clearAll}
        >
          <Text style={[styles.quickButtonText, { color: theme.textSecondary }]}>
            Once
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  dayText: {
    ...Typography.labelLarge,
  },
  quickSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  quickButtonText: {
    ...Typography.labelMedium,
  },
});

export default DaySelector;
