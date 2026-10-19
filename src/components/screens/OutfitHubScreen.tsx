import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Plus, 
  Calendar, 
  Trash2, 
  Layers,
  Search,
  Check
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';

export const OutfitHubScreen: React.FC = () => {
  const { 
    outfits, 
    items, 
    toggleFavoriteOutfit, 
    deleteOutfit, 
    setIsNewOutfitModalOpen,
    openScheduleAssignModal
  } = useWardrobe();

  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const filteredOutfits = outfits.filter((outfit) => {
    const matchesSearch = searchQuery === '' || 
      outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outfit.occasion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !favoriteOnly || outfit.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Style Portfolio
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs text-slate-400 font-mono">Curated Looks</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Outfit Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Pre-assembled ensembles. Star items to feature on the Home screen or assign them to your weekly schedule.
          </p>
        </div>

        {/* "New Outfit" button (Explicit prompt requirement) */}
        <button
          type="button"
          onClick={() => setIsNewOutfitModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Outfit</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outfits by name, vibe, or occasion..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          />
        </div>

        <button
          type="button"
          onClick={() => setFavoriteOnly(!favoriteOnly)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
            favoriteOnly
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Heart size={14} className={favoriteOnly ? 'fill-rose-400 text-rose-400' : ''} />
          <span>Starred Only</span>
        </button>
      </div>

      {/* Grid of Saved Outfits */}
      {filteredOutfits.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No outfits match your filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Build your first outfit using the horizontal category selector to combine tops, bottoms, shoes, and accents.
          </p>
          <button
            type="button"
            onClick={() => setIsNewOutfitModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Create New Outfit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map((outfit) => {
            const constituentItems = items.filter((item) =>
              outfit.itemIds.includes(item.id)
            );

            return (
              <div
                key={outfit.id}
                className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-5 flex flex-col justify-between shadow-xl hover:border-white/25 transition-all space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar with Name & Heart Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {outfit.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        {outfit.occasion}
                      </span>
                    </div>

                    {/* Heart icon to toggle favorites (syncs to Home carousel) */}
                    <button
                      type="button"
                      onClick={() => toggleFavoriteOutfit(outfit.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-rose-400 transition-colors"
                      aria-label={`Toggle favorite for ${outfit.name}`}
                    >
                      <Heart
                        size={20}
                        className={
                          outfit.isFavorite
                            ? 'text-rose-400 fill-rose-400 scale-110 transition-transform'
                            : 'text-slate-400'
                        }
                      />
                    </button>
                  </div>

                  {outfit.notes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2">
                      "{outfit.notes}"
                    </p>
                  )}

                  {/* Multi-Item Visual Collage */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {constituentItems.map((item) => (
                      <div
                        key={item.id}
                        title={`${item.name} (${item.category})`}
                        className="h-24 rounded-xl bg-black/40 border border-white/10 p-1 flex flex-col items-center justify-between overflow-hidden shadow-inner"
                      >
                        <div className="w-full h-16 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="w-full text-center">
                          <span className="text-[9px] font-mono text-slate-400 block truncate px-1">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    {constituentItems.length} {constituentItems.length === 1 ? 'item' : 'items'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openScheduleAssignModal('Monday')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                    >
                      <Calendar size={13} />
                      <span>Assign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteOutfit(outfit.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Outfit"
                      aria-label="Delete Outfit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
