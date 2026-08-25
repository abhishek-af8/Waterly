import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationStatus } from '../services/notificationService';

interface NotificationBannerProps {
  status: NotificationStatus;
  onRequest: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  status,
  onRequest,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (status === 'granted' || status === 'unsupported' || isDismissed) {
    return null;
  }

  return (
    <div
      id="notification-permission-banner"
      className="w-full max-w-xl mx-auto mb-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs text-cyan-200 animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <p className="text-slate-300">
          Enable browser notifications to receive alerts when working in other tabs.
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onRequest}
          className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition text-[11px]"
        >
          Enable
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition"
          aria-label="Dismiss notification banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
