/**
 * Time utility functions for Waterly
 */

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime24to12(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatTimestampTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatRemainingHuman(ms: number): string {
  if (ms <= 0) return 'due now';
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 1) return 'less than a minute';
  if (totalMinutes === 1) return 'in 1 minute';
  if (totalMinutes < 60) return `in ${totalMinutes} minutes`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `in ${hours}h ${mins}m`;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  return h * 60 + m;
}

export function isInsideHydrationWindow(
  now: Date,
  startTime: string,
  endTime: string
): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes <= endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  }
  // If window wraps across midnight (e.g. 20:00 to 04:00)
  return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
}

export function getNextWindowStartTime(
  now: Date,
  startTime: string
): number {
  const [hStr, mStr] = startTime.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  const next = new Date(now);
  next.setHours(h, m, 0, 0);

  // If start time today has already passed, set to tomorrow
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime();
}

/**
 * Generates all scheduled slot timestamps (in ms) for a given reference day
 */
export function getScheduleSlotsForDay(
  referenceDay: Date,
  startTime: string,
  endTime: string,
  intervalMinutes: number
): number[] {
  const safeInterval = Math.max(1, intervalMinutes);
  const startMins = parseTimeToMinutes(startTime);
  const endMins = parseTimeToMinutes(endTime);

  const start = new Date(referenceDay);
  start.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);

  const end = new Date(referenceDay);
  end.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);

  // If window wraps across midnight (e.g. 22:00 to 06:00)
  if (end.getTime() <= start.getTime()) {
    end.setDate(end.getDate() + 1);
  }

  const intervalMs = safeInterval * 60 * 1000;
  const endMs = end.getTime();
  const slots: number[] = [];

  let current = start.getTime();
  while (current <= endMs) {
    slots.push(current);
    current += intervalMs;
  }

  return slots;
}

export interface ScheduleCalculation {
  nextReminderAt: number;
  isOutsideWindow: boolean;
  windowMessage?: string;
  isSlotDueNow: boolean;
  dueSlotTimestamp: number | null;
}

/**
 * Calculates the exact clock-based next reminder and active window status
 */
export function calculateNextScheduledReminder(
  now: Date,
  startTime: string,
  endTime: string,
  intervalMinutes: number,
  lastTriggeredSlot?: number | null
): ScheduleCalculation {
  const nowMs = now.getTime();
  const inWindow = isInsideHydrationWindow(now, startTime, endTime);

  // Gather slots for yesterday, today, and tomorrow for seamless day boundaries
  const prevDay = new Date(now);
  prevDay.setDate(prevDay.getDate() - 1);

  const nextDay = new Date(now);
  nextDay.setDate(nextDay.getDate() + 1);

  const allSlots = [
    ...getScheduleSlotsForDay(prevDay, startTime, endTime, intervalMinutes),
    ...getScheduleSlotsForDay(now, startTime, endTime, intervalMinutes),
    ...getScheduleSlotsForDay(nextDay, startTime, endTime, intervalMinutes),
  ].sort((a, b) => a - b);

  // Deduplicate timestamps
  const uniqueSlots = Array.from(new Set(allSlots));

  // Check if there is an exact slot due right now (e.g. within 60s grace period and not yet triggered)
  let dueSlotTimestamp: number | null = null;
  let isSlotDueNow = false;

  for (const slotMs of uniqueSlots) {
    if (lastTriggeredSlot && slotMs <= lastTriggeredSlot) {
      continue;
    }
    const diff = nowMs - slotMs;
    // Slot hit within the last 60 seconds
    if (diff >= 0 && diff < 60000) {
      dueSlotTimestamp = slotMs;
      isSlotDueNow = true;
      break;
    }
  }

  // Find the next upcoming slot strictly in the future
  const upcomingSlots = uniqueSlots.filter(slotMs => {
    if (lastTriggeredSlot && slotMs <= lastTriggeredSlot) {
      return false;
    }
    return slotMs > nowMs;
  });

  const nextReminderAt = upcomingSlots.length > 0
    ? upcomingSlots[0]
    : getNextWindowStartTime(now, startTime);

  return {
    nextReminderAt,
    isOutsideWindow: !inWindow,
    windowMessage: inWindow
      ? undefined
      : `Outside hydration window (resumes at ${formatTime24to12(startTime)})`,
    isSlotDueNow,
    dueSlotTimestamp,
  };
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

export function formatShortDate(dateStr: string): string {
  const todayStr = getTodayDateString(new Date());
  if (dateStr === todayStr) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === getTodayDateString(yesterday)) return 'Yesterday';

  const [y, m, d] = dateStr.split('-').map(num => parseInt(num, 10));
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}
