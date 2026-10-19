import React from 'react';
import { 
  Shuffle, 
  Heart, 
  Plus, 
  Calendar, 
  ArrowRight, 
  Layers,
  ChevronRight,
  Sparkles,
  Wand2
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { WardrobeGraphic } from './WardrobeGraphic';

export const HomeScreen: React.FC = () => {
  const { 
    outfits, 
    items, 
    toggleFavoriteOutfit, 
    triggerRandomHubOutfit,
    setIsUploadModalOpen,
    setIsNewOutfitModalOpen,
    setActiveTab,
    openScheduleAssignModal
  } = useWardrobe();

  const favoriteOutfits = outfits.filter((o) => o.isFavorite);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero: Stylized Wardrobe Visual Graphic (The Digital Sanctuary) */}
      <section aria-labelledby="wardrobe-section-title">
        <WardrobeGraphic />
      </section>

      {/* Main Interactive Action Bar: Randomize from Outfit Hub & Upload Item */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Home Option: Randomize from Outfit Hub (Explicit user requirement) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/50 backdrop-blur-2xl border border-indigo-500/30 p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-4 group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
              <Shuffle size={13} className="text-indigo-400" />
              <span>Outfit Hub Shuffler</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Randomize Saved Look
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Quickly pick an ensemble from your {outfits.length} saved outfits in the Outfit Hub for effortless daily styling.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={triggerRandomHubOutfit}
              disabled={outfits.length === 0}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Shuffle size={17} />
              <span>Randomize from Outfit Hub</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-features')}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs sm:text-sm font-medium transition-all"
            >
              <Wand2 size={15} className="text-amber-400" />
              <span>AI Features &rarr;</span>
            </button>
          </div>
        </div>

        {/* Upload Item Quick Action Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/20 p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-4 group">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300 text-xs font-mono">
              <Plus size={13} className="text-indigo-400" />
              <span>Digitize Apparel</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Digitize & Pair New Item
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
              Upload from file explorer or gallery, inspect AI background removal and crop boundaries, and establish bi-directional pairings.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} />
              <span>Upload New Item</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNewOutfitModalOpen(true)}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-sm font-medium transition-all"
            >
              Assemble Outfit
            </button>
          </div>
        </div>
      </section>

      {/* Favorites Carousel */}
      <section className="space-y-4" aria-labelledby="favorites-title">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <h3 id="favorites-title" className="text-lg sm:text-xl font-bold text-white">
                Favorites Carousel
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Your starred outfit combinations, available for one-tap daily wear.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('outfits')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            <span>View All Outfits ({outfits.length})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {favoriteOutfits.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 text-center space-y-3">
            <Heart className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400">No favorite outfits marked yet.</p>
            <p className="text-xs text-slate-500">
              Tap the heart icon on any outfit in the Outfit Hub to pin it here.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('outfits')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
            >
              Browse Outfit Hub
            </button>
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-white/10">
            {favoriteOutfits.map((outfit) => {
              const outfitItems = items.filter((item) =>
                outfit.itemIds.includes(item.id)
              );

              return (
                <div
                  key={outfit.id}
                  className="shrink-0 w-72 sm:w-80 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/20 p-5 flex flex-col justify-between shadow-xl space-y-4 hover:border-white/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                          {outfit.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {outfit.occasion}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavoriteOutfit(outfit.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 transition-colors"
                        aria-label={`Unfavorite ${outfit.name}`}
                      >
                        <Heart size={18} className="fill-rose-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden py-1">
                      {outfitItems.slice(0, 4).map((it) => (
                        <div
                          key={it.id}
                          title={`${it.name} (${it.category})`}
                          className="w-14 h-18 rounded-xl bg-black/40 border border-white/10 p-1 flex items-center justify-center shrink-0"
                        >
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                      {outfitItems.length > 4 && (
                        <div className="w-10 h-18 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-mono text-slate-400">
                          +{outfitItems.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {outfitItems.length} items
                    </span>
                    <button
                      type="button"
                      onClick={() => openScheduleAssignModal('Monday')}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <Calendar size={13} />
                      <span>Schedule</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
