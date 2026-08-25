import { HydrationSettings, ReminderState } from '../types';
import { calculateNextScheduledReminder } from '../utils/time';
import { audioService } from './audioService';
import { notificationService } from './notificationService';
import { storageService } from './storageService';

export class ReminderEngine {
  private state: ReminderState;
  private settings: HydrationSettings;
  private timerId: number | null = null;
  private listeners: Set<(state: ReminderState) => void> = new Set();
  private testTimerId: number | null = null;

  constructor(settings: HydrationSettings) {
    this.settings = settings;

    // Load initial state from storage or compute fresh from clock
    const stored = storageService.getReminderState();
    const now = new Date();
    const nowMs = now.getTime();

    // Check if we should resume an active or snoozed state
    if (stored?.isActive && stored.triggeredAt && nowMs - stored.triggeredAt < 5 * 60 * 1000) {
      this.state = stored;
    } else if (stored?.isSnoozed && stored.snoozedUntil && stored.snoozedUntil > nowMs) {
      this.state = stored;
    } else {
      const calc = calculateNextScheduledReminder(
        now,
        this.settings.reminderStartTime,
        this.settings.reminderEndTime,
        this.settings.reminderIntervalMinutes,
        stored?.lastTriggeredSlot
      );

      this.state = {
        isActive: false,
        triggeredAt: null,
        nextReminderAt: calc.nextReminderAt,
        isSnoozed: false,
        snoozedUntil: null,
        isOutsideWindow: calc.isOutsideWindow,
        windowMessage: calc.windowMessage,
        lastTriggeredSlot: stored?.lastTriggeredSlot || null,
      };

      // If opening right on an active window slot that wasn't triggered yet
      if (calc.isSlotDueNow && calc.dueSlotTimestamp) {
        this.state.isActive = true;
        this.state.triggeredAt = nowMs;
        this.state.lastTriggeredSlot = calc.dueSlotTimestamp;
        this.state.nextReminderAt = null;
      }
    }

    this.init();
  }

