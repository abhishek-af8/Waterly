import React from 'react';
import { AlarmClock, Bell, BellOff, Clock, Moon, Play, Timer } from 'lucide-react';
import { HydrationSettings, ReminderState } from '../types';
import { formatCountdown, formatRemainingHuman, formatTime24to12 } from '../utils/time';

interface NextReminderCardProps {
  settings: HydrationSettings;
  reminderState: ReminderState;
  remainingMs: number;
  onTriggerNow: () => void;
  onSnooze: (mins: number) => void;
}

export const NextReminderCard: React.FC<NextReminderCardProps> = ({
  settings,
  reminderState,
  remainingMs,
  onTriggerNow,
  onSnooze,
}) => {
  const isOutside = reminderState.isOutsideWindow;
  const isSnoozed = reminderState.isSnoozed;

  return (
    <div
      id="next-reminder-card"
      className="w-full h-full min-h-[170px] p-5 sm:p-6 rounded-[28px] bg-black/30 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header: Badge, Status, and Alert Now Action */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-2xl border shrink-0 transition-colors ${
              isOutside
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : isSnoozed
                ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
            }`}
          >
            {isOutside ? (
              <Moon className="w-4.5 h-4.5" />
            ) : isSnoozed ? (
              <AlarmClock className="w-4.5 h-4.5 text-indigo-400" />
            ) : (
              <Timer className="w-4.5 h-4.5 text-cyan-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
                {isOutside
                  ? 'Hydration Window Paused'
                  : isSnoozed
                  ? 'Reminder Snoozed'
                  : 'Next Hydration Reminder'}
              </span>
              {!isOutside && !isSnoozed && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee] shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isOutside
                ? `Resumes at ${formatTime24to12(settings.reminderStartTime)}`
                : isSnoozed
                ? `Ring in ${formatRemainingHuman(remainingMs)}`
                : `Every ${settings.reminderIntervalMinutes} mins`}
            </p>
          </div>
        </div>

        {/* Top-Right Alert Action */}
        <button
          id="btn-trigger-now"
          onClick={onTriggerNow}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)] shrink-0 active:scale-95 cursor-pointer"
          title="Trigger reminder alert immediately"
        >
          <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
          <span>Alert Now</span>
        </button>
      </div>

      {/* Main Countdown Time / Status Display */}
      <div className="my-3 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <div>
          {isOutside ? (
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-amber-300 font-mono tracking-tight">
                Resting Mode
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Active: {formatTime24to12(settings.reminderStartTime)} – {formatTime24to12(settings.reminderEndTime)}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                {formatCountdown(remainingMs)}
              </span>
              <span className="text-xs text-cyan-400 font-mono">
                ({formatRemainingHuman(remainingMs)})
              </span>
            </div>
          )}
        </div>

        {/* Snooze option if active & not outside */}
        {!isOutside && (
          <button
            id="btn-snooze-card"
            onClick={() => onSnooze(settings.snoozeDurationMinutes || 10)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
            title={`Snooze reminder for ${settings.snoozeDurationMinutes || 10} minutes`}
          >
            <AlarmClock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Snooze {settings.snoozeDurationMinutes || 10}m</span>
          </button>
        )}
      </div>
    </div>
  );
};
