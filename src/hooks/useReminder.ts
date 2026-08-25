import { useEffect, useMemo, useState } from 'react';
import { HydrationSettings, ReminderState } from '../types';
import { ReminderEngine } from '../services/reminderEngine';

export function useReminder(
  settings: HydrationSettings,
  onAcknowledgeWater: (amountMl: number) => void
) {
  // Keep engine persistent across re-renders
  const engine = useMemo(() => new ReminderEngine(settings), []);

  const [reminderState, setReminderState] = useState<ReminderState>(() => engine.getState());
  const [remainingMs, setRemainingMs] = useState<number>(0);

  // Sync settings whenever they change
  useEffect(() => {
    engine.updateSettings(settings);
  }, [engine, settings]);

  // Subscribe to engine state
  useEffect(() => {
    const unsubscribe = engine.subscribe(newState => {
      setReminderState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, [engine]);

  // Update live remaining countdown ms every 500ms
  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = reminderState.isSnoozed
        ? reminderState.snoozedUntil
        : reminderState.nextReminderAt;

      if (!targetTime || reminderState.isActive) {
        setRemainingMs(0);
      } else {
        const diff = Math.max(0, targetTime - Date.now());
        setRemainingMs(diff);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 500);
    return () => clearInterval(interval);
  }, [reminderState]);

  // Acknowledge reminder action
  const handleAcknowledge = () => {
    engine.acknowledgeReminder();
    onAcknowledgeWater(settings.defaultGlassAmountMl);
  };

  // Snooze reminder
  const handleSnooze = (minutes?: number) => {
    engine.snooze(minutes);
  };

  // Trigger test reminder
  const handleTestReminder = (delaySeconds = 0) => {
    engine.scheduleTestReminder(delaySeconds);
  };

  return {
    reminderState,
    remainingMs,
    handleAcknowledge,
    handleSnooze,
    handleTestReminder,
  };
}