  private init(): void {
    this.startLoop();

    // Listen for tab focus/visibility to immediately sync clock schedule
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.tick();
    }
  };

  public updateSettings(newSettings: HydrationSettings): void {
    const intervalChanged = this.settings.reminderIntervalMinutes !== newSettings.reminderIntervalMinutes;
    const windowChanged =
      this.settings.reminderStartTime !== newSettings.reminderStartTime ||
      this.settings.reminderEndTime !== newSettings.reminderEndTime;

    this.settings = newSettings;

    // Recalculate schedule if settings changed and not in an active ring or snooze
    if ((intervalChanged || windowChanged) && !this.state.isActive && !this.state.isSnoozed) {
      const now = new Date();
      const calc = calculateNextScheduledReminder(
        now,
        this.settings.reminderStartTime,
        this.settings.reminderEndTime,
        this.settings.reminderIntervalMinutes,
        this.state.lastTriggeredSlot
      );

      this.setState({
        ...this.state,
        nextReminderAt: calc.nextReminderAt,
        isOutsideWindow: calc.isOutsideWindow,
        windowMessage: calc.windowMessage,
      });
    }
  }

  public getState(): ReminderState {
    return this.state;
  }

  public subscribe(listener: (state: ReminderState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: ReminderState): void {
    this.state = newState;
    storageService.saveReminderState(newState);
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.state));
  }

  private startLoop(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    const now = new Date();
    const nowMs = now.getTime();

    // 1. If actively alerting, ensure audio is playing if sound is enabled
    if (this.state.isActive) {
      if (this.settings.soundEnabled && !audioService.isSoundPlaying()) {
        audioService.startRingtone(this.settings.ringtoneId, this.settings.volume);
      }
      return;
    }

    // 2. Check snooze expiration
    if (this.state.isSnoozed && this.state.snoozedUntil) {
      if (nowMs >= this.state.snoozedUntil) {
        this.triggerReminder();
        return;
      }
    }

    // 3. Clock-based schedule evaluation
    if (!this.state.isSnoozed) {
      const calc = calculateNextScheduledReminder(
        now,
        this.settings.reminderStartTime,
        this.settings.reminderEndTime,
        this.settings.reminderIntervalMinutes,
        this.state.lastTriggeredSlot
      );

      // Check if an active window slot is due right now
      if (calc.isSlotDueNow && calc.dueSlotTimestamp) {
        this.triggerReminder(calc.dueSlotTimestamp);
        return;
      }

      // Check if scheduled reminder time reached
      if (this.state.nextReminderAt && nowMs >= this.state.nextReminderAt) {
        this.triggerReminder(this.state.nextReminderAt);
        return;
      }

      // Keep next reminder time, window status, and message in sync with clock
      if (
        this.state.nextReminderAt !== calc.nextReminderAt ||
        this.state.isOutsideWindow !== calc.isOutsideWindow ||
        this.state.windowMessage !== calc.windowMessage
      ) {
        this.setState({
          ...this.state,
          nextReminderAt: calc.nextReminderAt,
          isOutsideWindow: calc.isOutsideWindow,
          windowMessage: calc.windowMessage,
        });
      }
    }
  }

  public triggerReminder(slotTimestamp?: number): void {
    const nowMs = Date.now();
    const slot = slotTimestamp || this.state.nextReminderAt || nowMs;

    this.setState({
      isActive: true,
      triggeredAt: nowMs,
      nextReminderAt: null,
      isSnoozed: false,
      snoozedUntil: null,
      isOutsideWindow: false,
      windowMessage: undefined,
      lastTriggeredSlot: slot,
    });

    // Start Ringtone if sound enabled
    if (this.settings.soundEnabled) {
      audioService.startRingtone(this.settings.ringtoneId, this.settings.volume);
    }

    // Send Browser Notification if enabled
    if (this.settings.notificationsEnabled) {
      notificationService.sendHydrationNotification(
        'Time to hydrate! 💧',
        'Your body is asking for some water. Take a refreshing sip now.'
      );
    }
  }

  public acknowledgeReminder(): void {
    // 1. Stop ringtone immediately
    audioService.stopRingtone();

    // 2. Derive next clock-based reminder slot
    const now = new Date();
    const calc = calculateNextScheduledReminder(
      now,
      this.settings.reminderStartTime,
      this.settings.reminderEndTime,
      this.settings.reminderIntervalMinutes,
      this.state.lastTriggeredSlot || now.getTime()
    );

    this.setState({
      isActive: false,
      triggeredAt: null,
      nextReminderAt: calc.nextReminderAt,
      isSnoozed: false,
      snoozedUntil: null,
      isOutsideWindow: calc.isOutsideWindow,
      windowMessage: calc.windowMessage,
      lastTriggeredSlot: this.state.lastTriggeredSlot,
    });
  }

  public snooze(minutes?: number): void {
    const snoozeMins = minutes || this.settings.snoozeDurationMinutes || 10;
    audioService.stopRingtone();

    const snoozedUntil = Date.now() + snoozeMins * 60 * 1000;

    this.setState({
      isActive: false,
      triggeredAt: null,
      nextReminderAt: snoozedUntil,
      isSnoozed: true,
      snoozedUntil,
      isOutsideWindow: false,
      windowMessage: undefined,
      lastTriggeredSlot: this.state.lastTriggeredSlot,
    });
  }

  public scheduleTestReminder(delaySeconds: number): void {
    if (this.testTimerId) {
      clearTimeout(this.testTimerId);
    }

    if (delaySeconds === 0) {
      this.triggerReminder();
      return;
    }

    this.setState({
      ...this.state,
      nextReminderAt: Date.now() + delaySeconds * 1000,
      isSnoozed: false,
      snoozedUntil: null,
    });

    this.testTimerId = window.setTimeout(() => {
      this.triggerReminder();
    }, delaySeconds * 1000);
  }

  public destroy(): void {
    if (this.timerId) clearInterval(this.timerId);
    if (this.testTimerId) clearTimeout(this.testTimerId);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleVisibilityChange);
    }
    audioService.stopRingtone();
    this.listeners.clear();
  }
}
