import React from 'react';
import { Bell, Clock, Droplet, History, Sparkles, Trash2 } from 'lucide-react';
import { HydrationEvent } from '../types';
import { formatTimestampTime } from '../utils/time';

interface TodayHistoryProps {
  events: HydrationEvent[];
  onDeleteEvent: (eventId: string) => void;
  onClearToday: () => void;
}

export const TodayHistory: React.FC<TodayHistoryProps> = ({
  events,
  onDeleteEvent,
  onClearToday,
}) => {
  const getSourceBadge = (source: HydrationEvent['source']) => {
    switch (source) {
      case 'reminder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <Bell className="w-2.5 h-2.5" />
            Reminder
          </span>
        );
      case 'quick_add':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <Sparkles className="w-2.5 h-2.5" />
            Quick Add
          </span>
        );
      case 'custom':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Custom
          </span>
        );
    }
  };

  return (
    <div
      id="today-hydration-history"
      className="w-full max-w-xl mx-auto flex flex-col gap-3.5 mt-2"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Today's Hydration Timeline
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {events.length}
          </span>
        </div>

        {events.length > 0 && (
          <button
            id="btn-clear-today-history"
            onClick={() => {
              if (window.confirm("Clear today's logged water?")) {
                onClearToday();
              }
            }}
            className="text-xs text-slate-500 hover:text-rose-400 transition"
          >
            Clear today
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-2">
            <Droplet className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            No water logged yet today
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Log your first glass with the quick add buttons above or wait for your reminder.
          </p>
        </div>
      ) : (
        <div className="w-full rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-md">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-slate-800/40 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4 fill-cyan-400/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      +{evt.amountMl} ml
                    </span>
                    {getSourceBadge(evt.source)}
                  </div>
                  {evt.note && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {evt.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {formatTimestampTime(evt.timestamp)}
                </span>
                <button
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition opacity-80 group-hover:opacity-100"
                  title="Remove this log"
                  aria-label="Remove drink entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
