import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Calendar, 
  ThumbsDown, 
  BookmarkPlus, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  History, 
  RotateCcw,
  ShieldCheck,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { DAYS_OF_WEEK, DayOfWeek, Outfit } from '../../types/wardrobe';

export const AIFeaturesScreen: React.FC = () => {
  const { 
    items, 
    activeAIRouletteOutfit, 
    isSpinningAIRoulette, 
    spinAIRoulette, 
    saveAIRouletteToHub, 
    rejectAIRouletteOutfit,
    aiPreferences,
    clearRejectedMemory,
    assignOutfitToSchedule,
    setActiveTab
  } = useWardrobe();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Friday');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  
  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Color Palette Clash');
  const [rejectionNotice, setRejectionNotice] = useState<string | null>(null);

  // Initialize with a roll on mount if none active
  useEffect(() => {
    if (!activeAIRouletteOutfit && items.length >= 2) {
      spinAIRoulette();
    }
  }, []);

  const constituentItems = activeAIRouletteOutfit
    ? items.filter((i) => activeAIRouletteOutfit.itemIds.includes(i.id))
    : [];

  const handleSaveToHub = () => {
    if (!activeAIRouletteOutfit) return;
    saveAIRouletteToHub(activeAIRouletteOutfit);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAssignToSchedule = () => {
    if (!activeAIRouletteOutfit) return;
    // If not yet in hub, also save it so the schedule reference works smoothly
    saveAIRouletteToHub(activeAIRouletteOutfit);
    assignOutfitToSchedule(selectedDay, activeAIRouletteOutfit.id);
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setActiveTab('schedule');
    }, 1000);
  };

  const handleConfirmReject = () => {
    if (!activeAIRouletteOutfit) return;
    const name = activeAIRouletteOutfit.name;
    rejectAIRouletteOutfit(activeAIRouletteOutfit, rejectReason);
    setIsRejectModalOpen(false);
    setRejectionNotice(`AI learned from feedback: "${rejectReason}". Combination barred from future recommendations.`);
    setTimeout(() => setRejectionNotice(null), 4000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
              Machine Learning Stylist
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Continuous Adaptation Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Wardrobe Roulette & Stylist
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Algorithmic synthesis across your wardrobe. Save high-performing looks, schedule directly, or reject mismatched pieces so the AI learns your aesthetics and never repeats mistakes.
          </p>
        </div>

        <button
          type="button"
          onClick={spinAIRoulette}
          disabled={isSpinningAIRoulette || items.length < 2}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={17} className={isSpinningAIRoulette ? 'animate-spin' : ''} />
          <span>{isSpinningAIRoulette ? 'Synthesizing...' : 'Re-Spin AI Roulette'}</span>
        </button>
      </div>

      {/* Rejection Learning Notice Toast */}
      {rejectionNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <BrainCircuit className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{rejectionNotice}</span>
        </div>
      )}

      {/* Main AI Wardrobe Roulette Showcase */}
      {activeAIRouletteOutfit ? (
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          {/* Title & AI Rationale */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
                  AI Synthesized Silhouette
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Occasion: {activeAIRouletteOutfit.occasion}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeAIRouletteOutfit.name}
              </h3>
              <p className="text-xs text-slate-300 italic">
                "{activeAIRouletteOutfit.notes}"
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 font-mono">
              <div>{constituentItems.length} Piece Harmony</div>
              <div className="text-emerald-400">Validated Taxonomy Rules</div>
            </div>
          </div>

          {/* Garments Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {constituentItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center space-y-2 group hover:border-white/20 transition-all"
              >
                <div className="w-full h-32 rounded-xl overflow-hidden bg-black/30 p-2 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="w-full">
                  <div className="text-xs font-bold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{item.category} · {item.color}</div>
                  <div className="text-[10px] font-mono text-indigo-400 mt-0.5">{item.brand}</div>
                </div>
              </div>
            ))}
          </div>

          {/* The Three Mandatory User Decision Actions */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Action 1: Save to Outfit Hub */}
            <button
              type="button"
              onClick={handleSaveToHub}
              className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                saveSuccess
                  ? 'bg-emerald-600/30 border-emerald-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-200 hover:scale-[1.01]'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                {saveSuccess ? <Check size={20} className="text-emerald-400" /> : <BookmarkPlus size={20} />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {saveSuccess ? 'Saved to Outfit Hub!' : 'Save to Outfit Hub'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Add permanent record to your collection
                </div>
              </div>
            </button>

            {/* Action 2: Assign to Schedule */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-400" />
                  <span>Assign to Schedule</span>
                </span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAssignToSchedule}
                disabled={scheduleSuccess}
                className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
              >
                {scheduleSuccess ? 'Assigned!' : `Wear on ${selectedDay}`}
              </button>
            </div>

            {/* Action 3: Reject it to learn and never repeat */}
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(true)}
              className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left flex items-center gap-3 transition-all hover:scale-[1.01] group"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 group-hover:scale-110 transition-transform">
                <ThumbsDown size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-300">
                  Reject (Learn from Feedback)
                </div>
                <div className="text-[11px] text-slate-400">
                  AI records conflict & avoids this combo
                </div>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-300">
            Upload at least 2 garments to activate the AI Wardrobe Roulette synthesis engine.
          </p>
        </div>
      )}

      {/* Rejection Feedback Dialog */}
      {isRejectModalOpen && activeAIRouletteOutfit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-dialog-title"
            className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ThumbsDown size={22} />
              </div>
              <div>
                <h3 id="reject-dialog-title" className="text-lg font-bold text-white">
                  Teach AI Stylist
                </h3>
                <p className="text-xs text-slate-400">
                  Why should this combination not be proposed again?
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Select Stylistic Conflict:
              </label>
              {[
                'Color Palette Clash',
                'Seasonal & Fabric Inconsistency',
                'Silhouette Proportion Conflict',
                'Too Casual / Wrong Formality',
                'Personal Aesthetic Preference'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    rejectReason === reason
                      ? 'bg-rose-500/20 border-rose-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Record Feedback & Re-roll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Memory & Feedback Logs Panel */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              AI Continuous Learning Memory
            </h3>
          </div>

          {aiPreferences.rejectedPairKeys.length > 0 && (
            <button
              type="button"
              onClick={clearRejectedMemory}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Negative Constraints</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-400">
              Avoided Negative Constraints
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {aiPreferences.rejectedPairKeys.length} pairing rules
            </div>
            <p className="text-[11px] text-slate-400">
              Disallowed combinations blocked by user feedback
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-400">
              Feedback Logs
            </div>
            <div className="text-xl font-bold text-indigo-400 font-mono">
              {aiPreferences.feedbackLogs.length} events
            </div>
            <p className="text-[11px] text-slate-400">
              Stylistic corrections retained in memory
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-400">
              Algorithm Status
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              Active & Guarded
            </div>
            <p className="text-[11px] text-slate-400">
              Bi-directional rule validation + negative pruning
            </p>
          </div>
        </div>

        {/* Feedback Events Stream */}
        {aiPreferences.feedbackLogs.length > 0 && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Recent Stylistic Adjustments
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {aiPreferences.feedbackLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white">{log.outfitName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      Reason: <strong className="text-amber-300">{log.reason}</strong> · {log.itemNames.join(', ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
