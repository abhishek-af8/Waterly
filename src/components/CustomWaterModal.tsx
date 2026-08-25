import React, { useState } from 'react';
import { Droplet, Plus, X } from 'lucide-react';
import { HydrationSource } from '../types';

interface CustomWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amountMl: number, source: HydrationSource, note?: string) => void;
}

export const CustomWaterModal: React.FC<CustomWaterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('300');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handlePreset = (val: number) => {
    setAmount(String(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onConfirm(parsed, 'custom', note.trim() || undefined);
      onClose();
    }
  };

  const presets = [100, 150, 200, 300, 400, 600, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        id="custom-water-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-950/40 relative animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-water-title"
      >
        {/* Close Button */}
        <button
          id="btn-close-custom-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h2 id="custom-water-title" className="text-lg font-bold text-white">
              Log Custom Water
            </h2>
            <p className="text-xs text-slate-400">
              Specify the exact volume consumed
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div>
            <label htmlFor="custom-ml-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Water Volume (ml)
            </label>
            <div className="relative">
              <input
                id="custom-ml-input"
                type="number"
                min="10"
                max="5000"
                step="10"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-xl font-bold text-white font-mono placeholder-slate-600 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="e.g. 350"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 pointer-events-none">
                ml
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    amount === String(p)
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
                  }`}
                >
                  {p} ml
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="custom-note-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Optional Note
            </label>
            <input
              id="custom-note-input"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={40}
              placeholder="e.g. Post-workout, Herbal tea, Electrolytes"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl text-sm text-slate-200 placeholder-slate-600 outline-none transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-custom-water"
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-98 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log {amount ? `${amount} ml` : 'Water'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
