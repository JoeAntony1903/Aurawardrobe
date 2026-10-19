import React from 'react';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  ChevronRight,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { DAYS_OF_WEEK, DayOfWeek } from '../../types/wardrobe';

export const SchedulePlannerScreen: React.FC = () => {
  const { 
    schedule, 
    outfits, 
    items, 
    openScheduleAssignModal, 
    assignOutfitToSchedule,
    setActiveTab
  } = useWardrobe();

  const dayWeatherHints: Record<DayOfWeek, string> = {
    Monday: 'Crisp & Overcast · Studio / Work Focus',
    Tuesday: 'Brisk 14°C · Client Meetings',
    Wednesday: 'Sunny & Mild · Layered Casual',
    Thursday: 'Showers Likely · Rainwear & Trench',
    Friday: 'Mild Evening · Smart Social',
    Saturday: 'Sunny 21°C · Gallery & Dining',
    Sunday: 'Relaxed Atmosphere · Soft Knits',
  };

  const handleClearDay = (day: DayOfWeek) => {
    assignOutfitToSchedule(day, null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Weekly Stylist
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400 font-mono">Offline Schedule Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Schedule Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Plan your rotational look from Monday to Sunday. Tap any day to assign or swap an outfit.
          </p>
        </div>

        {/* Quick Roulette Action */}
        <button
          type="button"
          onClick={() => setActiveTab('ai-features')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles size={15} />
          <span>Surprise Me with AI Roulette</span>
        </button>
      </div>

      {/* Weekly Calendar Grid (Monday - Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const assignedOutfitId = schedule[day];
          const assignedOutfit = outfits.find((o) => o.id === assignedOutfitId);
          const constituentItems = assignedOutfit
            ? items.filter((i) => assignedOutfit.itemIds.includes(i.id))
            : [];

          return (
            <div
              key={day}
              className={`rounded-3xl backdrop-blur-xl border p-5 flex flex-col justify-between transition-all space-y-4 ${
                assignedOutfit
                  ? 'bg-white/[0.07] border-white/20 shadow-xl'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Day Title & Weather Vibe */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base sm:text-lg text-white">
                    {day}
                  </span>
                  {assignedOutfit ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check size={11} />
                      Set
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">
                      Open
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {dayWeatherHints[day]}
                </div>
              </div>

              {/* Assigned Outfit Preview or Empty Slot */}
              {assignedOutfit ? (
                <div className="space-y-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-white line-clamp-1">
                        {assignedOutfit.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {assignedOutfit.occasion}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClearDay(day)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Clear Day"
                      aria-label={`Clear outfit for ${day}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Thumbnail Row of Assigned Garments */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {constituentItems.map((item) => (
                      <div
                        key={item.id}
                        title={`${item.name} (${item.category})`}
                        className="w-12 h-16 rounded-lg bg-black/50 border border-white/10 p-0.5 shrink-0 flex items-center justify-center"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center space-y-2">
                  <Calendar className="w-6 h-6 text-slate-500" />
                  <p className="text-xs text-slate-400">No look assigned</p>
                </div>
              )}

              {/* Action Button: "Assign Outfit" or "Change Outfit" */}
              <button
                type="button"
                onClick={() => openScheduleAssignModal(day)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                  assignedOutfit
                    ? 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                }`}
              >
                <Plus size={14} />
                <span>{assignedOutfit ? 'Change Outfit' : 'Assign Outfit'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
