import React from 'react';
import { AlarmClock, Bell, Check, Droplets, Volume2, VolumeX } from 'lucide-react';
import { HydrationSettings } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  settings: HydrationSettings;
  onAcknowledge: () => void;
  onSnooze: (minutes: number) => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  settings,
  onAcknowledge,
  onSnooze,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="reminder-alert-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="reminder-alert-title"
      aria-describedby="reminder-alert-desc"
    >
      <div
        id="reminder-alert-modal"
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-cyan-500/30 text-center relative overflow-hidden animate-alert-pulse"
      >
        {/* Ambient Top Glow / Ripple */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Water Droplet Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-xl shadow-cyan-500/40 mb-6 animate-bounce">
          <Droplets className="w-12 h-12 sm:w-14 sm:h-14" />
          <span className="absolute inset-0 rounded-full border-4 border-cyan-300/40 animate-ping" />
        </div>

        {/* Alert Title */}
        <h2
          id="reminder-alert-title"
          className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2"
        >
          Time to Hydrate
        </h2>

        {/* Friendly Subtitle */}
        <p
          id="reminder-alert-desc"
          className="text-slate-300 text-sm sm:text-base max-w-xs mx-auto mb-5"
        >
          Your body is asking for some water. Take a refreshing sip now.
        </p>

        {/* Audio Ringtone Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold mb-8 shadow-inner">
          {settings.soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Reminder ringtone playing...</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Silent alert active</span>
            </>
          )}
        </div>

        {/* Critical Primary Action Button: "Yeah, I had my glass of water" */}
        <div className="space-y-3">
          <button
            id="btn-acknowledge-hydration"
            onClick={onAcknowledge}
            autoFocus
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:via-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-base sm:text-lg shadow-xl shadow-cyan-500/40 transition-all duration-150 active:scale-98 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-cyan-300 cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>
              Yeah, I had my glass of water (+{settings.defaultGlassAmountMl} ml)
            </span>
          </button>

          {/* Secondary Action: Snooze */}
          <button
            id="btn-snooze-reminder-alert"
            onClick={() => onSnooze(settings.snoozeDurationMinutes || 10)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <AlarmClock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Snooze for {settings.snoozeDurationMinutes || 10} minutes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
