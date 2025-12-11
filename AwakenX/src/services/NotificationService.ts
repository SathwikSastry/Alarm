/**
 * AwakenX Notification Service
 * Handles alarm scheduling and push notifications using Expo Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm, DayOfWeek } from '../models';
import { parseTime } from '../utils';
import { NotificationProjectId } from '../constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Day of week mapping for scheduling
 */
const DAY_MAP: Record<DayOfWeek, number> = {
  'Sun': 1,
  'Mon': 2,
  'Tue': 3,
  'Wed': 4,
  'Thu': 5,
  'Fri': 6,
  'Sat': 7,
};

/**
 * Notification service for managing alarm notifications
 */
export const NotificationService = {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get notification permissions');
      return false;
    }

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4C6FFF',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        sound: 'default',
      });
    }

    return true;
  },

  /**
   * Schedule an alarm notification
   */
  async scheduleAlarm(alarm: Alarm): Promise<string[]> {
    // Cancel any existing notifications for this alarm
    await this.cancelAlarm(alarm.id);

    if (!alarm.isEnabled) {
      return [];
    }

    const { hours, minutes } = parseTime(alarm.time);
    const notificationIds: string[] = [];

    const notificationContent: Notifications.NotificationContentInput = {
      title: '⏰ AwakenX',
      body: alarm.label || 'Time to wake up!',
      data: {
        alarmId: alarm.id,
        time: alarm.time,
        label: alarm.label,
        challengeType: alarm.challenge.type,
      },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'alarm',
    };

    if (alarm.days.length === 0) {
      // One-time alarm - schedule for the next occurrence
      const now = new Date();
      const alarmDate = new Date();
      alarmDate.setHours(hours, minutes, 0, 0);

      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: {
          date: alarmDate,
          channelId: 'alarms',
        },
        identifier: `alarm-${alarm.id}-once`,
      });
      notificationIds.push(id);
    } else {
      // Repeating alarm - schedule for each selected day
      for (const day of alarm.days) {
        const weekday = DAY_MAP[day];
        
        const id = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: {
            weekday,
            hour: hours,
            minute: minutes,
            repeats: true,
            channelId: 'alarms',
          },
          identifier: `alarm-${alarm.id}-${day}`,
        });
        notificationIds.push(id);
      }
    }

    return notificationIds;
  },

  /**
   * Cancel all notifications for an alarm
   */
  async cancelAlarm(alarmId: string): Promise<void> {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of allNotifications) {
      if (notification.identifier.startsWith(`alarm-${alarmId}`)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Schedule a snooze notification
   */
  async scheduleSnooze(alarm: Alarm, minutes: number): Promise<string> {
    const snoozeDate = new Date();
    snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Snooze Over!',
        body: alarm.label || 'Time to wake up - no more snoozing!',
        data: {
          alarmId: alarm.id,
          time: alarm.time,
          label: alarm.label,
          challengeType: alarm.challenge.type,
          isSnooze: true,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        date: snoozeDate,
        channelId: 'alarms',
      },
      identifier: `snooze-${alarm.id}`,
    });

    return id;
  },

  /**
   * Cancel a snooze notification
   */
  async cancelSnooze(alarmId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(`snooze-${alarmId}`);
  },

  /**
   * Schedule a bedtime reminder
   */
  async scheduleBedtimeReminder(time: string, enabled: boolean): Promise<string | null> {
    await Notifications.cancelScheduledNotificationAsync('bedtime-reminder');

    if (!enabled) {
      return null;
    }

    const { hours, minutes } = parseTime(time);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Bedtime Reminder',
        body: 'Time to start winding down for a good night\'s sleep!',
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
        channelId: 'alarms',
      },
      identifier: 'bedtime-reminder',
    });

    return id;
  },

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Get push notification token
   */
  async getPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: NotificationProjectId,
      });
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Present a local notification immediately
   */
  async presentLocalNotification(title: string, body: string): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Immediate
    });
  },
};

export default NotificationService;
