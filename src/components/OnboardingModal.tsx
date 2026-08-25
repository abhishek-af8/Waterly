import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Clock,
  Droplets,
  Heart,
  Sliders,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { HydrationSettings } from '../types';
import { NotificationStatus } from '../services/notificationService';
import { formatTime24to12, TIME_OPTIONS } from '../utils/time';

interface OnboardingModalProps {
  isOpen: boolean;
  settings: HydrationSettings;
  onUpdateSettings: (newSettings: Partial<HydrationSettings>) => void;
  onFinishOnboarding: () => void;
  onRequestNotifications: () => void;
  onUnlockAudio: () => void;
  notificationStatus: NotificationStatus;
}

const PRESET_GOALS = [2000, 2500, 3000, 3500, 4000];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onFinishOnboarding,
  onRequestNotifications,
  onUnlockAudio,
  notificationStatus,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Custom daily goal state
  const [isCustomGoal, setIsCustomGoal] = useState<boolean>(() => !PRESET_GOALS.includes(settings.dailyGoalMl));
  const [customGoalInput, setCustomGoalInput] = useState<string>(() =>
    !PRESET_GOALS.includes(settings.dailyGoalMl) ? String(settings.dailyGoalMl) : '2500'
  );
  const [customGoalError, setCustomGoalError] = useState<string>('');

  // Custom active window state
  const [isCustomizingWindow, setIsCustomizingWindow] = useState(false);
  const [tempStartTime, setTempStartTime] = useState(settings.reminderStartTime);
  const [tempEndTime, setTempEndTime] = useState(settings.reminderEndTime);

  if (!isOpen) return null;

  const handleNext = () => {
    onUnlockAudio();

    // If on Step 2 (Goal) and using custom, validate the custom input
    if (step === 2 && isCustomGoal) {
      const parsed = parseInt(customGoalInput, 10);
      if (isNaN(parsed) || parsed < 500 || parsed > 10000) {
        setCustomGoalError('Please enter a goal between 500 and 10,000 ml');
        return;
      }
      onUpdateSettings({ dailyGoalMl: parsed });
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onFinishOnboarding();
    }
  };

  const handleEnableAll = async () => {
    onUnlockAudio();
    onRequestNotifications();
    onUpdateSettings({ soundEnabled: true, notificationsEnabled: true });
    setTimeout(() => {
      onFinishOnboarding();
    }, 400);
  };

  return (
    <div
      id="onboarding-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        id="onboarding-card"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 text-center relative overflow-hidden animate-scale-up"
      >
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx + 1 === step
                  ? 'w-8 bg-cyan-400'
                  : idx + 1 < step
                  ? 'w-4 bg-cyan-600'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
              <Droplets className="w-10 h-10 animate-bounce" />
            </div>

            <h2 id="onboarding-title" className="text-2xl font-extrabold text-white tracking-tight">
              Welcome to Waterly 💧
            </h2>

            <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
              A smart hydration companion to keep you energized and consistently hydrated throughout the day with calming reminders.
            </p>

            <div className="pt-2 text-left">
              <label htmlFor="onboarding-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                What is your name? <span className="text-cyan-400 font-normal lowercase">(so we can personalize your reminders)</span>
              </label>
              <input
                id="onboarding-name"
                type="text"
                value={settings.userName}
                onChange={e => onUpdateSettings({ userName: e.target.value })}
                placeholder="Enter your name (e.g. Alex)"
                autoFocus
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-white outline-none placeholder:text-slate-600 transition"
              />
              {!settings.userName.trim() && (
                <p className="text-[11px] text-cyan-400/80 mt-1.5 italic">
                  💡 You can enter your name or continue and set it anytime in Settings.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: DAILY GOAL (Presets + Custom) */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Set Your Daily Goal
            </h2>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              The recommended water intake for active adults is around 2500 ml (2.5 Liters).
            </p>

            {/* 6-Option Grid (5 Presets + 1 Custom) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {PRESET_GOALS.map(val => (
                <button
                  key={val}
                  id={`btn-goal-preset-${val}`}
                  type="button"
                  onClick={() => {
                    setIsCustomGoal(false);
                    setCustomGoalError('');
                    onUpdateSettings({ dailyGoalMl: val });
                  }}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    !isCustomGoal && settings.dailyGoalMl === val
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val} ml
                  <span className="block text-[10px] font-normal opacity-80">
                    {(val / 1000).toFixed(1)} L
                  </span>
                </button>
              ))}

              {/* 6th Option: Custom Goal */}
              <button
                id="btn-goal-custom"
                type="button"
                onClick={() => {
                  setIsCustomGoal(true);
                  setCustomGoalError('');
                  const parsed = parseInt(customGoalInput, 10);
                  if (!isNaN(parsed) && parsed >= 500 && parsed <= 10000) {
                    onUpdateSettings({ dailyGoalMl: parsed });
                  }
                }}
                className={`py-3 rounded-2xl text-xs font-bold border transition ${
                  isCustomGoal
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Custom
                <span className="block text-[10px] font-normal opacity-80">
                  {isCustomGoal && customGoalInput ? `${customGoalInput} ml` : 'Enter ml'}
                </span>
              </button>
            </div>

            {/* Revealed Numeric Input when Custom is selected */}
            {isCustomGoal && (
              <div className="pt-2 animate-fade-in text-left">
                <label
                  htmlFor="input-custom-daily-goal"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
                >
                  <span>Custom Daily Water Goal</span>
                  <span className="text-[10px] font-normal text-slate-400">Min 500 · Max 10,000 ml</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="input-custom-daily-goal"
                    type="number"
                    min={500}
                    max={10000}
                    step={50}
                    value={customGoalInput}
                    onChange={e => {
                      const rawVal = e.target.value;
                      setCustomGoalInput(rawVal);
                      const num = parseInt(rawVal, 10);
                      if (isNaN(num)) {
                        setCustomGoalError('Please enter a valid numeric value');
                      } else if (num < 500) {
                        setCustomGoalError('Minimum goal is 500 ml');
                      } else if (num > 10000) {
                        setCustomGoalError('Maximum goal is 10,000 ml');
                      } else {
                        setCustomGoalError('');
                        onUpdateSettings({ dailyGoalMl: num });
                      }
                    }}
                    placeholder="e.g. 2800"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-white font-mono text-sm outline-none placeholder:text-slate-600 transition pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 text-xs font-bold text-cyan-400 font-mono pointer-events-none">
                    ml
                  </span>
                </div>
                {customGoalError ? (
                  <p className="text-[11px] text-rose-400 mt-1.5">{customGoalError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    💡 Equivalent to {((parseInt(customGoalInput, 10) || 0) / 1000).toFixed(2)} Liters per day.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: REMINDER FREQUENCY & OPTIONAL CUSTOM ACTIVE WINDOW */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Reminder Interval
            </h2>

            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              How often would you like Waterly to prompt you for a glass of water?
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60, 90, 120].map(mins => (
                <button
                  key={mins}
                  id={`btn-interval-preset-${mins}`}
                  type="button"
                  onClick={() => onUpdateSettings({ reminderIntervalMinutes: mins })}
                  className={`py-3 rounded-2xl text-xs font-bold border transition ${
                    settings.reminderIntervalMinutes === mins
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mins} min
                  <span className="block text-[10px] font-normal opacity-80">
                    {mins === 60 ? 'Recommended' : `${(mins / 60).toFixed(1)}h`}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Window Display with Customize Button */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[11px]">Active Window</span>
                  <span className="font-mono text-cyan-300 font-bold text-xs">
                    {formatTime24to12(settings.reminderStartTime)} – {formatTime24to12(settings.reminderEndTime)}
                  </span>
                </div>
              </div>
              <button
                id="btn-customize-active-window"
                type="button"
                onClick={() => {
                  setTempStartTime(settings.reminderStartTime);
                  setTempEndTime(settings.reminderEndTime);
                  setIsCustomizingWindow(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Customize</span>
              </button>
            </div>

            {/* Compact Modal Overlay for Customizing Active Window */}
            {isCustomizingWindow && (
              <div
                id="modal-custom-window"
                className="absolute -inset-4 bg-slate-900/98 backdrop-blur-md z-20 p-5 flex flex-col justify-between animate-fade-in text-left rounded-3xl border border-slate-700 shadow-2xl"
                role="dialog"
                aria-labelledby="custom-window-title"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 id="custom-window-title" className="text-sm font-bold text-white">
                          Custom Active Window
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Set your awake hydration hours
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomizingWindow(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      aria-label="Close active window customization"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    Waterly will only remind you during these hours. No alarms while you sleep.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div>
                      <label htmlFor="onboarding-start-time" className="block text-xs font-semibold text-slate-300 mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <select
                          id="onboarding-start-time"
                          value={tempStartTime}
                          onChange={e => setTempStartTime(e.target.value)}
                          className="w-full appearance-none px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-white font-mono text-xs outline-none cursor-pointer pr-8"
                        >
                          {(TIME_OPTIONS.includes(tempStartTime)
                            ? TIME_OPTIONS
                            : [...TIME_OPTIONS, tempStartTime].sort()
                          ).map(t => (
                            <option key={t} value={t} className="bg-slate-950 text-white font-mono">
                              {t} ({formatTime24to12(t)})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="onboarding-end-time" className="block text-xs font-semibold text-slate-300 mb-1">
                        End Time
                      </label>
                      <div className="relative">
                        <select
                          id="onboarding-end-time"
                          value={tempEndTime}
                          onChange={e => setTempEndTime(e.target.value)}
                          className="w-full appearance-none px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-white font-mono text-xs outline-none cursor-pointer pr-8"
                        >
                          {(TIME_OPTIONS.includes(tempEndTime)
                            ? TIME_OPTIONS
                            : [...TIME_OPTIONS, tempEndTime].sort()
                          ).map(t => (
                            <option key={t} value={t} className="bg-slate-950 text-white font-mono">
                              {t} ({formatTime24to12(t)})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      Active: <strong>{formatTime24to12(tempStartTime)}</strong> to <strong>{formatTime24to12(tempEndTime)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
                  <button
                    id="btn-cancel-custom-window"
                    type="button"
                    onClick={() => setIsCustomizingWindow(false)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-apply-custom-window"
                    type="button"
                    onClick={() => {
                      onUpdateSettings({
                        reminderStartTime: tempStartTime,
                        reminderEndTime: tempEndTime,
                      });
                      setIsCustomizingWindow(false);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Apply Window</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SOUND & NOTIFICATIONS PERMISSION */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Enable Reminders & Sound
            </h2>

            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Waterly stores your data privately on your device. Clicking below will initialize the gentle chime sound and enable reminders.
            </p>

            <div className="space-y-2 pt-1 text-left text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Pleasant chime sound</span>
                </div>
                <span className="text-cyan-400 font-semibold">Enabled</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span>Browser notifications</span>
                </div>
                <span className="text-slate-400 font-semibold capitalize">
                  {notificationStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
            >
              Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              id={`btn-onboarding-step-${step}`}
              onClick={handleNext}
              className="flex-1 py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-enable-hydration-reminders"
              onClick={handleEnableAll}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Enable & Enter Waterly</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
