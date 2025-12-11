/**
 * AwakenX App Context
 * Global state management for alarms, settings, and user data
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Alarm, User, UserSettings, ChallengeType, DifficultyLevel, ThemeType } from '../models';
import { StorageService, NotificationService } from '../services';
import { generateIdSync } from '../utils';
import { DefaultAlarmSettings, DarkTheme, LightTheme } from '../constants';

// State interface
interface AppState {
  alarms: Alarm[];
  user: User | null;
  settings: UserSettings;
  isLoading: boolean;
  activeAlarmId: string | null;
  onboardingComplete: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALARMS'; payload: Alarm[] }
  | { type: 'ADD_ALARM'; payload: Alarm }
  | { type: 'UPDATE_ALARM'; payload: Alarm }
  | { type: 'DELETE_ALARM'; payload: string }
  | { type: 'TOGGLE_ALARM'; payload: { id: string; enabled: boolean } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_ACTIVE_ALARM'; payload: string | null }
  | { type: 'SET_ONBOARDING_COMPLETE'; payload: boolean };

// Default settings
const defaultSettings: UserSettings = {
  theme: 'dark',
  defaultChallengeLevel: 'medium',
  defaultVibration: 'mild',
  hapticFeedback: true,
  bedtimeReminder: false,
};

// Initial state
const initialState: AppState = {
  alarms: [],
  user: null,
  settings: defaultSettings,
  isLoading: true,
  activeAlarmId: null,
  onboardingComplete: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ALARMS':
      return { ...state, alarms: action.payload };
    case 'ADD_ALARM':
      return { ...state, alarms: [...state.alarms, action.payload] };
    case 'UPDATE_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ALARM':
      return {
        ...state,
        alarms: state.alarms.filter(a => a.id !== action.payload),
      };
    case 'TOGGLE_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(a =>
          a.id === action.payload.id ? { ...a, isEnabled: action.payload.enabled } : a
        ),
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_ACTIVE_ALARM':
      return { ...state, activeAlarmId: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: action.payload };
    default:
      return state;
  }
}

// Context interface
interface AppContextValue {
  state: AppState;
  theme: typeof LightTheme;
  // Alarm actions
  createAlarm: (params: CreateAlarmParams) => Promise<Alarm>;
  updateAlarm: (alarm: Alarm) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  getAlarm: (id: string) => Alarm | undefined;
  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  // User actions
  setUser: (user: User | null) => void;
  // State actions
  setActiveAlarm: (id: string | null) => void;
  completeOnboarding: () => Promise<void>;
  // Utility
  refresh: () => Promise<void>;
}

// Create alarm parameters
interface CreateAlarmParams {
  time: string;
  label?: string;
  days?: string[];
  challengeType?: ChallengeType;
  challengeDifficulty?: DifficultyLevel;
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Get current theme
  const theme = state.settings.theme === 'dark' ? DarkTheme : LightTheme;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load data in parallel
      const [alarms, settings, user, onboardingComplete] = await Promise.all([
        StorageService.getAlarms(),
        StorageService.getSettings(),
        StorageService.getUser(),
        StorageService.isOnboardingComplete(),
      ]);

      dispatch({ type: 'SET_ALARMS', payload: alarms });
      dispatch({ type: 'SET_SETTINGS', payload: settings || defaultSettings });
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: onboardingComplete });

      // Request notification permissions
      await NotificationService.requestPermissions();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createAlarm = useCallback(async (params: CreateAlarmParams): Promise<Alarm> => {
    const now = new Date();
    const newAlarm: Alarm = {
      id: generateIdSync(),
      userId: state.user?.uid || 'local',
      label: params.label || '',
      time: params.time,
      days: (params.days || []) as any[],
      isEnabled: true,
      challenge: {
        type: params.challengeType || 'math',
        difficulty: params.challengeDifficulty || state.settings.defaultChallengeLevel,
      },
      tone: 'default',
      volume: DefaultAlarmSettings.volume,
      vibration: DefaultAlarmSettings.vibration,
      vibrationPattern: DefaultAlarmSettings.vibrationPattern,
      volumeRampUp: DefaultAlarmSettings.volumeRampUp,
      snoozeEnabled: DefaultAlarmSettings.snoozeEnabled,
      snoozeDuration: DefaultAlarmSettings.snoozeDuration,
      isBackupAlarm: false,
      createdAt: now,
      updatedAt: now,
    };

    await StorageService.saveAlarm(newAlarm);
    await NotificationService.scheduleAlarm(newAlarm);
    
    dispatch({ type: 'ADD_ALARM', payload: newAlarm });
    return newAlarm;
  }, [state.user, state.settings]);

  const updateAlarm = useCallback(async (alarm: Alarm): Promise<void> => {
    const updatedAlarm = { ...alarm, updatedAt: new Date() };
    
    await StorageService.saveAlarm(updatedAlarm);
    await NotificationService.scheduleAlarm(updatedAlarm);
    
    dispatch({ type: 'UPDATE_ALARM', payload: updatedAlarm });
  }, []);

  const deleteAlarm = useCallback(async (id: string): Promise<void> => {
    await StorageService.deleteAlarm(id);
    await NotificationService.cancelAlarm(id);
    
    dispatch({ type: 'DELETE_ALARM', payload: id });
  }, []);

  const toggleAlarm = useCallback(async (id: string): Promise<void> => {
    const alarm = state.alarms.find(a => a.id === id);
    if (!alarm) return;

    const updatedAlarm = { ...alarm, isEnabled: !alarm.isEnabled, updatedAt: new Date() };
    
    await StorageService.saveAlarm(updatedAlarm);
    await NotificationService.scheduleAlarm(updatedAlarm);
    
    dispatch({ type: 'TOGGLE_ALARM', payload: { id, enabled: updatedAlarm.isEnabled } });
  }, [state.alarms]);

  const getAlarm = useCallback((id: string): Alarm | undefined => {
    return state.alarms.find(a => a.id === id);
  }, [state.alarms]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>): Promise<void> => {
    const newSettings = { ...state.settings, ...updates };
    
    await StorageService.saveSettings(newSettings);
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  }, [state.settings]);

  const setUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
    if (user) {
      StorageService.saveUser(user);
    }
  }, []);

  const setActiveAlarm = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ALARM', payload: id });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await StorageService.setOnboardingComplete();
    dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: true });
  }, []);

  const refresh = useCallback(async () => {
    await loadInitialData();
  }, []);

  const value: AppContextValue = {
    state,
    theme,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getAlarm,
    updateSettings,
    setUser,
    setActiveAlarm,
    completeOnboarding,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the app context
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Hook for just theme
export function useTheme() {
  const { theme, state } = useApp();
  return { theme, isDark: state.settings.theme === 'dark' };
}

// Hook for alarms
export function useAlarms() {
  const { state, createAlarm, updateAlarm, deleteAlarm, toggleAlarm, getAlarm } = useApp();
  return {
    alarms: state.alarms,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getAlarm,
  };
}

// Hook for settings
export function useSettings() {
  const { state, updateSettings } = useApp();
  return {
    settings: state.settings,
    updateSettings,
  };
}
