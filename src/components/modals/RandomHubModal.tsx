import React, { useState } from 'react';
import { 
  Shuffle, 
  Calendar, 
  Check, 
  X, 
  Sparkles, 
  Tag, 
  ArrowRight 
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { DAYS_OF_WEEK, DayOfWeek } from '../../types/wardrobe';

export const RandomHubModal: React.FC = () => {
  const { 
    isRandomHubModalOpen, 
    closeRandomHubModal, 
    activeRandomHubOutfit, 
    triggerRandomHubOutfit, 
    items, 
    assignOutfitToSchedule,
    setActiveTab
  } = useWardrobe();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Wednesday');
  const [assigned, setAssigned] = useState(false);

  if (!isRandomHubModalOpen || !activeRandomHubOutfit) return null;

  const constituentItems = items.filter((i) =>
    activeRandomHubOutfit.itemIds.includes(i.id)
  );

  const handleAssign = () => {
    assignOutfitToSchedule(selectedDay, activeRandomHubOutfit.id);
    setAssigned(true);
    setTimeout(() => {
      setAssigned(false);
      closeRandomHubModal();
      setActiveTab('schedule');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="random-hub-modal-title"
        className="w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5"
      >
        <button
          type="button"
          onClick={closeRandomHubModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
            <Shuffle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Outfit Hub Randomizer
            </div>
            <h3 id="random-hub-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeRandomHubOutfit.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10 font-medium">
            Occasion: {activeRandomHubOutfit.occasion}
          </span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
            {constituentItems.length} curated pieces
          </span>
          {activeRandomHubOutfit.isFavorite && (
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              ★ Starred Look
            </span>
          )}
        </div>

        {/* Garments Preview */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Ensemble Pieces
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {constituentItems.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center text-center space-y-2"
              >
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center p-1">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white line-clamp-1">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.category} · {item.color}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Assignment Bar */}
        <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Calendar size={15} />
            <span>Schedule this Saved Outfit</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              aria-label="Select day of week"
            >
              {DAYS_OF_WEEK.map((day) => (
                <option key={day} value={day} className="bg-slate-900 text-white">
                  {day}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAssign}
              disabled={assigned}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                assigned
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {assigned ? (
                <>
                  <Check size={16} />
                  <span>Assigned to {selectedDay}!</span>
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  <span>Assign to {selectedDay}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={triggerRandomHubOutfit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-medium transition-all"
          >
            <Shuffle size={14} />
            <span>Shuffle Another Look</span>
          </button>

          <button
            type="button"
            onClick={closeRandomHubModal}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
