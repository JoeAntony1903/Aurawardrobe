import React from 'react';
import { X, Calendar, Check, Trash2, Sparkles } from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';

export const AssignScheduleModal: React.FC = () => {
  const { 
    isAssignScheduleModalOpen, 
    closeScheduleAssignModal, 
    scheduleAssignTargetDay, 
    outfits, 
    schedule, 
    assignOutfitToSchedule,
    items
  } = useWardrobe();

  if (!isAssignScheduleModalOpen || !scheduleAssignTargetDay) return null;

  const currentAssignedId = schedule[scheduleAssignTargetDay];

  const handleSelectOutfit = (outfitId: string) => {
    assignOutfitToSchedule(scheduleAssignTargetDay, outfitId);
    closeScheduleAssignModal();
  };

  const handleClearDay = () => {
    assignOutfitToSchedule(scheduleAssignTargetDay, null);
    closeScheduleAssignModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        className="w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5"
      >
        <button
          type="button"
          onClick={closeScheduleAssignModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Schedule Planner
            </div>
            <h3 id="schedule-modal-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Assign Outfit to {scheduleAssignTargetDay}
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          Choose a pre-assembled outfit from your saved collection to wear on {scheduleAssignTargetDay}.
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {outfits.map((outfit) => {
            const isCurrent = currentAssignedId === outfit.id;
            const constituentItems = items.filter((i) => outfit.itemIds.includes(i.id));

            return (
              <button
                key={outfit.id}
                type="button"
                onClick={() => handleSelectOutfit(outfit.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{outfit.name}</span>
                    {outfit.isFavorite && <span className="text-rose-400 text-xs">★</span>}
                  </div>
                  <div className="text-xs text-slate-400">
                    {outfit.occasion} · {constituentItems.length} items
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                      <Check size={12} />
                      Current
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {currentAssignedId && (
            <button
              type="button"
              onClick={handleClearDay}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear {scheduleAssignTargetDay}</span>
            </button>
          )}

          <div className="ml-auto">
            <button
              type="button"
              onClick={closeScheduleAssignModal}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
