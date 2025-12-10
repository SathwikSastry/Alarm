/**
 * AwakenX Navigation
 * App navigation structure with tab and stack navigators
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import { useTheme } from '../contexts';
import {
  HomeScreen,
  CreateAlarmScreen,
  ChallengeScreen,
  SleepTrackingScreen,
  ProfileScreen,
} from '../screens';
import { RootStackParamList, TabParamList } from '../models';
import { Colors, Typography, Spacing } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab bar icons
function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Alarms: '⏰',
    Sleep: '😴',
    Profile: '👤',
  };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

// Tab Navigator
function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          paddingTop: Spacing.xs,
          paddingBottom: Spacing.sm,
          height: 60,
        },
        tabBarLabelStyle: {
          ...Typography.labelSmall,
          marginTop: -4,
        },
      })}
    >
      <Tab.Screen
        name="Alarms"
        component={HomeScreen}
        options={{ tabBarLabel: 'Alarms' }}
      />
      <Tab.Screen
        name="Sleep"
        component={SleepTrackingScreen}
        options={{ tabBarLabel: 'Sleep' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen
          name="CreateAlarm"
          component={CreateAlarmScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Challenge"
          component={ChallengeScreen}
          options={{
            animation: 'fade',
            gestureEnabled: false, // Prevent dismissing with gesture
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default AppNavigator;
