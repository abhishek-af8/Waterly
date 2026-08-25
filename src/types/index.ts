export type HydrationSource = 'reminder' | 'quick_add' | 'custom';

export type RingtoneId = 'crystal' | 'zen' | 'bubble' | 'ocean';

export interface HydrationEvent {
  id: string;
  timestamp: number; // Date.now()
  amountMl: number;
  source: HydrationSource;
  note?: string;
}

export interface HydrationSettings {
  userName: string;
  dailyGoalMl: number;
  reminderIntervalMinutes: number;
  reminderStartTime: string; // "08:00"
  reminderEndTime: string;   // "22:00"
  defaultGlassAmountMl: number;
  soundEnabled: boolean;
  volume: number; // 0.0 - 1.0
  ringtoneId: RingtoneId;
  notificationsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  snoozeDurationMinutes: number;
}

export interface ReminderState {
  isActive: boolean;
  triggeredAt: number | null;
  nextReminderAt: number | null;
  isSnoozed: boolean;
  snoozedUntil: number | null;
  isOutsideWindow: boolean;
  windowMessage?: string;
  lastTriggeredSlot?: number | null;
}

export interface DailyLog {
  date: string; // "YYYY-MM-DD"
  totalMl: number;
  goalMl: number;
  events: HydrationEvent[];
}

export type HydrationHistory = Record<string, DailyLog>;

export const DEFAULT_SETTINGS: HydrationSettings = {
  userName: '',
  dailyGoalMl: 2500,
  reminderIntervalMinutes: 60,
  reminderStartTime: '08:00',
  reminderEndTime: '22:00',
  defaultGlassAmountMl: 250,
  soundEnabled: true,
  volume: 0.7,
  ringtoneId: 'crystal',
  notificationsEnabled: false,
  hasCompletedOnboarding: false,
  snoozeDurationMinutes: 10,
};
