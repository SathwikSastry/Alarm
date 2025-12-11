/**
 * AwakenX Card Component
 * Reusable card container with theme support
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { BorderRadius, Spacing } from '../constants';
import { useTheme } from '../contexts';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  style,
  onPress,
  elevated = true,
  padding = 'medium',
}: CardProps) {
  const { theme } = useTheme();

  const paddingMap = {
    none: 0,
    small: Spacing.sm,
    medium: Spacing.md,
    large: Spacing.lg,
  };

  const containerStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: BorderRadius.lg,
    padding: paddingMap[padding],
    ...(elevated && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[containerStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}

export default Card;
