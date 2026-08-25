import { DailyLog, DEFAULT_SETTINGS, HydrationHistory, HydrationSettings, ReminderState } from '../types';
import { getTodayDateString } from '../utils/time';

const KEYS = {
  SETTINGS: 'waterly_settings_v1',
  HISTORY: 'waterly_history_v1',
  TODAY: 'waterly_today_v1',
  REMINDER: 'waterly_reminder_v1',
};

// Legacy keys for backward compatibility migration
const LEGACY_KEYS = {
  SETTINGS: 'hydra_settings_v1',
  HISTORY: 'hydra_history_v1',
  TODAY: 'hydra_today_v1',
  REMINDER: 'hydra_reminder_v1',
};

/**
 * Migration helper: retrieves data from current key or migrates from legacy key if found.
 */
function getMigratedItem(currentKey: string, legacyKey: string): string | null {
  try {
    const currentData = localStorage.getItem(currentKey);
    if (currentData) {
      return currentData;
    }
    // Check legacy key
    const legacyData = localStorage.getItem(legacyKey);
    if (legacyData) {
      // Migrate forward
      localStorage.setItem(currentKey, legacyData);
      return legacyData;
    }
    return null;
  } catch (e) {
    console.warn(`Storage migration check failed for ${currentKey}:`, e);
    return null;
  }
}

export const storageService = {
  getSettings(): HydrationSettings {
    try {
      const data = getMigratedItem(KEYS.SETTINGS, LEGACY_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.warn('Failed to load Waterly settings from localStorage:', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: HydrationSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save Waterly settings:', e);
    }
  },

  getHistory(): HydrationHistory {
    try {
      const data = getMigratedItem(KEYS.HISTORY, LEGACY_KEYS.HISTORY);
      if (!data) return {};
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load Waterly history:', e);
      return {};
    }
  },

  saveHistory(history: HydrationHistory): void {
    try {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save Waterly history:', e);
    }
  },

  getTodayLog(goalMl: number): { todayLog: DailyLog; historyUpdated: boolean } {
    const todayStr = getTodayDateString();
    let history = this.getHistory();
    let historyUpdated = false;

    try {
      const data = getMigratedItem(KEYS.TODAY, LEGACY_KEYS.TODAY);
      if (data) {
        const parsed: DailyLog = JSON.parse(data);
        if (parsed.date === todayStr) {
          // Same day
          return { todayLog: parsed, historyUpdated: false };
        } else {
          // Midnight rollover! Archive parsed previous day into history
          history[parsed.date] = parsed;
          this.saveHistory(history);
          historyUpdated = true;
        }
      }
    } catch (e) {
      console.warn('Failed to read todayLog:', e);
    }

    // Initialize fresh log for today
    const freshLog: DailyLog = {
      date: todayStr,
      totalMl: 0,
      goalMl: goalMl || DEFAULT_SETTINGS.dailyGoalMl,
      events: [],
    };
    this.saveTodayLog(freshLog);
    return { todayLog: freshLog, historyUpdated };
  },

  saveTodayLog(todayLog: DailyLog): void {
    try {
      localStorage.setItem(KEYS.TODAY, JSON.stringify(todayLog));
      // Also sync current day in history object for seamless queries
      const history = this.getHistory();
      history[todayLog.date] = todayLog;
      this.saveHistory(history);
    } catch (e) {
      console.warn('Failed to save todayLog:', e);
    }
  },

  getReminderState(): ReminderState | null {
    try {
      const data = getMigratedItem(KEYS.REMINDER, LEGACY_KEYS.REMINDER);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load reminder state:', e);
      return null;
    }
  },

  saveReminderState(state: ReminderState): void {
    try {
      localStorage.setItem(KEYS.REMINDER, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save reminder state:', e);
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(KEYS.TODAY);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.removeItem(KEYS.REMINDER);
      // Also clean legacy keys
      localStorage.removeItem(LEGACY_KEYS.TODAY);
      localStorage.removeItem(LEGACY_KEYS.HISTORY);
      localStorage.removeItem(LEGACY_KEYS.REMINDER);
    } catch (e) {
      console.warn('Failed to clear data:', e);
    }
  },

  resetEverything(): void {
    try {
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.removeItem(KEYS.TODAY);
      localStorage.removeItem(KEYS.HISTORY);
      localStorage.removeItem(KEYS.REMINDER);
      // Also clean legacy keys
      localStorage.removeItem(LEGACY_KEYS.SETTINGS);
      localStorage.removeItem(LEGACY_KEYS.TODAY);
      localStorage.removeItem(LEGACY_KEYS.HISTORY);
      localStorage.removeItem(LEGACY_KEYS.REMINDER);
    } catch (e) {
      console.warn('Failed to reset everything:', e);
    }
  },
};
