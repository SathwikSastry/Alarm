/**
 * AwakenX Time Picker Component
 * Simple time picker for selecting alarm time
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts';
import { Colors, Typography, Spacing, BorderRadius } from '../constants';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { theme } = useTheme();
  const [hours, minutes] = value.split(':').map(Number);

  const handleHourChange = (hour: number) => {
    Haptics.selectionAsync();
    const newTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onChange(newTime);
  };

  const handleMinuteChange = (minute: number) => {
    Haptics.selectionAsync();
    const newTime = `${hours.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(newTime);
  };

  const renderHourPicker = () => {
    const hourValues = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <ScrollView
        style={styles.pickerColumn}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pickerContent}
      >
        {hourValues.map((hour) => (
          <TouchableOpacity
            key={hour}
            style={[
              styles.pickerItem,
              hour === hours && [styles.pickerItemSelected, { backgroundColor: Colors.primary }],
            ]}
            onPress={() => handleHourChange(hour)}
          >
            <Text
              style={[
                styles.pickerItemText,
                { color: hour === hours ? Colors.white : theme.text },
              ]}
            >
              {hour.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderMinutePicker = () => {
    const minuteValues = Array.from({ length: 12 }, (_, i) => i * 5);
    
    return (
      <ScrollView
        style={styles.pickerColumn}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pickerContent}
      >
        {minuteValues.map((minute) => (
          <TouchableOpacity
            key={minute}
            style={[
              styles.pickerItem,
              minute === minutes && [styles.pickerItemSelected, { backgroundColor: Colors.primary }],
            ]}
            onPress={() => handleMinuteChange(minute)}
          >
            <Text
              style={[
                styles.pickerItemText,
                { color: minute === minutes ? Colors.white : theme.text },
              ]}
            >
              {minute.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={[styles.displayText, { color: theme.text }]}>
          {value}
        </Text>
      </View>
      
      <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.pickerWrapper}>
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>Hour</Text>
          {renderHourPicker()}
        </View>
        
        <Text style={[styles.separator, { color: theme.text }]}>:</Text>
        
        <View style={styles.pickerWrapper}>
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>Minute</Text>
          {renderMinutePicker()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  display: {
    marginBottom: Spacing.lg,
  },
  displayText: {
    ...Typography.displayLarge,
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.sm,
  },
  pickerColumn: {
    height: 200,
  },
  pickerContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  pickerItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  pickerItemText: {
    ...Typography.titleLarge,
    fontWeight: '600',
  },
  separator: {
    ...Typography.displayMedium,
    marginHorizontal: Spacing.md,
  },
});

export default TimePicker;
