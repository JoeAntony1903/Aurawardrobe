import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Link2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { ALL_CATEGORIES, Category } from '../../types/wardrobe';

export const CategoryScreen: React.FC = () => {
  const { 
    items, 
    selectedCategory, 
    setSelectedCategory, 
    selectItem, 
    setIsUploadModalOpen 
  } = useWardrobe();

  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');

  // Filter items by category, search query, and season
  const categoryItems = items.filter((item) => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = seasonFilter === 'All' || item.season === seasonFilter || item.season === 'All-Season';
    return matchesCategory && matchesSearch && matchesSeason;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Taxonomy Structure
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs text-slate-400 font-mono">Curated Assets</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Wardrobe Taxonomy
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Browse pieces categorized by garment anatomy. Click any item to inspect and manage bi-directional pairs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add to {selectedCategory}</span>
        </button>
      </div>

      {/* Category Selector Tabs (Explicit requirement: Tops, Bottoms, Full-Body, Outerwear, Shoes, Accessories) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ALL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = items.filter((i) => i.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/10'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Specific notice for Accessories: simple gallery view */}
      {selectedCategory === 'Accessories' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-3 text-amber-300 text-xs">
          <Info size={16} className="shrink-0" />
          <span>
            <strong>Accessories Taxonomy:</strong> Simple gallery view. Accessories serve as universal accents across your wardrobe; downward pairing from accessories is disabled.
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${selectedCategory.toLowerCase()} by name, color, or brand...`}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Season:</span>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          >
            <option value="All">All Seasons</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="All-Season">All-Season</option>
          </select>
        </div>
      </div>

      {/* Grid of Items in Selected Category */}
      {categoryItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.03] border border-dashed border-white/10 text-center space-y-3">
          <Layers className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No items found in {selectedCategory}</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search query or season filter.' : `Your ${selectedCategory} bay is currently empty. Upload a piece to begin building outfits.`}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
          >
            Upload {selectedCategory} Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categoryItems.map((item) => {
            const pairCount = item.pairedItemIds.length;

            return (
              <div
                key={item.id}
                onClick={() => selectItem(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectItem(item.id);
                  }
                }}
                className="rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-4 flex flex-col justify-between shadow-xl hover:border-white/30 hover:scale-[1.01] transition-all cursor-pointer group space-y-3"
              >
                {/* Visual Garment Frame */}
                <div className="w-full h-52 rounded-2xl bg-black/40 border border-white/10 p-2 flex items-center justify-center overflow-hidden relative shadow-inner">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {pairCount > 0 && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-600/80 backdrop-blur-md text-white text-[10px] font-mono shadow">
                      <Link2 size={11} />
                      <span>{pairCount} {pairCount === 1 ? 'pair' : 'pairs'}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {item.brand} · {item.season}
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400">{item.color}</p>
                </div>

                {/* Footer strip */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">
                    {item.material || 'Premium Fabric'}
                  </span>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform font-medium">
                    Inspect &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
