import React, { useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplet,
  Info,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { HydrationSettings, RingtoneId } from '../types';
import { NotificationResult, NotificationStatus } from '../services/notificationService';
import { formatTime24to12, TIME_OPTIONS } from '../utils/time';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HydrationSettings;
  onUpdateSettings: (newSettings: Partial<HydrationSettings>) => void;
  notificationStatus: NotificationStatus;
  onRequestNotifications: () => void;
  onSendTestNotification: () => Promise<NotificationResult> | NotificationResult | void;
  onPlayTestSound: (ringtoneId: RingtoneId, volume: number) => void;
  onStopTestSound: () => void;
  isPlayingTestSound: boolean;
  onTriggerTestReminder: (delaySeconds: number) => void;
  onClearTodayData: () => void;
  onResetAllData: () => void;
  onRestartOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  notificationStatus,
  onRequestNotifications,
  onSendTestNotification,
  onPlayTestSound,
  onStopTestSound,
  isPlayingTestSound,
  onTriggerTestReminder,
  onClearTodayData,
  onResetAllData,
  onRestartOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<'hydration' | 'reminders' | 'sound' | 'notifications' | 'data'>('hydration');
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestNotificationClick = async () => {
    setIsTestingNotif(true);
    setNotificationFeedback(null);
    try {
      const res = await onSendTestNotification();
      if (res && !res.success) {
        setNotificationFeedback({
          type: 'error',
          message: res.error || 'Could not display notification. Please check browser permissions.',
        });
      } else {
        setNotificationFeedback({
          type: 'success',
          message: 'Notification sent! Check your screen or system notification center.',
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown notification error';
      setNotificationFeedback({
        type: 'error',
        message: `Notification failed: ${errorMsg}`,
      });
    } finally {
      setIsTestingNotif(false);
    }
  };

  const goalPresets = [1500, 2000, 2500, 3000, 3500, 4000];
  const intervalPresets = [15, 30, 45, 60, 90, 120];
  const glassPresets = [150, 200, 250, 300, 400, 500];

  const ringtones: { id: RingtoneId; label: string; desc: string }[] = [
    { id: 'crystal', label: 'Crystal Droplets', desc: 'Gentle musical marimba chime' },
    { id: 'zen', label: 'Zen Bell', desc: 'Calming harmonic singing bowl' },
    { id: 'bubble', label: 'Bubble Pulse', desc: 'Playful water drop arpeggio' },
    { id: 'ocean', label: 'Ocean Chime', desc: 'Serene ambient ocean chord' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        id="settings-modal-dialog"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-950/50 relative max-h-[90vh] flex flex-col animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-lg font-bold text-white">
                Waterly Settings
              </h2>
              <p className="text-xs text-slate-400">
                Personalize your hydration rhythm
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={() => {
              onStopTestSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            aria-label="Close settings dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hydration')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'hydration'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Hydration
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'reminders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'sound'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Sound & Tone
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'notifications'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'data'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Data & Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-sm">
          {/* TAB 1: HYDRATION */}
          {activeTab === 'hydration' && (
            <div className="space-y-5 animate-fade-in">
              {/* Name */}
              <div>
                <label htmlFor="settings-username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Your Name / Nickname
                </label>
                <input
                  id="settings-username"
                  type="text"
                  value={settings.userName}
                  onChange={e => onUpdateSettings({ userName: e.target.value })}
                  maxLength={30}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-slate-100 outline-none"
                  placeholder="e.g. Abhishek"
                />
              </div>

              {/* Daily Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="settings-daily-goal" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Daily Water Goal
                  </label>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {settings.dailyGoalMl} ml ({((settings.dailyGoalMl) / 1000).toFixed(1)} L)
                  </span>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {goalPresets.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdateSettings({ dailyGoalMl: val })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        settings.dailyGoalMl === val
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {val} ml
                    </button>
                  ))}
                </div>

                {/* Custom Goal Input */}
                <div className="relative">
                  <input
                    id="settings-daily-goal"
                    type="number"
                    min="500"
                    max="10000"
                    step="50"
                    value={settings.dailyGoalMl}
                    onChange={e => onUpdateSettings({ dailyGoalMl: parseInt(e.target.value, 10) || 2500 })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-slate-100 font-mono outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                    ml / day
                  </span>
                </div>
              </div>

              {/* Default Glass Size */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Default Glass Size (Reminder Log)
                  </span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {settings.defaultGlassAmountMl} ml
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {glassPresets.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdateSettings({ defaultGlassAmountMl: val })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        settings.defaultGlassAmountMl === val
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {val} ml
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-5 animate-fade-in">
              {/* Frequency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Reminder Frequency
                  </span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    Every {settings.reminderIntervalMinutes} minutes
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {intervalPresets.map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdateSettings({ reminderIntervalMinutes: mins })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        settings.reminderIntervalMinutes === mins
                          ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>

                {/* Custom interval */}
                <div className="relative">
                  <input
                    id="settings-reminder-interval"
                    type="number"
                    min="5"
                    max="360"
                    value={settings.reminderIntervalMinutes}
                    onChange={e => onUpdateSettings({ reminderIntervalMinutes: parseInt(e.target.value, 10) || 60 })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-slate-100 font-mono outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                    minutes interval
                  </span>
                </div>
              </div>

              {/* Active Window */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Active Hydration Window
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Waterly will only remind you during your active hours. No alarms while you sleep.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="settings-start-time" className="block text-xs text-slate-400 mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <select
                        id="settings-start-time"
                        value={settings.reminderStartTime}
                        onChange={e => onUpdateSettings({ reminderStartTime: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-white font-mono text-sm outline-none cursor-pointer pr-9"
                      >
                        {(TIME_OPTIONS.includes(settings.reminderStartTime)
                          ? TIME_OPTIONS
                          : [...TIME_OPTIONS, settings.reminderStartTime].sort()
                        ).map(t => (
                          <option key={t} value={t} className="bg-slate-950 text-white font-mono">
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="settings-end-time" className="block text-xs text-slate-400 mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <select
                        id="settings-end-time"
                        value={settings.reminderEndTime}
                        onChange={e => onUpdateSettings({ reminderEndTime: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-white font-mono text-sm outline-none cursor-pointer pr-9"
                      >
                        {(TIME_OPTIONS.includes(settings.reminderEndTime)
                          ? TIME_OPTIONS
                          : [...TIME_OPTIONS, settings.reminderEndTime].sort()
                        ).map(t => (
                          <option key={t} value={t} className="bg-slate-950 text-white font-mono">
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Snooze duration */}
              <div>
                <label htmlFor="settings-snooze-duration" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Snooze Duration
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdateSettings({ snoozeDurationMinutes: mins })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        settings.snoozeDurationMinutes === mins
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Testing Tools */}
              <div className="pt-2 border-t border-slate-800">
                <span className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Test Reminder Simulation
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerTestReminder(0);
                    }}
                    className="py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold text-cyan-300 transition"
                  >
                    Now
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerTestReminder(10);
                    }}
                    className="py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold text-cyan-300 transition"
                  >
                    In 10s
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerTestReminder(30);
                    }}
                    className="py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold text-cyan-300 transition"
                  >
                    In 30s
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOUND */}
          {activeTab === 'sound' && (
            <div className="space-y-5 animate-fade-in">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.soundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                    {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Reminder Sound
                    </span>
                    <span className="text-xs text-slate-400">
                      Play ringtone loop when reminder triggers
                    </span>
                  </div>
                </div>
                <button
                  id="btn-toggle-sound"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                  role="switch"
                  aria-checked={settings.soundEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="settings-volume-slider" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Volume
                  </label>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <input
                  id="settings-volume-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.volume}
                  onChange={e => onUpdateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Ringtone Selection */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Ringtone Melody
                </span>
                <div className="space-y-2">
                  {ringtones.map(r => (
                    <div
                      key={r.id}
                      onClick={() => onUpdateSettings({ ringtoneId: r.id })}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        settings.ringtoneId === r.id
                          ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full border-2 ${settings.ringtoneId === r.id ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`} />
                        <div>
                          <span className="text-xs font-bold block">{r.label}</span>
                          <span className="text-[11px] text-slate-400">{r.desc}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingTestSound && settings.ringtoneId === r.id) {
                            onStopTestSound();
                          } else {
                            onUpdateSettings({ ringtoneId: r.id });
                            onPlayTestSound(r.id, settings.volume);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1 transition"
                      >
                        {isPlayingTestSound && settings.ringtoneId === r.id ? (
                          <>
                            <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Browser Notifications
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      notificationStatus === 'granted'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : notificationStatus === 'denied'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {notificationStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Notifications allow Waterly to alert you when your reminder is due, even if you are browsing another tab or window.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {notificationStatus !== 'granted' ? (
                    <button
                      id="btn-enable-notifications"
                      onClick={async () => {
                        await onRequestNotifications();
                        handleTestNotificationClick();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Allow & Test Notifications</span>
                    </button>
                  ) : (
                    <button
                      id="btn-test-notification"
                      type="button"
                      disabled={isTestingNotif}
                      onClick={handleTestNotificationClick}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-2 ${
                        isTestingNotif
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 cursor-wait'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 active:scale-95'
                      }`}
                    >
                      {isTestingNotif ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Sending Notification...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-cyan-400" />
                          <span>Send Test Notification</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Inline Visual Feedback Message */}
                {notificationFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${
                      notificationFeedback.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                    }`}
                  >
                    {notificationFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">{notificationFeedback.message}</div>
                  </div>
                )}
              </div>

              {notificationStatus === 'denied' && (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                  Notifications are blocked in your browser settings. To enable them, click the padlock/tune icon in your browser URL bar and allow Notifications.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DATA & PRIVACY */}
          {activeTab === 'data' && (
            <div className="space-y-5 animate-fade-in">
              {/* Privacy Notice */}
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-start gap-3 text-cyan-200">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block text-white mb-1">
                    100% On-Device & Private
                  </span>
                  Your hydration logs and reminder preferences remain entirely stored on your device. Waterly does not require an account, cloud database, or send your personal data to any external server.
                </div>
              </div>

              {/* Onboarding Restart */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Welcome Onboarding
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Re-run the initial guided setup wizard
                  </span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onRestartOnboarding();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Start Guide
                </button>
              </div>

              {/* Destructive actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="block text-xs font-semibold uppercase tracking-wider text-rose-400">
                  Data Reset Actions
                </span>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    id="btn-clear-today-settings"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear today's logged water intake?")) {
                        onClearTodayData();
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear Today's Logs</span>
                  </button>

                  <button
                    id="btn-reset-all-data"
                    onClick={() => {
                      if (window.confirm("Reset EVERYTHING to defaults? This will erase all logs, history, and custom settings.")) {
                        onResetAllData();
                        onClose();
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset All Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Save / Close */}
        <div className="pt-3 border-t border-slate-800 shrink-0 text-right">
          <button
            onClick={() => {
              onStopTestSound();
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
