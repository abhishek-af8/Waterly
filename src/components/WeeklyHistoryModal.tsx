import React from 'react';
import { Award, Calendar, CheckCircle2, Droplet, TrendingUp, X } from 'lucide-react';
import { DailyLog, HydrationHistory } from '../types';
import { formatShortDate, getTodayDateString } from '../utils/time';

interface WeeklyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HydrationHistory;
  todayLog: DailyLog;
}

export const WeeklyHistoryModal: React.FC<WeeklyHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  todayLog,
}) => {
  if (!isOpen) return null;

  // Build last 7 days list
  const pastDays: { dateStr: string; log: DailyLog }[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (i === 0) {
      pastDays.push({ dateStr, log: todayLog });
    } else if (history[dateStr]) {
      pastDays.push({ dateStr, log: history[dateStr] });
    } else {
      pastDays.push({
        dateStr,
        log: {
          date: dateStr,
          totalMl: 0,
          goalMl: todayLog.goalMl,
          events: [],
        },
      });
    }
  }

  // Calculate 7-day stats
  const totalVolume7d = pastDays.reduce((acc, item) => acc + item.log.totalMl, 0);
  const activeDaysCount = pastDays.filter(item => item.log.totalMl > 0).length || 1;
  const avgDaily = Math.round(totalVolume7d / activeDaysCount);
  const goalsMetCount = pastDays.filter(item => item.log.totalMl >= item.log.goalMl && item.log.totalMl > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        id="weekly-history-modal"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/40 relative animate-scale-up max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-lg font-bold text-white">
                Hydration History
              </h2>
              <p className="text-xs text-slate-400">
                Your past 7 days of hydration consistency
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Key Stats */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Avg Daily
            </span>
            <span className="text-base font-bold text-cyan-400 font-mono">
              {avgDaily} ml
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              Goals Met
            </span>
            <span className="text-base font-bold text-white font-mono flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {goalsMetCount} / 7
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
              7-Day Total
            </span>
            <span className="text-base font-bold text-slate-200 font-mono">
              {(totalVolume7d / 1000).toFixed(1)} L
            </span>
          </div>
        </div>

        {/* Day-by-Day List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {pastDays.map(({ dateStr, log }) => {
            const pct = log.goalMl > 0 ? Math.min(100, Math.round((log.totalMl / log.goalMl) * 100)) : 0;
            const met = log.totalMl >= log.goalMl && log.totalMl > 0;

            return (
              <div
                key={dateStr}
                className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
              >
                <div className="w-24 shrink-0">
                  <span className="text-xs font-semibold text-slate-200 block">
                    {formatShortDate(dateStr)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {dateStr}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex-1 max-w-xs mx-2">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="text-slate-300 font-medium">{log.totalMl} ml</span>
                    <span className="text-slate-500">of {log.goalMl} ml</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        met
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                          : 'bg-cyan-600/70'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div className="w-16 text-right shrink-0">
                  {met ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      100%
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {pct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
