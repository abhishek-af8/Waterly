import React from 'react';
import { Award, CheckCircle2, Droplet, Sparkles, TrendingUp } from 'lucide-react';
import { DailyLog } from '../types';

interface WaterProgressProps {
  todayLog: DailyLog;
  percentage: number;
  isGoalReached: boolean;
}

export const WaterProgress: React.FC<WaterProgressProps> = ({
  todayLog,
  percentage,
  isGoalReached,
}) => {
  const { totalMl, goalMl } = todayLog;
  const remainingMl = Math.max(0, goalMl - totalMl);

  // SVG Circular Gauge calculation
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  // Hydration status insight
  const getInsightMessage = () => {
    if (isGoalReached) {
      return "Daily goal completed! Keep hydrating as needed for active recovery.";
    }
    if (percentage >= 75) {
      return "Almost there! Just a couple of glasses away from your goal.";
    }
    if (percentage >= 50) {
      return "Halfway there! Consistent sipping powers your energy and focus.";
    }
    if (percentage >= 25) {
      return "Good start. Keep your water bottle within arm's reach.";
    }
    return "Start your day with a refreshing glass to boost metabolism.";
  };

  return (
    <div id="water-progress-card" className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-cyan-950/20 backdrop-blur-sm relative overflow-hidden">
      {/* Background glow behind gauge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Goal Reached Celebration Banner */}
      {isGoalReached && (
        <div
          id="goal-reached-banner"
          className="mb-6 w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-cyan-950/90 border border-cyan-500/40 flex items-center justify-between gap-3 text-cyan-200 shadow-lg shadow-cyan-500/10 animate-fade-in"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                🎉 Daily goal reached!
              </p>
              <p className="text-xs text-cyan-300/80">
                You've completed today's hydration target.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30">
            {percentage}%
          </span>
        </div>
      )}

      {/* SVG Circle Progress Gauge */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          className="transform -rotate-90 w-64 h-64 sm:w-72 sm:h-72"
          viewBox="0 0 250 250"
        >
          {/* Track Background */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="currentColor"
            strokeWidth="16"
            className="text-slate-800/80"
            fill="transparent"
          />

          {/* Glowing Filter Definition */}
          <defs>
            <linearGradient id="waterlyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06B6D4" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Active Water Arc */}
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="url(#waterlyGradient)"
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            filter="url(#glow)"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center select-none px-4">
          <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
            <Droplet className="w-5 h-5 fill-cyan-400/20 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Today
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
              {totalMl}
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-400">
              ml
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mb-2">
            of <span className="text-slate-200 font-semibold">{goalMl} ml</span>
          </p>

          {/* Percentage badge */}
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-400 text-xs font-bold tracking-wide">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar & Sub-Metrics */}
      <div className="w-full mt-6 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            {remainingMl > 0 ? (
              <>
                <span className="text-slate-200 font-medium">{remainingMl} ml</span> remaining
              </>
            ) : (
              <span className="text-cyan-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Target met (+{totalMl - goalMl} ml extra)
              </span>
            )}
          </span>
          <span className="text-slate-400">
            {todayLog.events.length} {todayLog.events.length === 1 ? 'drink' : 'drinks'} logged
          </span>
        </div>

        {/* Motivational Tip */}
        <p className="text-xs text-center text-slate-400 italic">
          "{getInsightMessage()}"
        </p>
      </div>
    </div>
  );
};
