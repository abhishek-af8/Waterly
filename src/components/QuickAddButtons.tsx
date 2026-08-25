import React from 'react';
import { CupSoda, Droplet, Plus, SlidersHorizontal } from 'lucide-react';
import { HydrationSource } from '../types';

interface QuickAddButtonsProps {
  onAddWater: (amountMl: number, source: HydrationSource) => void;
  onOpenCustomModal: () => void;
}

export const QuickAddButtons: React.FC<QuickAddButtonsProps> = ({
  onAddWater,
  onOpenCustomModal,
}) => {
  const quickOptions = [
    { amount: 250, label: '+250 ml', sub: 'Standard glass' },
    { amount: 500, label: '+500 ml', sub: 'Water bottle' },
    { amount: 750, label: '+750 ml', sub: 'Large flask' },
  ];

  return (
    <div id="quick-add-section" className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          Log Water Intake
        </span>
        <span className="text-xs text-slate-500">Tap to record immediately</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {quickOptions.map(opt => (
          <button
            key={opt.amount}
            id={`btn-quick-add-${opt.amount}`}
            onClick={() => onAddWater(opt.amount, 'quick_add')}
            className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 shadow-md hover:shadow-cyan-900/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            aria-label={`Log ${opt.amount} milliliters of water`}
          >
            <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-300 flex items-center justify-center mb-1.5 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white group-hover:text-cyan-200">
              {opt.label}
            </span>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
              {opt.sub}
            </span>
          </button>
        ))}

        {/* Custom amount trigger */}
        <button
          id="btn-custom-add-water"
          onClick={onOpenCustomModal}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          aria-label="Enter custom water amount"
        >
          <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white group-hover:text-slate-100">
            Custom
          </span>
          <span className="text-[11px] text-slate-400">
            Enter any ml
          </span>
        </button>
      </div>
    </div>
  );
};
