import React, { useState, useEffect } from 'react';
import { useHydration } from './hooks/useHydration';
import { useReminder } from './hooks/useReminder';
import { useAudio } from './hooks/useAudio';
import { useNotifications } from './hooks/useNotifications';
import { Header } from './components/Header';
import { WaterProgress } from './components/WaterProgress';
import { NextReminderCard } from './components/NextReminderCard';
import { QuickAddButtons } from './components/QuickAddButtons';
import { TodayHistory } from './components/TodayHistory';
import { CustomWaterModal } from './components/CustomWaterModal';
import { SettingsModal } from './components/SettingsModal';
import { WeeklyHistoryModal } from './components/WeeklyHistoryModal';
import { ReminderModal } from './components/ReminderModal';
import { OnboardingModal } from './components/OnboardingModal';
import { NotificationBanner } from './components/NotificationBanner';
import { Droplet, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const {
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
  } = useHydration();

  const {
    unlockAudio,
    playTestRingtone,
    stopTestRingtone,
    isPlayingTest,
  } = useAudio();

  const {
    status: notificationStatus,
    requestPermission: requestNotificationPermission,
    sendTestNotification,
  } = useNotifications();

  // Reminder Hook
  const {
    reminderState,
    remainingMs,
    handleAcknowledge,
    handleSnooze,
    handleTestReminder,
  } = useReminder(settings, (amountMl) => {
    logWater(amountMl, 'reminder', 'Hydration reminder acknowledged');
  });

  // Modal Visibility States
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Handle Android App Launcher Shortcuts (e.g. ?quickAdd=250)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const quickAdd = urlParams.get('quickAdd');
      if (quickAdd) {
        const amount = parseInt(quickAdd, 10);
        if (!isNaN(amount) && amount > 0) {
          logWater(amount, 'quick-add', `Quick log ${amount}ml`);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [logWater]);

  // Global Audio Autoplay Unlock on First User Touch/Click
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [unlockAudio]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !settings.hasCompletedOnboarding);

  const handleFinishOnboarding = () => {
    updateSettings({ hasCompletedOnboarding: true });
    setIsOnboardingOpen(false);
  };

  const handleRestartOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Immersive UI Radial Gradient Atmosphere */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,#1E3A8A_0%,transparent_70%)] opacity-40 pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Primary Header */}
      <Header
        settings={settings}
        reminderState={reminderState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onQuickTest={() => handleTestReminder(0)}
      />

      {/* Main Immersive Layout (Responsive 2-Pane on Desktop, 1-Column on Mobile) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 z-10 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Recent History Sidebar on Desktop */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col gap-4 bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Recent History
            </h2>
            <span className="text-xs font-mono text-cyan-400">
              {todayLog.events.length} logs
            </span>
          </div>

          <TodayHistory
            events={todayLog.events}
            onDeleteEvent={deleteEvent}
            onClearToday={clearToday}
          />

          <div className="pt-4 mt-auto border-t border-white/5 text-xs text-slate-500 italic">
            Your data is stored locally. Always stay hydrated.
          </div>
        </div>

        {/* Right Side / Center: Primary Immersive Hydration Orb & Controls */}
        <div className="flex-1 w-full flex flex-col items-center gap-6 sm:gap-8">
          {/* Browser Notification Banner (if ungranted) */}
          <NotificationBanner
            status={notificationStatus}
            onRequest={async () => {
              unlockAudio();
              const res = await requestNotificationPermission();
              if (res === 'granted') {
                updateSettings({ notificationsEnabled: true });
              }
            }}
          />

          {/* 1. Main Water Progress Centerpiece Orb */}
          <WaterProgress
            todayLog={todayLog}
            percentage={percentage}
            isGoalReached={isGoalReached}
          />

          {/* 2. Controls: Next Reminder (Row 1) + Quick Add Buttons (Row 2) */}
          <div className="w-full flex flex-col gap-5 items-stretch">
            <div className="w-full">
              <NextReminderCard
                settings={settings}
                reminderState={reminderState}
                remainingMs={remainingMs}
                onTriggerNow={() => handleTestReminder(0)}
                onSnooze={(mins) => handleSnooze(mins)}
              />
            </div>
            <div className="w-full">
              <QuickAddButtons
                onAddWater={(amount, source) => logWater(amount, source)}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            </div>
          </div>

          {/* Mobile-only History Section (shown below controls on small screens) */}
          <div className="w-full lg:hidden pt-4">
            <TodayHistory
              events={todayLog.events}
              onDeleteEvent={deleteEvent}
              onClearToday={clearToday}
            />
          </div>
        </div>
      </main>

      {/* Subtle Footer Note */}
      <footer className="w-full py-6 px-4 border-t border-white/5 text-center text-xs text-slate-400 z-10">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-1.5">
          <p className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-white">Waterly</span> — Smart Hydration
          </p>
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 flex-wrap">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] inline-block" />
            <span>- By <strong className="text-amber-300 font-semibold">Abhishek Tiwari</strong> and <strong className="text-cyan-400 font-semibold">Gemini</strong></span>
          </p>
          <p className="text-[11px] text-slate-500">
            100% Offline-First • On-Device Storage • No account or external servers needed
          </p>
        </div>
      </footer>

      {/* === MODALS & OVERLAYS === */}

      {/* Critical Active Reminder Alert Overlay */}
      <ReminderModal
        isOpen={reminderState.isActive}
        settings={settings}
        onAcknowledge={handleAcknowledge}
        onSnooze={(mins) => handleSnooze(mins)}
      />

      {/* Custom Water Amount Modal */}
      <CustomWaterModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={(amount, source, note) => logWater(amount, source, note)}
      />

      {/* Settings Panel Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        notificationStatus={notificationStatus}
        onRequestNotifications={async () => {
          unlockAudio();
          const res = await requestNotificationPermission();
          if (res === 'granted') {
            updateSettings({ notificationsEnabled: true });
          }
        }}
        onSendTestNotification={sendTestNotification}
        onPlayTestSound={playTestRingtone}
        onStopTestSound={stopTestRingtone}
        isPlayingTestSound={isPlayingTest}
        onTriggerTestReminder={(delay) => handleTestReminder(delay)}
        onClearTodayData={clearToday}
        onResetAllData={resetAllData}
        onRestartOnboarding={handleRestartOnboarding}
      />

      {/* Past 7-Day History Modal */}
      <WeeklyHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        todayLog={todayLog}
      />

      {/* Initial Guided Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onFinishOnboarding={handleFinishOnboarding}
        onRequestNotifications={async () => {
          unlockAudio();
          const res = await requestNotificationPermission();
          if (res === 'granted') {
            updateSettings({ notificationsEnabled: true });
          }
        }}
        onUnlockAudio={unlockAudio}
        notificationStatus={notificationStatus}
      />
    </div>
  );
}
