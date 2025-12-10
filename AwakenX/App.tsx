/**
 * AwakenX - The Alarm That Refuses To Lose
 * Smart alarm app with intelligent challenges
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';

import { AppProvider, useTheme } from './src/contexts';
import { AppNavigator } from './src/navigation';
import { NotificationService } from './src/services';

// Suppress specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Inner app component that uses theme
function AppContent() {
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
    }

    // Set up notification response listener
    const subscription = NotificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification response:', data);
      // Handle alarm notification tap - navigate to challenge screen
      // This would typically trigger navigation to the Challenge screen
    });

    return () => {
      subscription.remove();
    };
  };

  return (
    <>
      <StatusBar style={theme.statusBar} />
      <AppNavigator />
    </>
  );
}

// Main app component with providers
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
