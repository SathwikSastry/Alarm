/**
 * AwakenX Button Component
 * Reusable button with various styles
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Typography } from '../constants';
import { useTheme } from '../contexts';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? Colors.gray400 : Colors.primary,
          },
          text: { color: Colors.white },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? Colors.gray400 : Colors.secondary,
          },
          text: { color: Colors.white },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: disabled ? Colors.gray400 : Colors.primary,
          },
          text: { color: disabled ? Colors.gray400 : Colors.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: disabled ? Colors.gray400 : theme.text },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: disabled ? Colors.gray400 : Colors.error,
          },
          text: { color: Colors.white },
        };
      default:
        return {
          container: { backgroundColor: Colors.primary },
          text: { color: Colors.white },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
          text: { ...Typography.labelMedium },
        };
      case 'large':
        return {
          container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
          text: { ...Typography.titleMedium },
        };
      default:
        return {
          container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
          text: { ...Typography.labelLarge },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              variantStyles.text,
              icon ? styles.textWithIcon : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: Spacing.xs,
  },
});

export default Button;
