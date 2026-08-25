import React from 'react';
import { Bell, Calendar, Droplets, Moon, Settings, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { HydrationSettings, ReminderState } from '../types';
import { formatTime24to12, getGreeting } from '../utils/time';

interface HeaderProps {
  settings: HydrationSettings;
  reminderState: ReminderState;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onQuickTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  reminderState,
  onOpenSettings,
  onOpenHistory,
  onQuickTest,
}) => {
  const greeting = getGreeting();

  return (
    <header id="waterly-header" className="w-full pt-6 pb-4 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 z-20">
      {/* Brand & Greeting */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-white">
          <Droplets className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 ring-2 ring-[#050B18]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
              WATERLY
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wider uppercase">
              Smart Hydration
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {greeting}{settings.userName ? <>, <span className="text-slate-200 font-medium">{settings.userName}</span></> : ''}
          </p>
        </div>
      </div>

      {/* Quick Status Badges & Action Buttons */}
      <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
        {/* Hydration Window status */}
        {reminderState.isOutsideWindow ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/40 text-xs"
            title={`Reminders resume at ${formatTime24to12(settings.reminderStartTime)}`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Resting Window</span>
            <span className="md:hidden">Resting</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Every {settings.reminderIntervalMinutes}m</span>
          </div>
        )}

        {/* Audio status pill */}
        <div
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs"
          title={settings.soundEnabled ? `Sound: ON (${Math.round(settings.volume * 100)}%)` : 'Sound: OFF'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>

        {/* History Modal Trigger */}
        <button
          id="btn-open-history"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="View Hydration History"
        >
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Logs</span>
        </button>

        {/* Quick Test Alert trigger */}
        <button
          id="btn-quick-test-reminder"
          onClick={onQuickTest}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 transition text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          title="Test hydration alert immediately"
          aria-label="Test Alert"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Test Alert</span>
        </button>

        {/* Settings button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="flex items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Open Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
