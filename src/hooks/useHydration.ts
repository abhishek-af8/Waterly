import { useCallback, useEffect, useRef, useState } from 'react';
import { DailyLog, DEFAULT_SETTINGS, HydrationEvent, HydrationHistory, HydrationSettings, HydrationSource } from '../types';
import { storageService } from '../services/storageService';
import { triggerGoalConfetti } from '../utils/confetti';
import { audioService } from '../services/audioService';

export function useHydration() {
  const [settings, setSettingsState] = useState<HydrationSettings>(() => storageService.getSettings());
  const [todayLog, setTodayLog] = useState<DailyLog>(() => {
    const init = storageService.getTodayLog(DEFAULT_SETTINGS.dailyGoalMl);
    return init.todayLog;
  });
  const [history, setHistory] = useState<HydrationHistory>(() => storageService.getHistory());
  const prevReachedGoalRef = useRef<boolean>(todayLog.totalMl >= todayLog.goalMl && todayLog.totalMl > 0);

  // Sync settings updates
  const updateSettings = useCallback((newSettings: Partial<HydrationSettings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      storageService.saveSettings(updated);
      // Also update todayLog goalMl if dailyGoalMl changed
      if (newSettings.dailyGoalMl && newSettings.dailyGoalMl !== prev.dailyGoalMl) {
        setTodayLog(currentLog => {
          const nextLog = { ...currentLog, goalMl: newSettings.dailyGoalMl! };
          storageService.saveTodayLog(nextLog);
          return nextLog;
        });
      }
      return updated;
    });
  }, []);

  // Periodic check for midnight rollover
  useEffect(() => {
    const checkMidnight = () => {
      const { todayLog: refreshedLog, historyUpdated } = storageService.getTodayLog(settings.dailyGoalMl);
      if (historyUpdated) {
        setTodayLog(refreshedLog);
        setHistory(storageService.getHistory());
      }
    };

    const interval = setInterval(checkMidnight, 30000); // every 30s
    return () => clearInterval(interval);
  }, [settings.dailyGoalMl]);

  // Log water intake
  const logWater = useCallback((amountMl: number, source: HydrationSource, note?: string) => {
    if (amountMl <= 0) return;

    // Play quick water drop sound
    if (settings.soundEnabled) {
      audioService.playWaterDropSfx(settings.volume);
    }

    setTodayLog(prev => {
      const newEvent: HydrationEvent = {
        id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        amountMl,
        source,
        note,
      };

      const newTotal = prev.totalMl + amountMl;
      const updated: DailyLog = {
        ...prev,
        totalMl: newTotal,
        events: [newEvent, ...prev.events],
      };

      storageService.saveTodayLog(updated);

      // Check if newly reached daily goal!
      if (newTotal >= updated.goalMl && !prevReachedGoalRef.current) {
        prevReachedGoalRef.current = true;
        triggerGoalConfetti();
      }

      return updated;
    });

    // Update history cache
    setHistory(storageService.getHistory());
  }, [settings.soundEnabled, settings.volume]);

  // Delete an event (undo accidental log)
  const deleteEvent = useCallback((eventId: string) => {
    setTodayLog(prev => {
      const target = prev.events.find(e => e.id === eventId);
      if (!target) return prev;

      const newTotal = Math.max(0, prev.totalMl - target.amountMl);
      const updated: DailyLog = {
        ...prev,
        totalMl: newTotal,
        events: prev.events.filter(e => e.id !== eventId),
      };

      if (newTotal < updated.goalMl) {
        prevReachedGoalRef.current = false;
      }

      storageService.saveTodayLog(updated);
      return updated;
    });
    setHistory(storageService.getHistory());
  }, []);

  // Clear today's logs only
  const clearToday = useCallback(() => {
    setTodayLog(prev => {
      const cleared: DailyLog = {
        ...prev,
        totalMl: 0,
        events: [],
      };
      prevReachedGoalRef.current = false;
      storageService.saveTodayLog(cleared);
      return cleared;
    });
    setHistory(storageService.getHistory());
  }, []);

  // Reset all data & history
  const resetAllData = useCallback(() => {
    storageService.resetEverything();
    const defaults = DEFAULT_SETTINGS;
    setSettingsState(defaults);
    const init = storageService.getTodayLog(defaults.dailyGoalMl);
    setTodayLog(init.todayLog);
    setHistory({});
    prevReachedGoalRef.current = false;
  }, []);

  const percentage = todayLog.goalMl > 0 ? Math.min(100, Math.round((todayLog.totalMl / todayLog.goalMl) * 100)) : 0;
  const isGoalReached = todayLog.totalMl >= todayLog.goalMl && todayLog.totalMl > 0;

  return {
    settings,
    updateSettings,
    todayLog,
    history,
    logWater,
    deleteEvent,
    clearToday,
    resetAllData,
    percentage,
    isGoalReached,
  };
}
