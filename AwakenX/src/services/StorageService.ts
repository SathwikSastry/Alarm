/**
 * AwakenX Storage Service
 * Handles local data persistence using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, User, UserSettings, SleepData, AnalyticsEvent, RegisteredQRCode } from '../models';

// Storage keys
const STORAGE_KEYS = {
  ALARMS: '@awakenx/alarms',
  USER: '@awakenx/user',
  USER_SETTINGS: '@awakenx/settings',
  SLEEP_DATA: '@awakenx/sleep',
  ANALYTICS: '@awakenx/analytics',
  QR_CODES: '@awakenx/qrcodes',
  ONBOARDING_COMPLETE: '@awakenx/onboarding',
  LAST_ALARM_TRIGGER: '@awakenx/last_trigger',
};

/**
 * Storage service for managing local data
 */
export const StorageService = {
  // ==================== ALARMS ====================
  
  /**
   * Get all alarms
   */
  async getAlarms(): Promise<Alarm[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS);
      if (!data) return [];
      const alarms = JSON.parse(data) as Alarm[];
      return alarms.map(alarm => ({
        ...alarm,
        createdAt: new Date(alarm.createdAt),
        updatedAt: new Date(alarm.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting alarms:', error);
      return [];
    }
  },
  
  /**
   * Get a single alarm by ID
   */
  async getAlarm(id: string): Promise<Alarm | null> {
    const alarms = await this.getAlarms();
    return alarms.find(a => a.id === id) || null;
  },
  
  /**
   * Save a new alarm
   */
  async saveAlarm(alarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const existingIndex = alarms.findIndex(a => a.id === alarm.id);
      
      if (existingIndex >= 0) {
        alarms[existingIndex] = { ...alarm, updatedAt: new Date() };
      } else {
        alarms.push(alarm);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
    } catch (error) {
      console.error('Error saving alarm:', error);
      throw error;
    }
  },
  
  /**
   * Delete an alarm
   */
  async deleteAlarm(id: string): Promise<void> {
    try {
      const alarms = await this.getAlarms();
      const filtered = alarms.filter(a => a.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting alarm:', error);
      throw error;
    }
  },
  
  /**
   * Toggle alarm enabled state
   */
  async toggleAlarm(id: string): Promise<Alarm | null> {
    try {
      const alarms = await this.getAlarms();
      const alarm = alarms.find(a => a.id === id);
      
      if (!alarm) return null;
      
      alarm.isEnabled = !alarm.isEnabled;
      alarm.updatedAt = new Date();
      
      await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
      return alarm;
    } catch (error) {
      console.error('Error toggling alarm:', error);
      throw error;
    }
  },
  
  // ==================== USER ====================
  
  /**
   * Get user data
   */
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (!data) return null;
      const user = JSON.parse(data) as User;
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        premiumExpiresAt: user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : undefined,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
  
  /**
   * Save user data
   */
  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },
  
  // ==================== SETTINGS ====================
  
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (!data) return null;
      return JSON.parse(data) as UserSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },
  
  /**
   * Save user settings
   */
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },
  
  // ==================== SLEEP DATA ====================
  
  /**
   * Get all sleep data
   */
  async getSleepData(): Promise<SleepData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_DATA);
      if (!data) return [];
      const sleepData = JSON.parse(data) as SleepData[];
      return sleepData.map(sd => ({
        ...sd,
        date: new Date(sd.date),
        bedTime: new Date(sd.bedTime),
        wakeTime: new Date(sd.wakeTime),
      }));
    } catch (error) {
      console.error('Error getting sleep data:', error);
      return [];
    }
  },
  
  /**
   * Save sleep data
   */
  async saveSleepData(sleepData: SleepData): Promise<void> {
    try {
      const allData = await this.getSleepData();
      const existingIndex = allData.findIndex(sd => sd.id === sleepData.id);
      
      if (existingIndex >= 0) {
        allData[existingIndex] = sleepData;
      } else {
        allData.push(sleepData);
      }
      
      // Keep only last 90 days of data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      const filtered = allData.filter(sd => sd.date >= cutoffDate);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_DATA, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error saving sleep data:', error);
      throw error;
    }
  },
  
  // ==================== ANALYTICS ====================
  
  /**
   * Get analytics events
   */
  async getAnalytics(): Promise<AnalyticsEvent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS);
      if (!data) return [];
      const analytics = JSON.parse(data) as AnalyticsEvent[];
      return analytics.map(a => ({
        ...a,
        date: new Date(a.date),
        actualDismissTime: new Date(a.actualDismissTime),
      }));
    } catch (error) {
      console.error('Error getting analytics:', error);
      return [];
    }
  },
  
  /**
   * Save analytics event
   */
  async saveAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const allEvents = await this.getAnalytics();
      allEvents.push(event);
      
      // Keep only last 180 days of analytics
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 180);
      const filtered = allEvents.filter(e => e.date >= cutoffDate);
      
      await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error saving analytics:', error);
      throw error;
    }
  },
  
  // ==================== QR CODES ====================
  
  /**
   * Get registered QR codes
   */
  async getQRCodes(): Promise<RegisteredQRCode[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.QR_CODES);
      if (!data) return [];
      const codes = JSON.parse(data) as RegisteredQRCode[];
      return codes.map(c => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
    } catch (error) {
      console.error('Error getting QR codes:', error);
      return [];
    }
  },
  
  /**
   * Save a QR code registration
   */
  async saveQRCode(qrCode: RegisteredQRCode): Promise<void> {
    try {
      const codes = await this.getQRCodes();
      codes.push(qrCode);
      await AsyncStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw error;
    }
  },
  
  /**
   * Delete a QR code
   */
  async deleteQRCode(id: string): Promise<void> {
    try {
      const codes = await this.getQRCodes();
      const filtered = codes.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
  },
  
  // ==================== ONBOARDING ====================
  
  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Mark onboarding as complete
   */
  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error setting onboarding complete:', error);
    }
  },
  
  // ==================== UTILITIES ====================
  
  /**
   * Clear all stored data (for debugging/reset)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export default StorageService;
